import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// Employee submits a new leave request.
export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { fromDate, toDate, type, reason } = await request.json().catch(() => ({}));
  if (!fromDate || !toDate) {
    return NextResponse.json({ error: "From and to dates are required" }, { status: 400 });
  }
  if (toDate < fromDate) {
    return NextResponse.json({ error: "End date cannot be before start date" }, { status: 400 });
  }

  const leave = await prisma.leaveRequest.create({
    data: {
      employeeId: user.id,
      fromDate,
      toDate,
      type: type || "CASUAL",
      reason: reason || "",
      status: "PENDING",
    },
  });
  return NextResponse.json({ ok: true, leave });
}
