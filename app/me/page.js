import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { todayStr, fmtTime } from "@/lib/time";
import Shell from "../components/Shell";
import ClockCard from "./ClockCard";
import LeaveForm from "./LeaveForm";

export const dynamic = "force-dynamic";

export default async function MyAttendance() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workDate = todayStr();
  const today = await prisma.attendance.findUnique({
    where: { employeeId_workDate: { employeeId: user.id, workDate } },
  });

  const recent = await prisma.attendance.findMany({
    where: { employeeId: user.id },
    orderBy: { workDate: "desc" },
    take: 10,
  });

  const leaves = await prisma.leaveRequest.findMany({
    where: { employeeId: user.id },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  // This month's summary.
  const month = workDate.slice(0, 7);
  const monthRecords = await prisma.attendance.findMany({
    where: { employeeId: user.id, workDate: { startsWith: month } },
  });
  const present = monthRecords.filter((r) => r.status === "PRESENT").length;
  const late = monthRecords.filter((r) => r.status === "LATE").length;
  const absent = monthRecords.filter((r) => r.status === "ABSENT").length;

  return (
    <Shell user={user} active="/me">
      <div className="page-head">
        <h1>My Attendance</h1>
        <p>Welcome back, {user.name.split(" ")[0]}. Here is your attendance at a glance.</p>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 16, alignItems: "start" }}>
        <ClockCard today={today} shift={user.shift} />

        <div className="card">
          <div className="section-title">This month</div>
          <div className="grid grid-3">
            <div className="stat">
              <span className="num" style={{ color: "var(--good)" }}>{present}</span>
              <span className="lbl">Present</span>
            </div>
            <div className="stat">
              <span className="num" style={{ color: "var(--warn)" }}>{late}</span>
              <span className="lbl">Late</span>
            </div>
            <div className="stat">
              <span className="num" style={{ color: "var(--bad)" }}>{absent}</span>
              <span className="lbl">Absent</span>
            </div>
          </div>
          <p className="muted" style={{ fontSize: "0.85rem", marginBottom: 0, marginTop: 14 }}>
            Leave balance: <strong>{user.leaveBalance} days</strong>
          </p>
        </div>
      </div>

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <div className="card">
          <div className="section-title">Recent days</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>In</th>
                  <th>Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td>{r.workDate}</td>
                    <td>{fmtTime(r.clockIn)}</td>
                    <td>{fmtTime(r.clockOut)}</td>
                    <td>
                      <span className={"badge b-" + r.status.toLowerCase()}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="row-between">
            <div className="section-title" style={{ margin: 0 }}>My leave requests</div>
            <LeaveForm />
          </div>
          <div className="table-wrap" style={{ marginTop: 14 }}>
            <table>
              <thead>
                <tr>
                  <th>From</th>
                  <th>To</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty">No leave requests yet</td>
                  </tr>
                )}
                {leaves.map((l) => (
                  <tr key={l.id}>
                    <td>{l.fromDate}</td>
                    <td>{l.toDate}</td>
                    <td>{l.type}</td>
                    <td>
                      <span className={"badge b-" + l.status.toLowerCase()}>{l.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Shell>
  );
}
