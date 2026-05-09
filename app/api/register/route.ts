import { randomUUID } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { firestore, storageBucket } from "@/lib/firebase-admin";

export const runtime = "nodejs";

type Registration = {
  id: string;
  submittedAt: string;
  personalInformation: {
    firstName: string;
    surname: string;
    gender: string;
    mobileNumber: string;
  };
  academicInformation: {
    studentId: string;
    studentEmail: string;
  };
  feeInformation: {
    feeStatus: string;
    helpLoanAmount: string | null;
    receiptStoragePath: string | null;
    receiptFileName: string | null;
    receiptContentType: string | null;
  };
  consentAccepted: boolean;
};

const registrationsCollection = "registrations";
const receiptFolder = "registration-receipts";

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function cleanFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
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

  if (
    feeStatus === "no" &&
    (typeof receipt === "string" || !receipt || receipt.size === 0)
  ) {
    return NextResponse.json(
      { message: "Please upload the remaining school fee receipt." },
      { status: 400 },
    );
  }

  const id = randomUUID();
  let receiptStoragePath: string | null = null;
  let receiptFileName: string | null = null;
  let receiptContentType: string | null = null;

  if (feeStatus === "no" && receipt && typeof receipt !== "string") {
    receiptFileName = receipt.name || "receipt";
    receiptContentType = receipt.type || "application/octet-stream";
    const fileName = `${id}-${cleanFileName(receiptFileName)}`;
    receiptStoragePath = `${receiptFolder}/${fileName}`;
    const buffer = Buffer.from(await receipt.arrayBuffer());

    await storageBucket().file(receiptStoragePath).save(buffer, {
      contentType: receiptContentType,
      metadata: {
        metadata: {
          registrationId: id,
          originalFileName: receiptFileName,
        },
      },
    });
  }

  const registration: Registration = {
    id,
    submittedAt: new Date().toISOString(),
    personalInformation: {
      firstName,
      surname,
      gender,
      mobileNumber,
    },
    academicInformation: {
      studentId,
      studentEmail,
    },
    feeInformation: {
      feeStatus,
      helpLoanAmount: feeStatus === "help" ? helpLoanAmount : null,
      receiptStoragePath,
      receiptFileName,
      receiptContentType,
    },
    consentAccepted: true,
  };

  await firestore()
    .collection(registrationsCollection)
    .doc(id)
    .set({
      ...registration,
      submittedAtServer: FieldValue.serverTimestamp(),
    });

  return NextResponse.json({
    id,
    message: "Registration saved successfully.",
  });
}
