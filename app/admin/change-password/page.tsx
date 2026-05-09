import Link from "next/link";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { requireAdminSession } from "@/lib/admin-auth";

export default async function ChangePasswordPage() {
  await requireAdminSession();

  return (
    <main className="admin-auth-page">
      <section className="admin-auth-panel">
        <p className="eyebrow">CHEFS Admin</p>
        <h1>Change Password</h1>
        <p>Update the admin password used to access the secure portal.</p>
        <ChangePasswordForm />
        <Link className="admin-back-link" href="/admin/dashboard">
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}
