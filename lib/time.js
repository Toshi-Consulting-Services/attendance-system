// Small date/time helpers shared across the app.

export function todayStr(d = new Date()) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export function fmtTime(dt) {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

// Compare a clock-in time against a shift start "HH:MM". Returns "LATE" or "PRESENT".
export function statusFor(clockIn, shiftStart) {
  if (!shiftStart) return "PRESENT";
  const d = new Date(clockIn);
  const [h, m] = shiftStart.split(":").map(Number);
  const start = new Date(d);
  start.setHours(h, m, 0, 0);
  // 5-minute grace period.
  start.setMinutes(start.getMinutes() + 5);
  return d > start ? "LATE" : "PRESENT";
}
