"use server";

import { requireAdmin, requireModerator } from "@/lib/auth/require-admin";
import { approveSubmission, rejectSubmission } from "@/lib/admin/submissions";
import { createSubmission, getSubmissionById, listSubmissions } from "@/lib/submissions/store";
import { deckResultPayloadSchema, type DeckResultPayload, type ProofImage, type SubmissionStatus } from "@/lib/schemas/submission";

export type ActionResult<T = unknown> = { success: true; data: T } | { success: false; error: string };

export async function submitDeckResultAction(
  payload: DeckResultPayload,
  proofImages: ProofImage[],
): Promise<ActionResult<{ id: string }>> {
  try {
    deckResultPayloadSchema.parse(payload);
    if (!proofImages.length) {
      return { success: false, error: "At least one proof image is required" };
    }
    const submission = await createSubmission(payload, proofImages);
    return { success: true, data: { id: submission.id } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to submit" };
  }
}

export async function listSubmissionsAction(status?: SubmissionStatus) {
  await requireModerator();
  return listSubmissions(status);
}

export async function getSubmissionAction(id: string) {
  await requireModerator();
  return getSubmissionById(id);
}

export async function approveSubmissionAction(
  id: string,
  publishAs: "draft" | "published" = "published",
): Promise<ActionResult<{ eventId: string; decklistId: string }>> {
  try {
    const actor = await requireAdmin();
    const data = await approveSubmission(id, actor, publishAs);
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to approve" };
  }
}

export async function rejectSubmissionAction(id: string, reason: string): Promise<ActionResult> {
  try {
    const actor = await requireAdmin();
    await rejectSubmission(id, actor, reason);
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to reject" };
  }
}
