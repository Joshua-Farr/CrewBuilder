"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import * as decklistsService from "@/lib/admin/decklists";
import type { CmsDecklistForm } from "@/lib/schemas/cms";
import { validateDeckCardTotal } from "@/lib/schemas/cms";
import type { ActionResult } from "@/lib/admin/actions/events";

export async function createDecklistAction(input: CmsDecklistForm): Promise<ActionResult> {
  try {
    const actor = await requireAdmin();
    const { valid, total } = validateDeckCardTotal(input.cards);
    if (input.cards.length > 0 && !valid) {
      return { success: false, error: `Deck must have exactly 50 cards (currently ${total})` };
    }
    const data = await decklistsService.createDecklist(input, actor);
    revalidatePath("/admin/decklists");
    revalidatePath("/decks");
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create decklist" };
  }
}

export async function updateDecklistAction(
  decklistId: string,
  input: Partial<CmsDecklistForm>,
): Promise<ActionResult> {
  try {
    const actor = await requireAdmin();
    if (input.cards?.length) {
      const { valid, total } = validateDeckCardTotal(input.cards);
      if (!valid) return { success: false, error: `Deck must have exactly 50 cards (currently ${total})` };
    }
    const data = await decklistsService.updateDecklist(decklistId, input, actor);
    revalidatePath("/admin/decklists");
    revalidatePath(`/admin/decklists/${decklistId}`);
    revalidatePath(`/decks/${data.slug}`);
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update decklist" };
  }
}

export async function deleteDecklistAction(decklistId: string): Promise<ActionResult> {
  try {
    const actor = await requireAdmin();
    await decklistsService.deleteDecklist(decklistId, actor);
    revalidatePath("/admin/decklists");
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to delete decklist" };
  }
}

export async function duplicateDecklistAction(decklistId: string): Promise<ActionResult> {
  try {
    const actor = await requireAdmin();
    const data = await decklistsService.duplicateDecklist(decklistId, actor);
    revalidatePath("/admin/decklists");
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to duplicate" };
  }
}

export async function listDecklistsAction(filters?: {
  eventId?: string;
  leader?: string;
  status?: string;
}) {
  await requireAdmin();
  return decklistsService.listDecklists(filters);
}

export async function getDecklistAction(id: string) {
  await requireAdmin();
  return decklistsService.getDecklistById(id);
}

export async function quickUpdateDecklistAction(
  decklistId: string,
  fields: { title?: string; notes?: string },
): Promise<ActionResult> {
  return updateDecklistAction(decklistId, fields);
}
