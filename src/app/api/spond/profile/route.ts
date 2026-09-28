import { NextResponse } from "next/server";
import { getProfile } from "@/lib/spond/client";

export async function GET() {
  try {
    const profile = await getProfile();
    return NextResponse.json({ profile });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
