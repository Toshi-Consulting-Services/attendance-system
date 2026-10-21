"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LeaveForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ fromDate: "", toDate: "", type: "CASUAL", reason: "" });

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (res.ok) {
      setForm({ fromDate: "", toDate: "", type: "CASUAL", reason: "" });
      setOpen(false);
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Could not submit");
    }
  }

  if (!open) {
    return (
      <button className="btn btn-ghost btn-sm" onClick={() => setOpen(true)}>
        + Apply for leave
      </button>
    );
  }

  return (
    <form onSubmit={submit} style={{ marginTop: 14 }}>
      <div className="grid grid-2">
        <label className="field">
          <span className="lbl">From</span>
          <input type="date" value={form.fromDate} onChange={(e) => set("fromDate", e.target.value)} required />
        </label>
        <label className="field">
          <span className="lbl">To</span>
          <input type="date" value={form.toDate} onChange={(e) => set("toDate", e.target.value)} required />
        </label>
      </div>
      <label className="field">
        <span className="lbl">Type</span>
        <select value={form.type} onChange={(e) => set("type", e.target.value)}>
          <option value="CASUAL">Casual</option>
          <option value="SICK">Sick</option>
          <option value="EARNED">Earned</option>
        </select>
      </label>
      <label className="field">
        <span className="lbl">Reason</span>
        <input type="text" value={form.reason} onChange={(e) => set("reason", e.target.value)} placeholder="Short reason" />
      </label>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-primary btn-sm" type="submit" disabled={busy}>
          {busy ? "Submitting…" : "Submit request"}
        </button>
        <button className="btn btn-ghost btn-sm" type="button" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
