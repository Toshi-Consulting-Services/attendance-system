"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LeaveActions({ id }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function decide(decision) {
    setBusy(true);
    const res = await fetch(`/api/leave/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else alert("Could not update");
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button className="btn btn-good btn-sm" disabled={busy} onClick={() => decide("APPROVED")}>
        Approve
      </button>
      <button className="btn btn-bad btn-sm" disabled={busy} onClick={() => decide("REJECTED")}>
        Reject
      </button>
    </div>
  );
}
