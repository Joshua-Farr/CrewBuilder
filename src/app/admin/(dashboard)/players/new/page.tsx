import { AdminHeader } from "@/components/admin/layout/admin-header";
import { PlayerForm } from "@/components/admin/forms/player-form";

export default function NewPlayerPage() {
  return (
    <>
      <AdminHeader title="New player" />
      <PlayerForm />
    </>
  );
}
