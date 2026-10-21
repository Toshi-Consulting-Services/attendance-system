import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { todayStr, fmtTime } from "@/lib/time";
import Shell from "../components/Shell";
import LeaveActions from "./LeaveActions";

export const dynamic = "force-dynamic";

export default async function TeamBoard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "EMPLOYEE") redirect("/me");

  const workDate = todayStr();

  // All employees (excluding admins) with today's attendance.
  const employees = await prisma.employee.findMany({
    where: { role: { in: ["EMPLOYEE", "MANAGER"] } },
    include: { department: true, shift: true },
    orderBy: { name: "asc" },
  });

  const todays = await prisma.attendance.findMany({ where: { workDate } });
  const byEmp = {};
  todays.forEach((t) => (byEmp[t.employeeId] = t));

  const rows = employees.map((e) => ({ e, a: byEmp[e.id] }));
  const presentCount = rows.filter((r) => r.a && r.a.status === "PRESENT").length;
  const lateCount = rows.filter((r) => r.a && r.a.status === "LATE").length;
  const outCount = rows.filter((r) => !r.a || r.a.status === "ABSENT").length;

  const pending = await prisma.leaveRequest.findMany({
    where: { status: "PENDING" },
    include: { employee: true },
    orderBy: { createdAt: "desc" },
  });

  function liveStatus(a) {
    if (!a || !a.clockIn) return { cls: "b-absent", label: "NOT IN" };
    if (a.status === "LATE" && !a.clockOut) return { cls: "b-late", label: "LATE · IN" };
    if (a.clockOut) return { cls: "b-leave", label: "CLOCKED OUT" };
    return { cls: "b-present", label: "PRESENT" };
  }

  return (
    <Shell user={user} active="/team">
      <div className="page-head">
        <h1>Team Board</h1>
        <p>Live attendance for {workDate}. Who is in, who is late, who hasn't shown up.</p>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <div className="card stat">
          <span className="num">{rows.length}</span>
          <span className="lbl">Team members</span>
        </div>
        <div className="card stat">
          <span className="num" style={{ color: "var(--good)" }}>{presentCount}</span>
          <span className="lbl">Present</span>
        </div>
        <div className="card stat">
          <span className="num" style={{ color: "var(--warn)" }}>{lateCount}</span>
          <span className="lbl">Late</span>
        </div>
        <div className="card stat">
          <span className="num" style={{ color: "var(--bad)" }}>{outCount}</span>
          <span className="lbl">Absent / not in</span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="section-title">Today — live</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Shift</th>
                <th>In</th>
                <th>Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ e, a }) => {
                const s = liveStatus(a);
                return (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 600 }}>{e.name}</td>
                    <td className="muted">{e.department?.name || "—"}</td>
                    <td className="muted">{e.shift?.startTime || "—"}</td>
                    <td>{fmtTime(a?.clockIn)}</td>
                    <td>{fmtTime(a?.clockOut)}</td>
                    <td>
                      <span className={"badge " + s.cls}>{s.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Pending leave requests</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>From</th>
                <th>To</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pending.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty">No pending requests</td>
                </tr>
              )}
              {pending.map((l) => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 600 }}>{l.employee.name}</td>
                  <td>{l.fromDate}</td>
                  <td>{l.toDate}</td>
                  <td>{l.type}</td>
                  <td className="muted">{l.reason || "—"}</td>
                  <td>
                    <LeaveActions id={l.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
