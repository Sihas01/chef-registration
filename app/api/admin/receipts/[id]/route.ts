import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { s3BucketName, s3Client } from "@/lib/s3";

export const runtime = "nodejs";

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

  try {
    const object = await s3Client().send(
      new GetObjectCommand({
        Bucket: s3BucketName(),
        Key: registration.receiptStoragePath,
      }),
    );
    const file = await object.Body?.transformToByteArray();

    if (!file) {
      return NextResponse.json({ message: "Receipt file is missing." }, { status: 404 });
    }

    return new Response(Buffer.from(file), {
      headers: {
        "Content-Disposition": `attachment; filename="${registration.receiptFileName || "receipt"}"`,
        "Content-Type": registration.receiptContentType || "application/octet-stream",
      },
    });
  } catch {
    return NextResponse.json({ message: "Receipt file is missing." }, { status: 404 });
  }
}
