"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import * as playersService from "@/lib/admin/players";
import type { CmsPlayerForm } from "@/lib/schemas/cms";
import type { ActionResult } from "@/lib/admin/actions/events";

export async function upsertPlayerAction(input: CmsPlayerForm & { id?: string }): Promise<ActionResult> {
  try {
    const actor = await requireAdmin();
    const data = await playersService.upsertPlayer(input, actor);
    revalidatePath("/admin/players");
    revalidatePath("/players");
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to save player" };
  }
}

export async function deletePlayerAction(playerId: string): Promise<ActionResult> {
  try {
    const actor = await requireAdmin();
    await playersService.deletePlayer(playerId, actor);
    revalidatePath("/admin/players");
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to delete player" };
  }
}

export async function listPlayersAction() {
  await requireAdmin();
  return playersService.listPlayers();
}
