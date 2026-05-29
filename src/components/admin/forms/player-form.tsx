"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { upsertPlayerAction } from "@/lib/admin/actions/players";
import { cmsPlayerFormSchema, type CmsPlayerForm } from "@/lib/schemas/cms";
import type { Player } from "@/lib/types";

export function PlayerForm({ player }: { player?: Player }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const form = useForm<CmsPlayerForm>({
    resolver: zodResolver(cmsPlayerFormSchema),
    defaultValues: {
      name: player?.name ?? "",
      twitterHandle: player?.twitterHandle ?? "",
      profileImage: player?.profileImage ?? "",
      bio: player?.bio ?? "",
      rank: player?.rank,
      points: player?.points,
    },
  });

  async function onSubmit(values: CmsPlayerForm) {
    setSaving(true);
    const result = await upsertPlayerAction({ ...values, id: player?.id });
    setSaving(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Player saved");
    router.push("/admin/players");
    router.refresh();
  }

  const { register, handleSubmit } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-xl space-y-4 p-8">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input {...register("name")} required />
      </div>
      <div className="space-y-2">
        <Label>Twitter handle</Label>
        <Input {...register("twitterHandle")} placeholder="@player" />
      </div>
      <div className="space-y-2">
        <Label>Profile image URL</Label>
        <Input {...register("profileImage")} placeholder="https://" />
      </div>
      <div className="space-y-2">
        <Label>Bio</Label>
        <Textarea rows={4} {...register("bio")} />
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save player"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
