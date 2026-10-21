"use client";

import { useRouter } from "next/navigation";

export default function ReportControls({ month }) {
  const router = useRouter();

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
      <label className="field" style={{ marginBottom: 0 }}>
        <span className="lbl">Month</span>
        <input
          type="month"
          defaultValue={month}
          onChange={(e) => router.push(`/admin/report?month=${e.target.value}`)}
          style={{ width: 180 }}
        />
      </label>
      <a className="btn btn-primary" href={`/api/report?month=${month}&format=csv`}>
        Export CSV
      </a>
    </div>
  );
}
