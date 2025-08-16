import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const headers = request.headers.get("x-forwarded-for");
  const ip = headers?.split(",")[0]?.trim() || request.headers.get("x-real-ip");

  return NextResponse.json({ ip });
}
