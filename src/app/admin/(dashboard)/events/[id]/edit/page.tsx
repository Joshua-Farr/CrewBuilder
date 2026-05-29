import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { EventForm } from "@/components/admin/forms/event-form";
import { getEventById } from "@/lib/admin/events";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  return (
    <>
      <AdminHeader title="Edit event" description={event.name} />
      <EventForm event={event} />
    </>
  );
}
