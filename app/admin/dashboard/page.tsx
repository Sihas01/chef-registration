import { AdminDashboard } from "./AdminDashboard";
import { requireAdminSession } from "@/lib/admin-auth";

export default async function DashboardPage() {
  const session = await requireAdminSession();

  return <AdminDashboard username={session.username} />;
}
