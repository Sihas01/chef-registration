import { randomBytes, randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const receiptFolder = "registration-receipts";

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function cleanFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function createReferenceId() {
  return `CHEFS-2026-${randomBytes(4).toString("hex").toUpperCase()}`;
}

function uploadRoot() {
  return process.env.RECEIPT_UPLOAD_DIR || path.join("uploads", receiptFolder);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const firstName = field(formData, "firstName");
  const surname = field(formData, "surname");
  const gender = field(formData, "gender");
  const mobileNumber = field(formData, "mobileNumber");
  const studentId = field(formData, "studentId");
  const studentEmail = field(formData, "studentEmail");
  const feeStatus = field(formData, "feeStatus");
  const helpLoanAmount = field(formData, "helpLoanAmount");
  const consent = field(formData, "consent");
  const receipt = formData.get("feeReceipt");

  if (
    !firstName ||
    !surname ||
    !gender ||
    !mobileNumber ||
    !studentId ||
    !studentEmail ||
    !feeStatus ||
    consent !== "on"
  ) {
    return NextResponse.json(
      { message: "Please complete all required fields." },
      { status: 400 },
    );
  }

  if (!["yes", "no", "help"].includes(feeStatus)) {
    return NextResponse.json(
      { message: "Please select a valid fee status." },
      { status: 400 },
    );
  }

  if (feeStatus === "help" && !helpLoanAmount) {
    return NextResponse.json(
      { message: "Please enter the HELP loan amount." },
      { status: 400 },
    );
  }

  const normalizedHelpLoanAmount =
    feeStatus === "help" ? Number(helpLoanAmount) : null;

  if (
    feeStatus === "help" &&
    (normalizedHelpLoanAmount === null || Number.isNaN(normalizedHelpLoanAmount))
  ) {
    return NextResponse.json(
      { message: "Please enter a valid HELP loan amount." },
      { status: 400 },
    );
  }

  if (
    feeStatus === "no" &&
    (typeof receipt === "string" || !receipt || receipt.size === 0)
  ) {
    return NextResponse.json(
      { message: "Please upload the remaining school fee receipt." },
      { status: 400 },
    );
  }

  const existingRegistration = await prisma.registration.findUnique({
    where: {
      studentId,
    },
    select: {
      referenceId: true,
    },
  });

  if (existingRegistration) {
    return NextResponse.json(
      {
        message: `This student ID is already registered. Reference ID: ${existingRegistration.referenceId}`,
      },
      { status: 409 },
    );
  }

  const id = randomUUID();
  const referenceId = createReferenceId();
  let receiptStoragePath: string | null = null;
  let receiptFileName: string | null = null;
  let receiptContentType: string | null = null;

  if (feeStatus === "no" && receipt && typeof receipt !== "string") {
    receiptFileName = receipt.name || "receipt";
    receiptContentType = receipt.type || "application/octet-stream";
    const fileName = `${referenceId}-${cleanFileName(receiptFileName)}`;
    const uploadDirectory = uploadRoot();
    receiptStoragePath = path.join(uploadDirectory, fileName);
    const buffer = Buffer.from(await receipt.arrayBuffer());

    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(receiptStoragePath, buffer);
  }

  await prisma.registration.create({
    data: {
      id,
      referenceId,
      firstName,
      surname,
      gender,
      mobileNumber,
      studentId,
      studentEmail,
      feeStatus,
      helpLoanAmount: normalizedHelpLoanAmount,
      receiptStoragePath,
      receiptFileName,
      receiptContentType,
      consentAccepted: true,
    },
  });

  return NextResponse.json({
    id,
    referenceId,
    message: "Registration saved successfully.",
  });
}
