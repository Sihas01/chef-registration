import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const receiptFolder = "registration-receipts";

function uploadRoot() {
  return path.join(process.cwd(), "uploads", receiptFolder);
}

function safeFilePath(receiptStoragePath: string) {
  const root = uploadRoot();
  const resolvedPath = path.join(root, path.basename(receiptStoragePath));

  if (!resolvedPath.startsWith(`${root}${path.sep}`)) {
    return null;
  }

  return resolvedPath;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const registration = await prisma.registration.findUnique({
    where: { id },
    select: {
      receiptStoragePath: true,
      receiptFileName: true,
      receiptContentType: true,
    },
  });

  if (!registration?.receiptStoragePath) {
    return NextResponse.json({ message: "Receipt not found." }, { status: 404 });
  }

  const filePath = safeFilePath(registration.receiptStoragePath);

  if (!filePath) {
    return NextResponse.json({ message: "Receipt path is invalid." }, { status: 400 });
  }

  try {
    const file = await readFile(filePath);

    return new Response(file, {
      headers: {
        "Content-Disposition": `attachment; filename="${registration.receiptFileName || "receipt"}"`,
        "Content-Type": registration.receiptContentType || "application/octet-stream",
      },
    });
  } catch {
    return NextResponse.json({ message: "Receipt file is missing." }, { status: 404 });
  }
}
