import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { createSessionValue, SESSION_COOKIE } from "@/lib/session";

export async function POST(request) {
  const { email, password } = await request.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const user = await prisma.employee.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const home = user.role === "ADMIN" ? "/admin" : user.role === "MANAGER" ? "/team" : "/me";
  const res = NextResponse.json({ ok: true, home });
  res.cookies.set(SESSION_COOKIE, createSessionValue(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
