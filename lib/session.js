import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "./prisma";

// Minimal signed-cookie session. The cookie holds the employee id plus an
// HMAC signature, so it cannot be forged without the SESSION_SECRET.

const COOKIE_NAME = "att_session";
const SECRET = process.env.SESSION_SECRET || "dev-secret";

function sign(value) {
  return createHmac("sha256", SECRET).update(value).digest("hex");
}

export function createSessionValue(userId) {
  const value = String(userId);
  return `${value}.${sign(value)}`;
}

export function readSessionValue(raw) {
  if (!raw || !raw.includes(".")) return null;
  const [value, sig] = raw.split(".");
  const expected = sign(value);
  if (sig.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  return value;
}

// Server-side: returns the logged-in employee, or null.
export async function getCurrentUser() {
  const raw = cookies().get(COOKIE_NAME)?.value;
  const userId = readSessionValue(raw);
  if (!userId) return null;
  const user = await prisma.employee.findUnique({
    where: { id: Number(userId) },
    include: { department: true, shift: true },
  });
  return user;
}

export const SESSION_COOKIE = COOKIE_NAME;
