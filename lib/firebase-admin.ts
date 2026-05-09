import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing Firebase environment variable: ${name}`);
  }

  return value;
}

function privateKey() {
  return requireEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n");
}

export function firebaseAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  return initializeApp({
    credential: cert({
      projectId: requireEnv("FIREBASE_PROJECT_ID"),
      clientEmail: requireEnv("FIREBASE_CLIENT_EMAIL"),
      privateKey: privateKey(),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export function firestore() {
  return getFirestore(firebaseAdminApp());
}

export function storageBucket() {
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET;

  if (!bucketName) {
    throw new Error("Missing Firebase environment variable: FIREBASE_STORAGE_BUCKET");
  }

  return getStorage(firebaseAdminApp()).bucket(bucketName);
}
