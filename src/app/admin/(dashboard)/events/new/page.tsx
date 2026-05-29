import { AdminHeader } from "@/components/admin/layout/admin-header";
import { EventForm } from "@/components/admin/forms/event-form";

export default function NewEventPage() {
  return (
    <>
      <AdminHeader title="New event" description="Create a tournament or event." />
      <EventForm />
    </>
  );
}
