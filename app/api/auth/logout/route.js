import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST(request) {
  // Behind a reverse proxy, request.url is the internal URL (e.g. localhost:3100),
  // so build the redirect from the forwarded host/proto headers instead.
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || new URL(request.url).protocol.replace(":", "");
  const base = host ? `${proto}://${host}` : new URL(request.url).origin;
  const res = NextResponse.redirect(`${base}/login`);
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
