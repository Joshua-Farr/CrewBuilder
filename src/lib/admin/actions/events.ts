"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import * as eventsService from "@/lib/admin/events";
import type { CmsEventForm } from "@/lib/schemas/cms";

export type ActionResult<T = unknown> = { success: true; data: T } | { success: false; error: string };

export async function createEventAction(input: CmsEventForm): Promise<ActionResult> {
  try {
    const actor = await requireAdmin();
    const data = await eventsService.createEvent(input, actor);
    revalidatePath("/admin/events");
    revalidatePath("/admin");
    revalidatePath("/tournaments");
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create event" };
  }
}

export async function updateEventAction(
  eventId: string,
  input: Partial<CmsEventForm>,
): Promise<ActionResult> {
  try {
    const actor = await requireAdmin();
    const data = await eventsService.updateEvent(eventId, input, actor);
    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath(`/tournaments/${data.slug}`);
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update event" };
  }
}

export async function deleteEventAction(eventId: string): Promise<ActionResult> {
  try {
    const actor = await requireAdmin();
    await eventsService.deleteEvent(eventId, actor);
    revalidatePath("/admin/events");
    revalidatePath("/admin");
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to delete event" };
  }
}

export async function reorderPlacementsAction(
  eventId: string,
  orderedDecklistIds: string[],
): Promise<ActionResult> {
  try {
    const actor = await requireAdmin();
    await eventsService.reorderEventPlacements(eventId, orderedDecklistIds, actor);
    revalidatePath(`/admin/events/${eventId}`);
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to reorder" };
  }
}

export async function listEventsAction() {
  await requireAdmin();
  return eventsService.listEvents();
}

export async function getEventAction(id: string) {
  await requireAdmin();
  return eventsService.getEventById(id);
}
