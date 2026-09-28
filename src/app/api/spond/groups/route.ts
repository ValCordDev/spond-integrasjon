import { NextResponse } from "next/server";
import { getGroups } from "@/lib/spond/client";

export async function GET() {
  try {
    const groups = await getGroups();
    return NextResponse.json({ groups });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
