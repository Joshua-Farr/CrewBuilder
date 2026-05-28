import type { Firestore } from "firebase-admin/firestore";
import { logger } from "@/lib/logging/logger";
import type { ScrapeJob } from "@/lib/schemas/scrape-job";
import { getProvider } from "@/lib/scrapers/registry";
import { fetchWithRetry } from "@/lib/scrapers/base/http-client";
import { getCachedContentHash, saveRawSnapshot, shouldSkipParse } from "@/lib/scrapers/base/html-cache";
import { fetchRenderedHtml } from "@/lib/scrapers/base/playwright-client";
import {
  denormalizeDecklist,
  denormalizeTournament,
  upsertCanonicalDeck,
  upsertCanonicalTournament,
} from "./dedup/merge";
import { markJobCompleted, markJobFailed, markJobRunning, markJobSkipped } from "./jobs";
import { runMetaEngine } from "@/lib/meta/meta-engine";

const DEFAULT_USER_AGENT =
  process.env.SCRAPE_USER_AGENT ?? "GrandLineMetaBot/1.0 (+https://grandlinemeta.com/bot)";

export async function processScrapeJob(db: Firestore, jobId: string, job: ScrapeJob): Promise<void> {
  const start = Date.now();
  await markJobRunning(db, jobId);

  try {
    const provider = getProvider(job.source);
    const ctx = {
      jobId,
      userAgent: DEFAULT_USER_AGENT,
      rateLimitMs: 1500,
    };

    if (job.jobType === "metaRecalc") {
      await runMetaEngine(db, job.payload ?? {});
      await markJobCompleted(db, jobId);
      return;
    }

    if (job.jobType === "tournaments") {
      const rawList = await provider.fetchTournaments(ctx);
      for (const raw of rawList) {
        const normalized = provider.normalizeTournament(raw.data ?? raw);
        const { canonicalId } = await upsertCanonicalTournament(db, normalized);
        await denormalizeTournament(db, normalized, canonicalId);
        await enqueueFollowUp(db, job.source, "tournamentDetail", raw.externalId, normalized.url);
      }
      await markJobCompleted(db, jobId);
      return;
    }

    if (job.jobType === "tournamentDetail" && job.externalId) {
      const detail = await provider.fetchTournament(ctx, job.externalId);
      const normalized = provider.normalizeTournament(detail.data ?? detail);
      const { canonicalId } = await upsertCanonicalTournament(db, normalized);
      await denormalizeTournament(db, normalized, canonicalId);
      await enqueueFollowUp(db, job.source, "decklists", job.externalId, normalized.url);
      await markJobCompleted(db, jobId);
      return;
    }

    if (job.jobType === "decklists" && job.externalId) {
      const rawDecks = await provider.fetchDecklists(ctx, job.externalId);
      let tournamentCanonicalId: string | undefined;
      const mapping = await db
        .collection("sourceMappings")
        .doc(`${job.source}-${job.externalId}`)
        .get();
      if (mapping.exists) tournamentCanonicalId = mapping.data()?.canonicalId as string;

      for (const raw of rawDecks) {
        const normalized = provider.normalizeDeck(raw.data ?? raw);
        const { canonicalId, deckHash } = await upsertCanonicalDeck(
          db,
          normalized,
          tournamentCanonicalId,
        );
        const tournamentId = `${job.source}-${job.externalId}`;
        await denormalizeDecklist(db, normalized, tournamentId, canonicalId, deckHash);
      }
      await markJobCompleted(db, jobId);
      return;
    }

    if (job.jobType === "meta") {
      await runMetaEngine(db, { format: "Constructed" });
      await markJobCompleted(db, jobId);
      return;
    }

    if (job.targetUrl) {
      const cache = await getCachedContentHash(db, job.source, job.targetUrl);
      const result = await fetchWithRetry({
        url: job.targetUrl,
        userAgent: ctx.userAgent,
        rateLimitMs: ctx.rateLimitMs,
        etag: cache.etag,
      });

      if (result.unchanged || shouldSkipParse(cache.contentHash, result.contentHash)) {
        await markJobSkipped(db, jobId, "content unchanged");
        return;
      }

      await saveRawSnapshot(db, {
        scrapeJobId: jobId,
        source: job.source,
        url: job.targetUrl,
        body: result.body,
        contentHash: result.contentHash,
        etag: result.etag,
      });
    }

    await markJobCompleted(db, jobId);
    logger.info("Scrape job completed", { jobId, source: job.source, durationMs: Date.now() - start });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("Scrape job failed", { jobId, error });
    await markJobFailed(
      db,
      jobId,
      {
        code: "scrape_failed",
        message,
        stack: error instanceof Error ? error.stack : undefined,
      },
      (job.attempts ?? 0) + 1,
      job.maxAttempts ?? 5,
    );
  }
}

async function enqueueFollowUp(
  db: Firestore,
  source: ScrapeJob["source"],
  jobType: ScrapeJob["jobType"],
  externalId: string,
  targetUrl?: string,
) {
  const now = new Date().toISOString();
  await db.collection("scrapeJobs").add({
    source,
    jobType,
    externalId,
    targetUrl,
    priority: 5,
    status: "queued",
    attempts: 0,
    maxAttempts: 5,
    createdAt: now,
    updatedAt: now,
  });
}

export async function fetchUrlForProvider(
  url: string,
  options: { usePlaywright?: boolean; userAgent: string; rateLimitMs: number },
): Promise<string> {
  if (options.usePlaywright) {
    return fetchRenderedHtml(url, options.userAgent);
  }
  const result = await fetchWithRetry({
    url,
    userAgent: options.userAgent,
    rateLimitMs: options.rateLimitMs,
  });
  return result.body;
}
