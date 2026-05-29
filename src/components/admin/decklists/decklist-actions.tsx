"use client";

import { useRouter } from "next/navigation";
import { Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteDecklistAction, duplicateDecklistAction } from "@/lib/admin/actions/decklists";

export function DecklistActions({ decklistId }: { decklistId: string }) {
  const router = useRouter();

  async function onDuplicate() {
    const result = await duplicateDecklistAction(decklistId);
    if (!result.success) toast.error(result.error);
    else {
      toast.success("Duplicated");
      router.push(`/admin/decklists/${(result.data as { id: string }).id}`);
    }
  }

  async function onDelete() {
    if (!confirm("Delete this decklist?")) return;
    const result = await deleteDecklistAction(decklistId);
    if (!result.success) toast.error(result.error);
    else {
      toast.success("Deleted");
      router.push("/admin/decklists");
    }
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={onDuplicate}>
        <Copy className="mr-2 h-4 w-4" />
        Duplicate
      </Button>
      <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>
    </>
  );
}
