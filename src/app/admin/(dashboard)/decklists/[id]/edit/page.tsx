import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { DecklistForm } from "@/components/admin/forms/decklist-form";
import { getDecklistById } from "@/lib/admin/decklists";

export default async function EditDecklistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deck = await getDecklistById(id);
  if (!deck) notFound();

  return (
    <>
      <AdminHeader title="Edit decklist" description={deck.name} />
      <DecklistForm deck={deck} />
    </>
  );
}
