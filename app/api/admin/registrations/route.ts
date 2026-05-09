import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.trim();
  const feeStatus = url.searchParams.get("feeStatus")?.trim();

  const registrations = await prisma.registration.findMany({
    where: {
      ...(search
        ? {
            OR: [
              { studentId: { contains: search } },
              { referenceId: { contains: search } },
              { studentEmail: { contains: search } },
            ],
          }
        : {}),
      ...(feeStatus && ["yes", "no", "help"].includes(feeStatus)
        ? { feeStatus }
        : {}),
    },
    orderBy: {
      submittedAt: "desc",
    },
  });

  return NextResponse.json({
    registrations: registrations.map((registration) => ({
      ...registration,
      helpLoanAmount: registration.helpLoanAmount?.toString() ?? null,
      submittedAt: registration.submittedAt.toISOString(),
      hasReceipt: Boolean(registration.receiptStoragePath),
    })),
  });
}
