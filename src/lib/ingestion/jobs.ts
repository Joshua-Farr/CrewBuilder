import type { Firestore } from "firebase-admin/firestore";
import type { CreateScrapeJobInput, ScrapeJob } from "@/lib/schemas/scrape-job";
import { scrapeJobSchema } from "@/lib/schemas/scrape-job";

export async function enqueueScrapeJob(
  db: Firestore,
  input: CreateScrapeJobInput,
): Promise<string> {
  const now = new Date().toISOString();
  const ref = db.collection("scrapeJobs").doc();
  const job: ScrapeJob = scrapeJobSchema.parse({
    ...input,
    status: "queued",
    attempts: 0,
    maxAttempts: 5,
    createdAt: now,
    updatedAt: now,
  });
  await ref.set(job);
  return ref.id;
}

export function computeNextRetry(attempts: number): string {
  const backoffMs = Math.min(32_000, 1000 * 2 ** attempts);
  return new Date(Date.now() + backoffMs).toISOString();
}

export async function markJobRunning(db: Firestore, jobId: string): Promise<void> {
  await db.collection("scrapeJobs").doc(jobId).update({
    status: "running",
    updatedAt: new Date().toISOString(),
  });
}

export async function markJobCompleted(db: Firestore, jobId: string): Promise<void> {
  const now = new Date().toISOString();
  await db.collection("scrapeJobs").doc(jobId).update({
    status: "completed",
    completedAt: now,
    updatedAt: now,
  });
}

export async function markJobFailed(
  db: Firestore,
  jobId: string,
  error: { code: string; message: string; stack?: string },
  attempts: number,
  maxAttempts: number,
): Promise<void> {
  const now = new Date().toISOString();
  const willRetry = attempts < maxAttempts;
  await db.collection("scrapeJobs").doc(jobId).update({
    status: willRetry ? "queued" : "failed",
    attempts,
    nextRetryAt: willRetry ? computeNextRetry(attempts) : null,
    error,
    updatedAt: now,
  });
}

export async function markJobSkipped(db: Firestore, jobId: string, reason: string): Promise<void> {
  await db.collection("scrapeJobs").doc(jobId).update({
    status: "skipped",
    error: { code: "skipped", message: reason },
    updatedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  });
}
