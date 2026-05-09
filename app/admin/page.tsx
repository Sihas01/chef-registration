import { redirect } from "next/navigation";
import { AdminLoginForm } from "./AdminLoginForm";
import { getAdminSession } from "@/lib/admin-auth";

export default async function AdminPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin/dashboard");
  }

  return (
    <main className="admin-auth-page">
      <section className="admin-auth-panel">
        <p className="eyebrow">CHEFS Admin</p>
        <h1>Secure Portal</h1>
        <p>
          Sign in to review student registrations, fee details, and uploaded
          receipts.
        </p>
        <AdminLoginForm />
      </section>
    </main>
  );
}
