// Seeds the database with demo departments, shifts, employees and ~30 days of
// attendance + a few leave requests, so every screen looks full on first open.

const { PrismaClient } = require("@prisma/client");
const { scryptSync, randomBytes } = require("crypto");

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function dateStr(d) {
  return d.toISOString().slice(0, 10);
}

async function main() {
  // Clean slate (order matters for FKs).
  await prisma.leaveRequest.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.department.deleteMany();

  // Departments
  const hr = await prisma.department.create({ data: { name: "Human Resources" } });
  const eng = await prisma.department.create({ data: { name: "Engineering" } });
  const sales = await prisma.department.create({ data: { name: "Sales" } });
  const support = await prisma.department.create({ data: { name: "IT Support" } });

  // Shifts
  const general = await prisma.shift.create({
    data: { name: "General (09:00–17:00)", startTime: "09:00", endTime: "17:00" },
  });
  const early = await prisma.shift.create({
    data: { name: "Early (08:00–16:00)", startTime: "08:00", endTime: "16:00" },
  });

  const pw = hashPassword("password");

  // Core demo accounts (one per role) + extra employees for a full board.
  const people = [
    { name: "Asha Verma", email: "admin@demo.com", role: "ADMIN", dept: hr.id, shift: general.id },
    { name: "Ravi Menon", email: "manager@demo.com", role: "MANAGER", dept: eng.id, shift: general.id },
    { name: "Priya Shah", email: "employee@demo.com", role: "EMPLOYEE", dept: eng.id, shift: general.id },
    { name: "Arjun Nair", email: "arjun@demo.com", role: "EMPLOYEE", dept: eng.id, shift: general.id },
    { name: "Neha Kapoor", email: "neha@demo.com", role: "EMPLOYEE", dept: sales.id, shift: early.id },
    { name: "Imran Qureshi", email: "imran@demo.com", role: "EMPLOYEE", dept: support.id, shift: general.id },
    { name: "Divya Rao", email: "divya@demo.com", role: "EMPLOYEE", dept: sales.id, shift: early.id },
    { name: "Karan Bhatt", email: "karan@demo.com", role: "EMPLOYEE", dept: eng.id, shift: general.id },
  ];

  const created = [];
  for (const p of people) {
    const e = await prisma.employee.create({
      data: {
        name: p.name,
        email: p.email,
        passwordHash: pw,
        role: p.role,
        departmentId: p.dept,
        shiftId: p.shift,
        leaveBalance: 12,
      },
    });
    created.push({ ...e, shiftStart: p.shift === early.id ? "08:00" : "09:00" });
  }

  // ~30 days of attendance history for each employee.
  const today = new Date();
  for (let back = 30; back >= 0; back--) {
    const day = new Date(today);
    day.setDate(day.getDate() - back);
    const dow = day.getDay();
    if (dow === 0 || dow === 6) continue; // skip weekends

    for (const e of created) {
      // Leave the demo employee with no record for today, so a live
      // "clock in" can be demonstrated from a clean state.
      if (back === 0 && e.email === "employee@demo.com") continue;

      const roll = Math.random();
      let status = "PRESENT";
      let clockIn = null;
      let clockOut = null;

      if (roll < 0.06) {
        status = "ABSENT";
      } else if (roll < 0.22) {
        status = "LATE";
      } else {
        status = "PRESENT";
      }

      if (status !== "ABSENT") {
        const [sh, sm] = e.shiftStart.split(":").map(Number);
        const inTime = new Date(day);
        if (status === "LATE") {
          inTime.setHours(sh, sm + 20 + Math.floor(Math.random() * 40), 0, 0);
        } else {
          inTime.setHours(sh, Math.floor(Math.random() * 6) - 3, 0, 0);
        }
        const outTime = new Date(day);
        outTime.setHours(sh + 8, Math.floor(Math.random() * 20), 0, 0);
        clockIn = inTime;
        // Don't set clock-out for today, so "clock out" is demoable live.
        clockOut = back === 0 ? null : outTime;
      }

      await prisma.attendance.create({
        data: {
          employeeId: e.id,
          workDate: dateStr(day),
          status,
          clockIn,
          clockOut,
        },
      });
    }
  }

  // A couple of leave requests (one pending for the manager to action).
  const emp = created.find((c) => c.email === "employee@demo.com");
  const neha = created.find((c) => c.email === "neha@demo.com");
  const fut = new Date(today);
  fut.setDate(fut.getDate() + 3);
  const fut2 = new Date(today);
  fut2.setDate(fut2.getDate() + 4);

  await prisma.leaveRequest.create({
    data: {
      employeeId: emp.id,
      fromDate: dateStr(fut),
      toDate: dateStr(fut2),
      type: "CASUAL",
      reason: "Family function",
      status: "PENDING",
    },
  });
  await prisma.leaveRequest.create({
    data: {
      employeeId: neha.id,
      fromDate: dateStr(new Date(today.getTime() - 5 * 86400000)),
      toDate: dateStr(new Date(today.getTime() - 5 * 86400000)),
      type: "SICK",
      reason: "Fever",
      status: "APPROVED",
    },
  });

  console.log("Seeded " + created.length + " employees and ~1 month of attendance.");
  console.log("\nDemo logins (password for all: 'password'):");
  console.log("  Admin/HR : admin@demo.com");
  console.log("  Manager  : manager@demo.com");
  console.log("  Employee : employee@demo.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
