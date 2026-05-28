/**
 * Local scrape runner — enqueues and processes jobs against Firestore (or dry-run).
 *
 * Usage:
 *   npm run scrape:enqueue -- --source limitless --type tournaments
 *   npm run scrape:enqueue -- --source onepiecetopdecks --type decklists --id op15-japan
 *   npm run scrape:local -- --source limitless --type tournaments
 */
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { processScrapeJob } from "../src/lib/ingestion/pipeline";
import { enqueueScrapeJob } from "../src/lib/ingestion/jobs";
import { scrapeJobSchema } from "../src/lib/schemas/scrape-job";
import type { SourceId } from "../src/lib/schemas/common";
import type { ScrapeJobType } from "../src/lib/schemas/common";

function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) return undefined;
  return JSON.parse(raw);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };
  return {
    source: (get("--source") ?? "limitless") as SourceId,
    type: (get("--type") ?? "tournaments") as ScrapeJobType,
    externalId: get("--id"),
    local: args.includes("--local") || process.env.npm_lifecycle_event === "scrape:local",
  };
}

async function main() {
  const { source, type, externalId, local } = parseArgs();
  const serviceAccount = getServiceAccount();

  if (!serviceAccount && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error("Set FIREBASE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS");
    process.exit(1);
  }

  if (!getApps().length) {
    initializeApp(serviceAccount ? { credential: cert(serviceAccount) } : undefined);
  }

  const db = getFirestore();
  const jobId = await enqueueScrapeJob(db, {
    source,
    jobType: type,
    externalId,
    priority: 1,
  });

  console.log(`Enqueued scrape job ${jobId} (${source}/${type})`);

  if (local) {
    const doc = await db.collection("scrapeJobs").doc(jobId).get();
    const job = scrapeJobSchema.parse(doc.data());
    await processScrapeJob(db, jobId, job);
    console.log("Local processing complete.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
