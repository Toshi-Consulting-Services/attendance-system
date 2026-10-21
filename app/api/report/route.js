import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// Monthly attendance report. Returns CSV when ?format=csv, else JSON.
// Summarises present / late / absent days per employee for the given month.
export async function GET(request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);
  const format = searchParams.get("format");

  const employees = await prisma.employee.findMany({
    include: { department: true },
    orderBy: { name: "asc" },
  });
  const records = await prisma.attendance.findMany({
    where: { workDate: { startsWith: month } },
  });

  const rows = employees.map((e) => {
    const recs = records.filter((r) => r.employeeId === e.id);
    const present = recs.filter((r) => r.status === "PRESENT").length;
    const late = recs.filter((r) => r.status === "LATE").length;
    const absent = recs.filter((r) => r.status === "ABSENT").length;
    return {
      name: e.name,
      department: e.department?.name || "",
      present,
      late,
      absent,
      total: present + late + absent,
    };
  });

  if (format === "csv") {
    const header = "Employee,Department,Present,Late,Absent,Working Days";
    const body = rows
      .map((r) => `${r.name},${r.department},${r.present},${r.late},${r.absent},${r.total}`)
      .join("\n");
    const csv = `${header}\n${body}\n`;
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="attendance-${month}.csv"`,
      },
    });
  }

  return NextResponse.json({ month, rows });
}
