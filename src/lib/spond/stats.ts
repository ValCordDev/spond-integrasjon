import "server-only";
import type {
  EventAttendance,
  MemberAttendance,
  SpondEvent,
  SpondGroup,
  SpondMember,
  WeeklyTrendPoint,
} from "./types";

function memberName(member: SpondMember | undefined, fallbackId: string): string {
  if (!member) return fallbackId;
  const name = [member.firstName, member.lastName].filter(Boolean).join(" ");
  return name || fallbackId;
}

function startOfWeekIso(dateStr: string): string {
  const d = new Date(dateStr);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}

/** Per-member attendance across the given events (past events only make sense here). */
export function computeMemberAttendance(
  events: SpondEvent[],
  group: SpondGroup
): MemberAttendance[] {
  const membersById = new Map(group.members.map((m) => [m.id, m]));
  const totals = new Map<
    string,
    { accepted: number; declined: number; unanswered: number; totalInvited: number }
  >();

  for (const event of events) {
    if (event.cancelled) continue;
    const r = event.responses ?? {};
    const accepted = r.acceptedIds ?? [];
    const declined = r.declinedIds ?? [];
    const unanswered = r.unansweredIds ?? [];

    for (const id of accepted) bump(totals, id, "accepted");
    for (const id of declined) bump(totals, id, "declined");
    for (const id of unanswered) bump(totals, id, "unanswered");
  }

  return Array.from(totals.entries())
    .map(([memberId, t]) => {
      const totalInvited = t.accepted + t.declined + t.unanswered;
      return {
        memberId,
        name: memberName(membersById.get(memberId), memberId),
        accepted: t.accepted,
        declined: t.declined,
        unanswered: t.unanswered,
        totalInvited,
        attendanceRate: totalInvited > 0 ? t.accepted / totalInvited : 0,
      };
    })
    .sort((a, b) => b.attendanceRate - a.attendanceRate);
}

function bump(
  totals: Map<
    string,
    { accepted: number; declined: number; unanswered: number; totalInvited: number }
  >,
  id: string,
  field: "accepted" | "declined" | "unanswered"
) {
  const entry = totals.get(id) ?? {
    accepted: 0,
    declined: 0,
    unanswered: 0,
    totalInvited: 0,
  };
  entry[field] += 1;
  totals.set(id, entry);
}

/** Per-event accepted/declined/unanswered counts, most recent first. */
export function computeEventAttendance(events: SpondEvent[]): EventAttendance[] {
  return events
    .filter((e) => !e.cancelled)
    .map((e) => {
      const r = e.responses ?? {};
      const accepted = r.acceptedIds?.length ?? 0;
      const declined = r.declinedIds?.length ?? 0;
      const unanswered = r.unansweredIds?.length ?? 0;
      return {
        eventId: e.id,
        heading: e.heading,
        startTimestamp: e.startTimestamp,
        accepted,
        declined,
        unanswered,
        totalInvited: accepted + declined + unanswered,
      };
    })
    .sort((a, b) => a.startTimestamp.localeCompare(b.startTimestamp));
}

/** Weekly attendance trend, bucketed by the Monday of each event's week. */
export function computeWeeklyTrend(events: SpondEvent[]): WeeklyTrendPoint[] {
  const buckets = new Map<
    string,
    { eventCount: number; accepted: number; declined: number; unanswered: number }
  >();

  for (const e of events) {
    if (e.cancelled || !e.startTimestamp) continue;
    const week = startOfWeekIso(e.startTimestamp);
    const r = e.responses ?? {};
    const entry = buckets.get(week) ?? {
      eventCount: 0,
      accepted: 0,
      declined: 0,
      unanswered: 0,
    };
    entry.eventCount += 1;
    entry.accepted += r.acceptedIds?.length ?? 0;
    entry.declined += r.declinedIds?.length ?? 0;
    entry.unanswered += r.unansweredIds?.length ?? 0;
    buckets.set(week, entry);
  }

  return Array.from(buckets.entries())
    .map(([weekStart, b]) => {
      const total = b.accepted + b.declined + b.unanswered;
      return {
        weekStart,
        ...b,
        attendanceRate: total > 0 ? b.accepted / total : 0,
      };
    })
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}
