This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app), integrated with [Spond](https://www.spond.com/) to show events, members and attendance statistics.

## Spond integration

Spond has no official public API. This app talks to their unofficial,
reverse-engineered API (`https://api.spond.com/core/v1/`), the same one used
by community projects like [Olen/Spond](https://github.com/Olen/Spond) and
[martcl/spond](https://github.com/martcl/spond). Because it's unofficial, it
can change without notice.

**Auth & token refresh:** there is no working refresh-token endpoint — none
of the known community clients use the `refreshToken` Spond's login response
returns. The only reliable way to get a valid access token is to log in again
with email + password, so that's what this app automates: `src/lib/spond/client.ts`
caches the access token + its expiry, transparently logs in again whenever
the cached token is missing, close to expiring, or a request comes back
`401`. You never have to touch tokens by hand — just keep `SPOND_EMAIL` /
`SPOND_PASSWORD` set.

Setup:

1. Copy `.env.example` to `.env.local` and fill in the email/password of a
   Spond account that's a member of the group(s) you want data for.
2. For production, set the same two variables in your Vercel project's
   environment variables (never commit real credentials — `.env*` is
   gitignored).

What's included:

- `src/lib/spond/client.ts` — the Spond API client (server-only; credentials
  never reach the browser).
- `src/lib/spond/stats.ts` — computes attendance-rate-per-member,
  attendance-per-event, and a weekly attendance trend from raw event data.
- `src/app/api/spond/{groups,events,stats,profile}/route.ts` — server-side
  API routes the dashboard calls.
- `src/app/page.tsx` + `src/components/spond/` — a [shadcn/ui](https://ui.shadcn.com)
  dashboard (sidebar with a group switcher, stat cards, an attendance trend
  chart, and an events table with per-event attendee breakdowns in a side
  sheet). UI primitives live in `src/components/ui/` (owned source, not a
  package — see `components.json` for config) and are always dark mode by
  default (`dark` class on `<html>` in `src/app/layout.tsx`).

Since Spond's response shapes aren't officially documented, `src/lib/spond/types.ts`
models the fields community projects have confirmed (event `responses.acceptedIds`
/ `declinedIds` / `unansweredIds`, group `members`, etc.) but stays loose
(`[key: string]: unknown`) so unexpected fields don't break parsing — worth
double-checking against real responses from your account once you have
credentials in place.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
