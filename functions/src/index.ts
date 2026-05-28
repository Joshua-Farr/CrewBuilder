import { initializeApp, getApps } from "firebase-admin/app";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore } from "firebase-admin/firestore";
import { scrapeJobSchema } from "@/lib/schemas/scrape-job";
import { processScrapeJob } from "@/lib/ingestion/pipeline";
import { computeNextRetry } from "@/lib/ingestion/jobs";
import { getEnabledSources } from "@/lib/scrapers/registry";
import type { SourceId } from "@/lib/schemas/common";

if (!getApps().length) initializeApp();

const db = () => getFirestore();

export const onScrapeJobWrite = onDocumentWritten(
  {
    document: "scrapeJobs/{jobId}",
    region: "us-central1",
    memory: "1GiB",
    timeoutSeconds: 540,
  },
  async (event) => {
    const after = event.data?.after;
    if (!after?.exists) return;

    const data = after.data();
    if (!data || data.status !== "queued") return;

    const jobId = event.params.jobId;
    const job = scrapeJobSchema.parse({
      ...data,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });

    if (job.nextRetryAt && new Date(job.nextRetryAt) > new Date()) return;

    await processScrapeJob(db(), jobId, job);
  },
);

export const scheduleMajorTournaments = onSchedule(
  {
    schedule: "every 30 minutes",
    region: "us-central1",
  },
  async () => {
    const sources: SourceId[] = ["limitless", "egman"];
    const now = new Date().toISOString();
    for (const source of sources) {
      if (!getEnabledSources().includes(source)) continue;
      await db().collection("scrapeJobs").add({
        source,
        jobType: "tournaments",
        priority: 1,
        status: "queued",
        attempts: 0,
        maxAttempts: 5,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
);

export const scheduleDeckDatabases = onSchedule(
  {
    schedule: "every 6 hours",
    region: "us-central1",
  },
  async () => {
    const now = new Date().toISOString();
    for (const source of getEnabledSources()) {
      await db().collection("scrapeJobs").add({
        source,
        jobType: "tournaments",
        priority: 3,
        status: "queued",
        attempts: 0,
        maxAttempts: 5,
        createdAt: now,
        updatedAt: now,
      });
      if (source === "onepiecetopdecks") {
        await db().collection("scrapeJobs").add({
          source,
          jobType: "decklists",
          externalId: "op15-japan",
          priority: 3,
          status: "queued",
          attempts: 0,
          maxAttempts: 5,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  },
);

export const scheduleMetaNightly = onSchedule(
  {
    schedule: "0 3 * * *",
    timeZone: "America/Chicago",
    region: "us-central1",
  },
  async () => {
    const now = new Date().toISOString();
    await db().collection("scrapeJobs").add({
      source: "limitless",
      jobType: "metaRecalc",
      priority: 2,
      status: "queued",
      attempts: 0,
      maxAttempts: 3,
      payload: { format: "Constructed" },
      createdAt: now,
      updatedAt: now,
    });
  },
);

export const retryFailedJobs = onSchedule(
  {
    schedule: "every 15 minutes",
    region: "us-central1",
  },
  async () => {
    const now = new Date().toISOString();
    const snapshot = await db()
      .collection("scrapeJobs")
      .where("status", "==", "failed")
      .limit(50)
      .get();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const attempts = (data.attempts as number) ?? 0;
      const maxAttempts = (data.maxAttempts as number) ?? 5;
      if (attempts >= maxAttempts) continue;
      await doc.ref.update({
        status: "queued",
        nextRetryAt: computeNextRetry(attempts),
        updatedAt: now,
      });
    }

    const queued = await db()
      .collection("scrapeJobs")
      .where("status", "==", "queued")
      .where("nextRetryAt", "<=", now)
      .limit(20)
      .get();

    for (const doc of queued.docs) {
      const data = doc.data();
      if (!data.nextRetryAt) continue;
      await processScrapeJob(db(), doc.id, scrapeJobSchema.parse(data));
    }
  },
);
