import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

// Root: send the user to the right home for their role, or to login.
export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "ADMIN") redirect("/admin");
  if (user.role === "MANAGER") redirect("/team");
  redirect("/me");
}
