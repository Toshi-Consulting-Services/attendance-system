import "./globals.css";

export const metadata = {
  title: "Attendance Management System",
  description: "Employee Attendance Management System — demo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
