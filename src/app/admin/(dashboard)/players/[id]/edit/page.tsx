import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { PlayerForm } from "@/components/admin/forms/player-form";
import { getPlayerById } from "@/lib/admin/players";

export default async function EditPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const player = await getPlayerById(id);
  if (!player) notFound();

  return (
    <>
      <AdminHeader title="Edit player" description={player.name} />
      <PlayerForm player={player} />
    </>
  );
}
