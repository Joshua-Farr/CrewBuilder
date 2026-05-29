import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminApp: App | undefined;
let adminDb: Firestore | undefined;

function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return undefined;
  }
}

export function getAdminApp(): App | null {
  if (adminApp) return adminApp;
  const serviceAccount = getServiceAccount();
  if (!serviceAccount && !process.env.GOOGLE_APPLICATION_CREDENTIALS) return null;
  if (!getApps().length) {
    adminApp = initializeApp(
      serviceAccount ? { credential: cert(serviceAccount as Parameters<typeof cert>[0]) } : undefined,
    );
  } else {
    adminApp = getApps()[0];
  }
  return adminApp ?? null;
}

export function getAdminDb(): Firestore | null {
  if (adminDb) return adminDb;
  const app = getAdminApp();
  if (!app) return null;
  adminDb = getFirestore(app);
  return adminDb;
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS);
}
