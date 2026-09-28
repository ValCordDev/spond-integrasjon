"use client";

import { useEffect, useState } from "react";
import { AlertCircleIcon } from "lucide-react";

import { AppSidebar } from "@/components/spond/AppSidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCards } from "@/components/spond/StatCards";
import { AttendanceTrendChart } from "@/components/spond/AttendanceTrendChart";
import { EventsTable } from "@/components/spond/EventsTable";
import type {
  EventAttendance,
  MemberAttendance,
  SpondEvent,
  SpondGroup,
  SpondProfile,
  WeeklyTrendPoint,
} from "@/lib/spond/types";

interface StatsResponse {
  memberAttendance: MemberAttendance[];
  eventAttendance: EventAttendance[];
  weeklyTrend: WeeklyTrendPoint[];
}

interface EventsData {
  upcoming: SpondEvent[];
  past: SpondEvent[];
}

async function fetchJson<T>(url: string, key: string): Promise<T> {
  const res = await fetch(url);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data[key] as T;
}

export function Dashboard() {
  const [groups, setGroups] = useState<SpondGroup[] | null>(null);
  const [groupId, setGroupId] = useState<string>("");
  const [profile, setProfile] = useState<SpondProfile | null>(null);
  const [statsState, setStatsState] = useState<{
    groupId: string;
    data: StatsResponse;
  } | null>(null);
  const [eventsState, setEventsState] = useState<{
    groupId: string;
    data: EventsData;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/spond/groups")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setGroups(data.groups ?? []);
        if (data.groups?.[0]) setGroupId(data.groups[0].id);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));

    fetch("/api/spond/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        setProfile(data.profile ?? null);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!groupId) return;
    let cancelled = false;
    fetch(`/api/spond/stats?groupId=${encodeURIComponent(groupId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) throw new Error(data.error);
        setStatsState({ groupId, data });
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [groupId]);

  useEffect(() => {
    if (!groupId) return;
    let cancelled = false;
    const nowIso = new Date().toISOString();
    const params = new URLSearchParams({ groupId, max: "25" });
    const upcomingParams = new URLSearchParams(params);
    upcomingParams.set("minStart", nowIso);
    const pastParams = new URLSearchParams(params);
    pastParams.set("maxStart", nowIso);

    Promise.all([
      fetchJson<SpondEvent[]>(
        `/api/spond/events?${upcomingParams.toString()}`,
        "events"
      ),
      fetchJson<SpondEvent[]>(
        `/api/spond/events?${pastParams.toString()}`,
        "events"
      ),
    ])
      .then(([upcoming, past]) => {
        if (cancelled) return;
        upcoming.sort((a, b) => a.startTimestamp.localeCompare(b.startTimestamp));
        past.sort((a, b) => b.startTimestamp.localeCompare(a.startTimestamp));
        setEventsState({ groupId, data: { upcoming, past } });
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [groupId]);

  const stats = statsState?.groupId === groupId ? statsState.data : null;
  const events = eventsState?.groupId === groupId ? eventsState.data : null;
  const selectedGroup = groups?.find((g) => g.id === groupId) ?? null;
  const loading =
    groupId !== "" && (stats === null || events === null) && error === null;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant="inset"
        groups={groups ?? []}
        groupId={groupId}
        onGroupChange={setGroupId}
        profile={profile}
      />
      <SidebarInset>
        <SiteHeader title={selectedGroup?.name ?? "Spond-oversikt"} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {error && (
                <div className="px-4 lg:px-6">
                  <Alert variant="destructive">
                    <AlertCircleIcon />
                    <AlertTitle>Klarte ikke å hente data fra Spond</AlertTitle>
                    <AlertDescription>
                      <p>{error}</p>
                      <p>
                        Sjekk at SPOND_EMAIL og SPOND_PASSWORD er satt (se
                        .env.example).
                      </p>
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {!error && !groups && (
                <div className="flex flex-col gap-4 px-4 lg:px-6">
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              )}

              {!error && groups && groups.length === 0 && (
                <p className="px-4 text-sm text-muted-foreground lg:px-6">
                  Fant ingen Spond-grupper for denne kontoen.
                </p>
              )}

              {!error && loading && (
                <div className="flex flex-col gap-4 px-4 lg:px-6">
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              )}

              {!error && stats && events && selectedGroup && !loading && (
                <>
                  <StatCards
                    group={selectedGroup}
                    memberAttendance={stats.memberAttendance}
                    eventAttendance={stats.eventAttendance}
                    weeklyTrend={stats.weeklyTrend}
                    upcomingEvents={events.upcoming}
                    pastEvents={events.past}
                  />

                  <div className="px-4 lg:px-6">
                    <AttendanceTrendChart data={stats.weeklyTrend} />
                  </div>

                  <EventsTable
                    upcoming={events.upcoming}
                    past={events.past}
                    members={selectedGroup.members}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
