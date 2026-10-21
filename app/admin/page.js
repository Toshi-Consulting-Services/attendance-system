import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Shell from "../components/Shell";

export const dynamic = "force-dynamic";

export default async function AdminEmployees() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/me");

  const employees = await prisma.employee.findMany({
    include: { department: true, shift: true },
    orderBy: { name: "asc" },
  });
  const departments = await prisma.department.findMany({ include: { employees: true } });
  const shifts = await prisma.shift.findMany();

  return (
    <Shell user={user} active="/admin">
      <div className="page-head">
        <h1>Employees</h1>
        <p>Master list of staff, departments and shifts. (HR / Admin view.)</p>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        <div className="card stat">
          <span className="num">{employees.length}</span>
          <span className="lbl">Employees</span>
        </div>
        <div className="card stat">
          <span className="num">{departments.length}</span>
          <span className="lbl">Departments</span>
        </div>
        <div className="card stat">
          <span className="num">{shifts.length}</span>
          <span className="lbl">Shifts</span>
        </div>
      </div>

      <div className="card">
        <div className="section-title">All employees</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Shift</th>
                <th>Leave bal.</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 600 }}>{e.name}</td>
                  <td className="muted">{e.email}</td>
                  <td>
                    <span className="badge b-leave">{e.role}</span>
                  </td>
                  <td>{e.department?.name || "—"}</td>
                  <td className="muted">{e.shift?.name || "—"}</td>
                  <td>{e.leaveBalance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
