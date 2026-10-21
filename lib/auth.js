import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

// Password hashing using Node's built-in scrypt — no native dependency (bcrypt)
// needed, so it installs and runs cleanly on any laptop.

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, key] = stored.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derived = scryptSync(password, salt, 64);
  if (keyBuffer.length !== derived.length) return false;
  return timingSafeEqual(keyBuffer, derived);
}
