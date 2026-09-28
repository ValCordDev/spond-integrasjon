import { NextRequest, NextResponse } from "next/server";
import { getEvents, getGroups } from "@/lib/spond/client";
import {
  computeEventAttendance,
  computeMemberAttendance,
  computeWeeklyTrend,
} from "@/lib/spond/stats";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId");

  if (!groupId) {
    return NextResponse.json({ error: "groupId is required" }, { status: 400 });
  }

  try {
    const [groups, events] = await Promise.all([
      getGroups(),
      getEvents({ groupId, includeScheduled: true, max: 200 }),
    ]);

    const group = groups.find((g) => g.id === groupId);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    return NextResponse.json({
      memberAttendance: computeMemberAttendance(events, group),
      eventAttendance: computeEventAttendance(events),
      weeklyTrend: computeWeeklyTrend(events),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
