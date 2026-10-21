import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// Manager or Admin approves / rejects a leave request.
export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (user.role !== "MANAGER" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { decision } = await request.json().catch(() => ({}));
  if (!["APPROVED", "REJECTED"].includes(decision)) {
    return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
  }

  const id = Number(params.id);
  const leave = await prisma.leaveRequest.findUnique({ where: { id } });
  if (!leave) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.leaveRequest.update({
    where: { id },
    data: { status: decision },
  });

  // On approval, deduct one day per calendar day from the employee's balance.
  if (decision === "APPROVED" && leave.status !== "APPROVED") {
    const days =
      Math.round((new Date(leave.toDate) - new Date(leave.fromDate)) / 86400000) + 1;
    await prisma.employee.update({
      where: { id: leave.employeeId },
      data: { leaveBalance: { decrement: Math.max(1, days) } },
    });
  }

  return NextResponse.json({ ok: true, leave: updated });
}
