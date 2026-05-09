"use client";

import { FormEvent, useState } from "react";

type FormStatus = {
  type: "success" | "error";
  message: string;
};

export function ChangePasswordForm() {
  const [status, setStatus] = useState<FormStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        body: new FormData(form),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || "Unable to change password.");
      }

      setStatus({
        type: "success",
        message: result.message || "Password changed successfully.",
      });
      form.reset();
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to change password.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="admin-login-form" onSubmit={handleSubmit}>
      {status ? (
        <p
          className={
            status.type === "success" ? "admin-form-success" : "admin-form-error"
          }
        >
          {status.message}
        </p>
      ) : null}

      <label>
        <span>Current Password</span>
        <input
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>

      <label>
        <span>New Password</span>
        <input
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>

      <label>
        <span>Confirm New Password</span>
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Changing..." : "Change Password"}
      </button>
    </form>
  );
}
