import { NextResponse } from "next/server";
import { getAdminSession, hashPassword, verifyPassword } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  if (
    typeof currentPassword !== "string" ||
    typeof newPassword !== "string" ||
    typeof confirmPassword !== "string"
  ) {
    return NextResponse.json(
      { message: "Please complete all password fields." },
      { status: 400 },
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { message: "New password must be at least 8 characters." },
      { status: 400 },
    );
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json(
      { message: "New password and confirmation do not match." },
      { status: 400 },
    );
  }

  const admin = await prisma.adminUser.findUnique({
    where: {
      id: session.adminId,
    },
  });

  if (!admin || !verifyPassword(currentPassword, admin.passwordHash)) {
    return NextResponse.json(
      { message: "Current password is incorrect." },
      { status: 401 },
    );
  }

  await prisma.adminUser.update({
    where: {
      id: admin.id,
    },
    data: {
      passwordHash: hashPassword(newPassword),
    },
  });

  return NextResponse.json({ message: "Password changed successfully." });
}
