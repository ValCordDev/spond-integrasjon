import "server-only";
import type {
  GetEventsParams,
  SpondEvent,
  SpondGroup,
  SpondLoginResponse,
  SpondProfile,
} from "./types";

const API_BASE_URL = "https://api.spond.com/core/v1/";

// Refresh this many ms before actual expiry, so we never hand out a token
// that dies mid-request.
const EXPIRY_SAFETY_MARGIN_MS = 5 * 60 * 1000;

class SpondAuthError extends Error {}

/**
 * Module-scoped token cache.
 *
 * Spond's unofficial API has no working refresh-token endpoint (the
 * `refreshToken` field returned at login isn't consumed by any known
 * client) — the only documented way to get a new access token is to log
 * in again with email/password. So "automatic refresh" here means: cache
 * the access token + its expiry, and transparently re-login whenever it's
 * missing, about to expire, or a request comes back 401.
 *
 * This module-level cache survives across requests within the same warm
 * serverless/Fluid Compute instance, so most requests don't pay for a
 * fresh login. It does NOT persist across cold starts or instances — that
 * would need an external store (e.g. Redis/KV), which isn't needed here
 * since re-login is cheap and infrequent (roughly once a day per instance).
 */
let cachedToken: { token: string; expiresAt: number } | null = null;
let inFlightLogin: Promise<string> | null = null;

function getCredentials(): { email: string; password: string } {
  const email = process.env.SPOND_EMAIL;
  const password = process.env.SPOND_PASSWORD;
  if (!email || !password) {
    throw new SpondAuthError(
      "SPOND_EMAIL and SPOND_PASSWORD must be set (see .env.example)."
    );
  }
  return { email, password };
}

async function login(): Promise<string> {
  const { email, password } = getCredentials();

  const res = await fetch(`${API_BASE_URL}auth2/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new SpondAuthError(
      `Spond login failed (${res.status}): ${await res.text()}`
    );
  }

  const data = (await res.json()) as SpondLoginResponse;
  const token = data.accessToken?.token;
  if (!token) {
    throw new SpondAuthError("Spond login response had no accessToken.");
  }

  const expiresAt = data.accessToken.expiration
    ? new Date(data.accessToken.expiration).getTime()
    : Date.now() + 24 * 60 * 60 * 1000; // fall back to ~1 day if unset

  cachedToken = { token, expiresAt };
  return token;
}

/** Returns a valid access token, logging in (or re-logging in) as needed. */
async function getToken(forceRefresh = false): Promise<string> {
  if (
    !forceRefresh &&
    cachedToken &&
    cachedToken.expiresAt - EXPIRY_SAFETY_MARGIN_MS > Date.now()
  ) {
    return cachedToken.token;
  }

  if (forceRefresh) {
    cachedToken = null;
  }

  // Coalesce concurrent callers into a single login request.
  if (!inFlightLogin) {
    inFlightLogin = login().finally(() => {
      inFlightLogin = null;
    });
  }
  return inFlightLogin;
}

async function spondFetch<T>(
  path: string,
  init: RequestInit = {},
  retry = true
): Promise<T> {
  const token = await getToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      ...init.headers,
    },
    cache: "no-store",
  });

  if (res.status === 401 && retry) {
    // Token expired earlier than we expected server-side; force a fresh
    // login once and retry, instead of surfacing a spurious auth error.
    await getToken(true);
    return spondFetch<T>(path, init, false);
  }

  if (!res.ok) {
    throw new Error(`Spond API error ${res.status} for ${path}: ${await res.text()}`);
  }

  return res.json() as Promise<T>;
}

function toTimestamp(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

export async function getProfile(): Promise<SpondProfile> {
  return spondFetch<SpondProfile>("profile");
}

export async function getGroups(): Promise<SpondGroup[]> {
  return spondFetch<SpondGroup[]>("groups/");
}

export async function getEvents(
  params: GetEventsParams = {}
): Promise<SpondEvent[]> {
  const query = new URLSearchParams();
  query.set("max", String(params.max ?? 100));
  query.set("scheduled", String(params.includeScheduled ?? false));
  query.set("includeHidden", String(params.includeHidden ?? false));
  if (params.groupId) query.set("groupId", params.groupId);
  if (params.subgroupId) query.set("subGroupId", params.subgroupId);
  if (params.minStart) query.set("minStartTimestamp", toTimestamp(params.minStart));
  if (params.maxStart) query.set("maxStartTimestamp", toTimestamp(params.maxStart));
  if (params.minEnd) query.set("minEndTimestamp", toTimestamp(params.minEnd));
  if (params.maxEnd) query.set("maxEndTimestamp", toTimestamp(params.maxEnd));

  return spondFetch<SpondEvent[]>(`sponds/?${query.toString()}`);
}
