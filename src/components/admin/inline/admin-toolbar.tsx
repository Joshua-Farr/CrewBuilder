"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteDecklistAction, quickUpdateDecklistAction } from "@/lib/admin/actions/decklists";
import { deleteEventAction } from "@/lib/admin/actions/events";

type EntityType = "decklist" | "event";

export function AdminToolbar({
  entityType,
  entityId,
  editHref,
  initialTitle,
  initialNotes,
  enabled = false,
}: {
  entityType: EntityType;
  entityId: string;
  editHref: string;
  initialTitle?: string;
  initialNotes?: string;
  enabled?: boolean;
}) {
  const [title, setTitle] = useState(initialTitle ?? "");
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [editing, setEditing] = useState(false);

  if (!enabled) return null;

  async function quickSave() {
    if (entityType === "decklist") {
      const result = await quickUpdateDecklistAction(entityId, { title, notes });
      if (!result.success) toast.error(result.error);
      else {
        toast.success("Saved");
        setEditing(false);
      }
    }
  }

  async function onDelete() {
    if (!confirm("Delete this item?")) return;
    const result =
      entityType === "decklist" ? await deleteDecklistAction(entityId) : await deleteEventAction(entityId);
    if (!result.success) toast.error(result.error);
    else {
      toast.success("Deleted");
      window.location.href = entityType === "decklist" ? "/decks" : "/tournaments";
    }
  }

  return (
    <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-primary">Admin</span>
        <Button asChild size="sm" variant="outline">
          <Link href={editHref}>
            <Pencil className="mr-2 h-3 w-3" />
            Edit in CMS
          </Link>
        </Button>
        <Button size="sm" variant="outline" onClick={() => setEditing((e) => !e)}>
          Quick edit
        </Button>
        <Button size="sm" variant="destructive" onClick={onDelete}>
          <Trash2 className="mr-2 h-3 w-3" />
          Delete
        </Button>
      </div>
      {editing && entityType === "decklist" ? (
        <div className="mt-4 space-y-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" />
          <Button size="sm" onClick={quickSave}>
            Save changes
          </Button>
        </div>
      ) : null}
    </div>
  );
}
