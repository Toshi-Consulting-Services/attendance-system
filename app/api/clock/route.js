import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { todayStr, statusFor } from "@/lib/time";

// Clock in / clock out, or undo the last clock action for today.
// Body: { action: "undo" } undoes; anything else toggles in -> out.
export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const workDate = todayStr();
  const now = new Date();
  const existing = await prisma.attendance.findUnique({
    where: { employeeId_workDate: { employeeId: user.id, workDate } },
  });

  // ---- Undo the most recent action ----
  if (body && body.action === "undo") {
    if (!existing || !existing.clockIn) {
      return NextResponse.json({ error: "Nothing to undo today" }, { status: 400 });
    }
    // If clocked out, reopen the day (clear the clock-out).
    if (existing.clockOut) {
      const rec = await prisma.attendance.update({
        where: { employeeId_workDate: { employeeId: user.id, workDate } },
        data: { clockOut: null },
      });
      return NextResponse.json({ ok: true, action: "undo-out", record: rec });
    }
    // Otherwise undo the clock-in entirely (back to "not in").
    await prisma.attendance.delete({
      where: { employeeId_workDate: { employeeId: user.id, workDate } },
    });
    return NextResponse.json({ ok: true, action: "undo-in", record: null });
  }

  // ---- No record yet -> clock in ----
  if (!existing || !existing.clockIn) {
    const status = statusFor(now, user.shift?.startTime);
    const rec = await prisma.attendance.upsert({
      where: { employeeId_workDate: { employeeId: user.id, workDate } },
      update: { clockIn: now, status },
      create: { employeeId: user.id, workDate, clockIn: now, status },
    });
    return NextResponse.json({ ok: true, action: "in", record: rec });
  }

  // ---- Clocked in, not out -> clock out ----
  if (existing.clockIn && !existing.clockOut) {
    const rec = await prisma.attendance.update({
      where: { employeeId_workDate: { employeeId: user.id, workDate } },
      data: { clockOut: now },
    });
    return NextResponse.json({ ok: true, action: "out", record: rec });
  }

  return NextResponse.json({ error: "Already clocked out for today" }, { status: 400 });
}
