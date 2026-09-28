import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  EventAttendance,
  MemberAttendance,
  SpondEvent,
  SpondGroup,
  WeeklyTrendPoint,
} from "@/lib/spond/types";

function trendOverHalves(weeklyTrend: WeeklyTrendPoint[]): number | null {
  const withData = weeklyTrend.filter((w) => w.eventCount > 0);
  if (withData.length < 2) return null;
  const mid = Math.ceil(withData.length / 2);
  const firstHalf = withData.slice(0, mid);
  const secondHalf = withData.slice(mid);
  if (secondHalf.length === 0) return null;
  const avg = (points: WeeklyTrendPoint[]) =>
    points.reduce((sum, p) => sum + p.attendanceRate, 0) / points.length;
  return avg(secondHalf) - avg(firstHalf);
}

function TrendBadge({ delta }: { delta: number | null }) {
  if (delta === null) return null;
  const pct = Math.round(delta * 100);
  const up = pct >= 0;
  return (
    <Badge variant="outline">
      {up ? <TrendingUpIcon /> : <TrendingDownIcon />}
      {up ? "+" : ""}
      {pct} pp
    </Badge>
  );
}

export function StatCards({
  group,
  memberAttendance,
  eventAttendance,
  weeklyTrend,
  upcomingEvents,
  pastEvents,
}: {
  group: SpondGroup;
  memberAttendance: MemberAttendance[];
  eventAttendance: EventAttendance[];
  weeklyTrend: WeeklyTrendPoint[];
  upcomingEvents: SpondEvent[];
  pastEvents: SpondEvent[];
}) {
  const overallRate =
    memberAttendance.length > 0
      ? memberAttendance.reduce((sum, m) => sum + m.attendanceRate, 0) /
        memberAttendance.length
      : null;
  const trendDelta = trendOverHalves(weeklyTrend);
  const nextEvent = upcomingEvents[0] ?? null;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Snitt oppmøteprosent</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {overallRate !== null ? `${Math.round(overallRate * 100)}%` : "—"}
          </CardTitle>
          <CardAction>
            <TrendBadge delta={trendDelta} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 font-medium">
            Basert på {eventAttendance.length} arrangementer
          </div>
          <div className="text-muted-foreground">
            {memberAttendance.length} medlemmer med respons
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Medlemmer</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {group.members.length}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 font-medium">{group.name}</div>
          <div className="text-muted-foreground">
            Hentet direkte fra Spond
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Kommende arrangementer</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {upcomingEvents.length}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 font-medium">
            {nextEvent ? nextEvent.heading : "Ingenting planlagt"}
          </div>
          <div className="text-muted-foreground">
            {nextEvent
              ? new Date(nextEvent.startTimestamp).toLocaleDateString(
                  "nb-NO",
                  { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }
                )
              : "Ingen kommende dato"}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Arrangementer totalt</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {upcomingEvents.length + pastEvents.length}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 font-medium">
            {upcomingEvents.length} kommende · {pastEvents.length} tidligere
          </div>
          <div className="text-muted-foreground">Siste 25 hver vei</div>
        </CardFooter>
      </Card>
    </div>
  );
}
