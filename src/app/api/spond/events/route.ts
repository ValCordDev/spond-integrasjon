import { NextRequest, NextResponse } from "next/server";
import { getEvents } from "@/lib/spond/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId") ?? undefined;
  const max = searchParams.get("max");
  const minStart = searchParams.get("minStart") ?? undefined;
  const maxStart = searchParams.get("maxStart") ?? undefined;

  try {
    const events = await getEvents({
      groupId,
      max: max ? Number(max) : undefined,
      minStart,
      maxStart,
      includeScheduled: true,
    });
    return NextResponse.json({ events });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
