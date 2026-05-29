import { AdminHeader } from "@/components/admin/layout/admin-header";
import { DecklistForm } from "@/components/admin/forms/decklist-form";

export default async function NewDecklistPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>;
}) {
  const { eventId } = await searchParams;
  return (
    <>
      <AdminHeader title="New decklist" />
      <DecklistForm defaultEventId={eventId} />
    </>
  );
}
