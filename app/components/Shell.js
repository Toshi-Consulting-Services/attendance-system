import Link from "next/link";

// Server component: renders the top bar + role-aware nav around every page.
export default function Shell({ user, active, children }) {
  const links = [];
  if (user.role === "EMPLOYEE") {
    links.push({ href: "/me", label: "My Attendance" });
  }
  if (user.role === "MANAGER") {
    links.push({ href: "/team", label: "Team Board" });
    links.push({ href: "/me", label: "My Attendance" });
  }
  if (user.role === "ADMIN") {
    links.push({ href: "/admin", label: "Employees" });
    links.push({ href: "/admin/report", label: "Reports" });
    links.push({ href: "/team", label: "Team Board" });
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="logo">AT</span>
            <span>AttendTrack</span>
          </div>
          <nav className="nav">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={active === l.href ? "active" : ""}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="topbar-right">
            <div className="who">
              <div className="n">{user.name}</div>
              <div className="r">{user.role}</div>
            </div>
            <form action="/api/auth/logout" method="post">
              <button className="btn btn-ghost btn-sm" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}
