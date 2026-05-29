import { revalidatePath } from "next/cache";
import { createDecklist } from "@/lib/admin/decklists";
import { createEvent, updateEvent } from "@/lib/admin/events";
import { payloadToDecklistForm, payloadToEventForm } from "@/lib/submissions/promote";
import { placementChoiceToNumber } from "@/lib/submissions/parsers";
import {
  findExistingEventForSubmission,
  getSubmissionById,
  updateSubmission,
} from "@/lib/submissions/store";
import { buildEventKey } from "@/lib/schemas/submission";
import { logActivity } from "@/lib/admin/activity";

export async function approveSubmission(
  submissionId: string,
  actor: { id: string; email: string },
  publishAs: "draft" | "published" = "published",
) {
  const submission = await getSubmissionById(submissionId);
  if (!submission) throw new Error("Submission not found");
  if (submission.status !== "pending") throw new Error("Submission already reviewed");

  const { payload } = submission;
  const eventKey = buildEventKey(payload.eventName, payload.eventDate);
  let event = await findExistingEventForSubmission(eventKey, payload.eventName, payload.eventDate);

  if (!event) {
    const created = await createEvent(payloadToEventForm(payload, publishAs), actor);
    event = {
      id: created.id,
      players: created.players,
      topCutDeckIds: created.topCutDeckIds ?? [],
      winnerDeckId: created.winnerDeckId ?? "",
    };
  } else if (payload.numberOfPlayers > event.players) {
    await updateEvent(event.id, { numberOfPlayers: payload.numberOfPlayers }, actor);
    event.players = payload.numberOfPlayers;
  }

  const decklist = await createDecklist(payloadToDecklistForm(payload, event.id, publishAs), actor);

  const placement = placementChoiceToNumber(payload.placement, payload.placementOther);
  const topCutDeckIds = [...new Set([...event.topCutDeckIds, decklist.id])];
  const winnerDeckId = placement === 1 ? decklist.id : event.winnerDeckId;

  await updateEvent(
    event.id,
    {
      topCutDeckIds,
      winnerDeckId,
      status: publishAs,
    },
    actor,
  );

  await updateSubmission(submissionId, {
    status: "approved",
    promotedEventId: event.id,
    promotedDecklistId: decklist.id,
    reviewedBy: actor,
    reviewedAt: new Date().toISOString(),
  });

  await logActivity({
    actorId: actor.id,
    actorEmail: actor.email,
    action: publishAs === "published" ? "publish" : "create",
    entityType: "event",
    entityId: event.id,
    entityLabel: payload.eventName,
  });

  revalidatePath("/admin/submissions");
  revalidatePath("/tournaments");
  revalidatePath("/decks");

  return { eventId: event.id, decklistId: decklist.id };
}

export async function rejectSubmission(
  submissionId: string,
  actor: { id: string; email: string },
  reason: string,
) {
  const submission = await getSubmissionById(submissionId);
  if (!submission) throw new Error("Submission not found");
  if (submission.status !== "pending") throw new Error("Submission already reviewed");

  await updateSubmission(submissionId, {
    status: "rejected",
    rejectionReason: reason.trim() || "Rejected by moderator",
    reviewedBy: actor,
    reviewedAt: new Date().toISOString(),
  });

  revalidatePath("/admin/submissions");
}
