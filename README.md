# Employee Attendance Management System

A working web application for recording employee attendance, managing leave, and
generating monthly reports. Built as a System Analysis & Design project for an
**ICT Support & System Analyst** role.

It has three user roles — **Employee**, **Manager**, and **HR / Admin** — each
with its own screens.

---

## What it does

- **Employee:** clock in / clock out, see own attendance history, apply for leave.
  The system automatically marks you *Present* or *Late* against your shift start time.
- **Manager:** a live Team Board showing who is present, late or absent today, and
  approve / reject leave requests.
- **HR / Admin:** a master list of employees, departments and shifts, plus a monthly
  report with a one-click **CSV export** for payroll.

---

## How to run it on your laptop

You need **Node.js** installed first (version 18 or newer).
Download it from https://nodejs.org (the "LTS" version). Install it, then restart
your computer.

Then open a terminal / command prompt **inside this folder** and run these commands
one at a time:

```bash
# 1. Install the pieces the app needs (one-time, takes a minute)
npm install

# 2. Create the database and fill it with demo data (one-time)
npm run setup

# 3. Start the app
npm run dev
```

Now open your web browser and go to:

```
http://localhost:3000
```

To stop the app, go back to the terminal and press **Ctrl + C**.

> To reset the demo data back to the start at any time, run `npm run seed`.

---

## Demo accounts

The password for all three is: **`password`**

| Role        | Email               |
|-------------|---------------------|
| HR / Admin  | admin@demo.com      |
| Manager     | manager@demo.com    |
| Employee    | employee@demo.com   |

On the login screen you can just **click a demo account** to fill it in, then press
Sign in.

---

## A simple 3-minute demo script

1. **Log in as the Employee** (`employee@demo.com`). Show the "Today" card says
   *Not in*. Click **Clock in** — watch the status change and the time appear.
   Then show the month summary, the recent-days history, and click **Apply for leave**
   to submit a request.
2. **Log in as the Manager** (`manager@demo.com`). Show the live **Team Board** —
   who is present / late / absent right now. Scroll to **Pending leave requests** and
   **Approve** the employee's request.
3. **Log in as HR / Admin** (`admin@demo.com`). Show the **Employees** list, then open
   **Reports**, pick a month, and click **Export CSV** to download the payroll file.

---

## The technology (for questions)

- **Next.js** — runs both the web pages and the backend logic in one app.
- **SQLite + Prisma** — a simple file-based database (no server to install).
- **Role-based login** — each role only sees its own screens; passwords are hashed.

The database design (ERD), data-flow diagrams and the full analysis are in the
accompanying presentation and blueprint document.

---

## Note on security

This is a **local demo** meant to run on one laptop at `http://localhost:3000`.
It is not hardened for public internet hosting. Do not deploy it to a public server
without adding HTTPS, stronger session security, and updating dependencies.

## Project structure

```
prisma/schema.prisma   the database design (the ERD, in code form)
prisma/seed.js         demo data (employees + a month of attendance)
app/login              the sign-in screen
app/me                 Employee screens (clock in/out, leave)
app/team               Manager live board + leave approvals
app/admin              HR employee list + monthly report
app/api                the backend (login, clock, leave, report)
lib/                   helpers (database, login session, time rules)
docs/                  the PowerPoint presentation
```
