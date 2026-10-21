import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { todayStr, statusFor } from "@/lib/time";

// Clock in (first press of the day) or clock out (second press).
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const workDate = todayStr();
  const now = new Date();
  const existing = await prisma.attendance.findUnique({
    where: { employeeId_workDate: { employeeId: user.id, workDate } },
  });

  // No record yet -> clock in.
  if (!existing || !existing.clockIn) {
    const status = statusFor(now, user.shift?.startTime);
    const rec = await prisma.attendance.upsert({
      where: { employeeId_workDate: { employeeId: user.id, workDate } },
      update: { clockIn: now, status },
      create: { employeeId: user.id, workDate, clockIn: now, status },
    });
    return NextResponse.json({ ok: true, action: "in", record: rec });
  }

  // Already clocked in, not out -> clock out.
  if (existing.clockIn && !existing.clockOut) {
    const rec = await prisma.attendance.update({
      where: { employeeId_workDate: { employeeId: user.id, workDate } },
      data: { clockOut: now },
    });
    return NextResponse.json({ ok: true, action: "out", record: rec });
  }

  return NextResponse.json({ error: "Already clocked out for today" }, { status: 400 });
}
