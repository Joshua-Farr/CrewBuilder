"use client";

import { AdminToolbar } from "@/components/admin/inline/admin-toolbar";

export function TournamentAdminToolbar({
  eventId,
  eventName,
  notes,
  enabled,
}: {
  eventId: string;
  eventName: string;
  notes?: string;
  enabled?: boolean;
}) {
  return (
    <AdminToolbar
      entityType="event"
      entityId={eventId}
      editHref={`/admin/events/${eventId}/edit`}
      initialTitle={eventName}
      initialNotes={notes ?? ""}
      enabled={enabled}
    />
  );
}
