import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Shell from "../../components/Shell";
import ReportControls from "./ReportControls";

export const dynamic = "force-dynamic";

export default async function ReportPage({ searchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/me");

  const month = searchParams?.month || new Date().toISOString().slice(0, 7);

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
    return { e, present, late, absent, total: present + late + absent };
  });

  const totals = rows.reduce(
    (acc, r) => ({
      present: acc.present + r.present,
      late: acc.late + r.late,
      absent: acc.absent + r.absent,
    }),
    { present: 0, late: 0, absent: 0 }
  );

  return (
    <Shell user={user} active="/admin/report">
      <div className="page-head">
        <div className="row-between">
          <div>
            <h1>Monthly Report</h1>
            <p>Attendance summary per employee. Export to CSV for payroll input.</p>
          </div>
          <ReportControls month={month} />
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        <div className="card stat">
          <span className="num" style={{ color: "var(--good)" }}>{totals.present}</span>
          <span className="lbl">Present days (all staff)</span>
        </div>
        <div className="card stat">
          <span className="num" style={{ color: "var(--warn)" }}>{totals.late}</span>
          <span className="lbl">Late days</span>
        </div>
        <div className="card stat">
          <span className="num" style={{ color: "var(--bad)" }}>{totals.absent}</span>
          <span className="lbl">Absent days</span>
        </div>
      </div>

      <div className="card">
        <div className="section-title">{month} — per employee</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Present</th>
                <th>Late</th>
                <th>Absent</th>
                <th>Working days</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.e.id}>
                  <td style={{ fontWeight: 600 }}>{r.e.name}</td>
                  <td className="muted">{r.e.department?.name || "—"}</td>
                  <td>{r.present}</td>
                  <td>{r.late}</td>
                  <td>{r.absent}</td>
                  <td>{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
