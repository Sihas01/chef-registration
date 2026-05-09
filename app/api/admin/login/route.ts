import { NextResponse } from "next/server";
import {
  adminSessionCookieName,
  createAdminSessionToken,
  verifyPassword,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json(
      { message: "Please enter your username and password." },
      { status: 400 },
    );
  }

  const admin = await prisma.adminUser.findUnique({
    where: {
      username: username.trim(),
    },
  });

  if (!admin || !verifyPassword(password, admin.passwordHash)) {
    return NextResponse.json(
      { message: "Invalid admin username or password." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ message: "Signed in successfully." });

  response.cookies.set({
    name: adminSessionCookieName,
    value: createAdminSessionToken(admin.id, admin.username),
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/",
  });

  return response;
}
