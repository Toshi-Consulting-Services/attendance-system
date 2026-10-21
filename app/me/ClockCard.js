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
  const [confirming, setConfirming] = useState(false);
  const clockIn = today?.clockIn;
  const clockOut = today?.clockOut;

  const phase = !clockIn ? "in" : !clockOut ? "out" : "done";
  const canUndo = !!clockIn; // something was recorded today that can be reversed

  async function commit() {
    setBusy(true);
    const res = await fetch("/api/clock", { method: "POST" });
    setBusy(false);
    setConfirming(false);
    if (res.ok) router.refresh();
    else {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Something went wrong");
    }
  }

  async function undo() {
    setBusy(true);
    const res = await fetch("/api/clock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "undo" }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Could not undo");
    }
  }

  const statusBadge = today?.status ? (
    <span className={"badge b-" + today.status.toLowerCase()}>{today.status}</span>
  ) : (
    <span className="badge b-absent">NOT IN</span>
  );

  const actionLabel = phase === "in" ? "Clock in" : "Clock out";
  const undoLabel = clockOut ? "Undo clock-out" : "Undo clock-in";

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

      {/* Primary action with a confirm step so an accidental click isn't committed */}
      {phase !== "done" &&
        (!confirming ? (
          <button
            className={"btn " + (phase === "in" ? "btn-primary" : "btn-good")}
            style={{ width: "100%" }}
            onClick={() => setConfirming(true)}
            disabled={busy}
          >
            {actionLabel}
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="muted" style={{ fontSize: "0.85rem", textAlign: "center" }}>
              Confirm {actionLabel.toLowerCase()}?
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className={"btn " + (phase === "in" ? "btn-primary" : "btn-good")}
                style={{ flex: 1 }}
                onClick={commit}
                disabled={busy}
              >
                {busy ? "…" : "Yes, " + actionLabel.toLowerCase()}
              </button>
              <button className="btn btn-ghost" onClick={() => setConfirming(false)} disabled={busy}>
                Cancel
              </button>
            </div>
          </div>
        ))}

      {phase === "done" && (
        <button className="btn btn-ghost" style={{ width: "100%" }} disabled>
          Done for today
        </button>
      )}

      {/* Undo the last action — fixes accidental clicks */}
      {canUndo && !confirming && (
        <button
          className="btn btn-ghost btn-sm"
          style={{ width: "100%", marginTop: 10 }}
          onClick={undo}
          disabled={busy}
        >
          ↩ {undoLabel}
        </button>
      )}

      <p className="muted" style={{ fontSize: "0.82rem", marginTop: 12, marginBottom: 0 }}>
        Your shift: {shift ? `${shift.name}` : "not assigned"}. Clocking in after the start time
        (plus a 5-minute grace) is marked <strong>Late</strong>. Clicked by mistake? Use{" "}
        <strong>Undo</strong>.
      </p>
    </div>
  );
}
