"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DEMO = [
  { role: "HR / Admin", email: "admin@demo.com" },
  { role: "Manager", email: "manager@demo.com" },
  { role: "Employee", email: "employee@demo.com" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      router.push(data.home);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Login failed");
    }
  }

  function useDemo(demoEmail) {
    setEmail(demoEmail);
    setPassword("password");
  }

  return (
    <div className="login-wrap">
      <div className="card login-card">
        <div className="brand">
          <span className="logo">AT</span>
          <span>AttendTrack</span>
        </div>
        <h1 style={{ fontSize: "1.3rem", marginBottom: 4 }}>Sign in</h1>
        <p className="muted" style={{ marginTop: 0, marginBottom: 18, fontSize: "0.9rem" }}>
          Employee Attendance Management System
        </p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={submit}>
          <label className="field">
            <span className="lbl">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </label>
          <label className="field">
            <span className="lbl">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>
          <button className="btn btn-primary" type="submit" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="demo-chips">
          <div className="muted" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Demo accounts (click to fill · password: password)
          </div>
          {DEMO.map((d) => (
            <div key={d.email} className="demo-chip" onClick={() => useDemo(d.email)}>
              <span className="role">{d.role}</span>
              <span className="muted">{d.email}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
