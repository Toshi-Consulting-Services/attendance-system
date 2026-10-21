"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function fmt(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function ClockCard({ today, shift }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const clockIn = today?.clockIn;
  const clockOut = today?.clockOut;

  const phase = !clockIn ? "in" : !clockOut ? "out" : "done";

  async function press() {
    setBusy(true);
    const res = await fetch("/api/clock", { method: "POST" });
    setBusy(false);
    if (res.ok) router.refresh();
    else {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Something went wrong");
    }
  }

  const statusBadge = today?.status ? (
    <span className={"badge b-" + today.status.toLowerCase()}>{today.status}</span>
  ) : (
    <span className="badge b-absent">NOT IN</span>
  );

  return (
    <div className="card">
      <div className="row-between" style={{ marginBottom: 14 }}>
        <div className="section-title" style={{ margin: 0 }}>
          Today
        </div>
        {statusBadge}
      </div>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        <div className="stat">
          <span className="num">{fmt(clockIn)}</span>
          <span className="lbl">Clock in</span>
        </div>
        <div className="stat">
          <span className="num">{fmt(clockOut)}</span>
          <span className="lbl">Clock out</span>
        </div>
      </div>

      {phase === "in" && (
        <button className="btn btn-primary" style={{ width: "100%" }} onClick={press} disabled={busy}>
          {busy ? "…" : "Clock in"}
        </button>
      )}
      {phase === "out" && (
        <button className="btn btn-good" style={{ width: "100%" }} onClick={press} disabled={busy}>
          {busy ? "…" : "Clock out"}
        </button>
      )}
      {phase === "done" && (
        <button className="btn btn-ghost" style={{ width: "100%" }} disabled>
          Done for today
        </button>
      )}

      <p className="muted" style={{ fontSize: "0.82rem", marginTop: 12, marginBottom: 0 }}>
        Your shift: {shift ? `${shift.name}` : "not assigned"}. Clocking in after the start time
        (plus a 5-minute grace) is marked <strong>Late</strong>.
      </p>
    </div>
  );
}
