"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createEventAction, updateEventAction } from "@/lib/admin/actions/events";
import { cmsEventFormSchema, type CmsEventForm } from "@/lib/schemas/cms";
import type { Tournament } from "@/lib/types";

const defaultValues: CmsEventForm = {
  name: "",
  location: "",
  country: "",
  date: new Date().toISOString().slice(0, 10),
  numberOfPlayers: 0,
  eventType: "Regional",
  streamLink: "",
  coverImage: "",
  organizer: "",
  notes: "",
  region: "NA",
  format: "Constructed",
  opSet: "OP08",
  status: "draft",
  featured: false,
  topCutDeckIds: [],
  bracketSummary: "",
  vodUrl: "",
};

export function EventForm({ event }: { event?: Tournament }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const form = useForm<CmsEventForm>({
    resolver: zodResolver(cmsEventFormSchema) as never,
    defaultValues: event
      ? {
          name: event.name,
          location: event.location,
          country: event.country ?? "",
          date: event.date,
          numberOfPlayers: event.players,
          eventType: event.eventType ?? "Regional",
          streamLink: event.streamLink ?? event.vodUrl ?? "",
          coverImage: event.coverImage ?? "",
          organizer: event.organizer ?? "",
          notes: event.notes ?? "",
          region: event.region,
          format: event.format,
          opSet: event.opSet,
          status: event.status ?? "published",
          featured: event.featured ?? false,
          bracketSummary: event.bracketSummary ?? "",
          vodUrl: event.vodUrl ?? "",
        }
      : defaultValues,
  });

  async function onSubmit(values: CmsEventForm) {
    setSaving(true);
    const result = event
      ? await updateEventAction(event.id, values)
      : await createEventAction(values);
    setSaving(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(event ? "Event updated" : "Event created");
    router.push(`/admin/events/${(result.data as Tournament).id}`);
    router.refresh();
  }

  const { register, handleSubmit, watch, setValue } = form;
  const status = watch("status");
  const featured = watch("featured");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-2xl space-y-6 p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Event name</Label>
          <Input id="name" {...register("name")} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" {...register("date")} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="numberOfPlayers">Players</Label>
          <Input id="numberOfPlayers" type="number" {...register("numberOfPlayers", { valueAsNumber: true })} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" {...register("location")} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" {...register("country")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="eventType">Event type</Label>
          <Input id="eventType" {...register("eventType")} placeholder="Regional, Nationals…" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="organizer">Organizer</Label>
          <Input id="organizer" {...register("organizer")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="streamLink">Stream / VOD link</Label>
          <Input id="streamLink" {...register("streamLink")} placeholder="https://" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vodUrl">VOD URL</Label>
          <Input id="vodUrl" {...register("vodUrl")} placeholder="https://" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="region">Region</Label>
          <Select id="region" {...register("region")}>
            <option value="NA">NA</option>
            <option value="EU">EU</option>
            <option value="LATAM">LATAM</option>
            <option value="OCE">OCE</option>
            <option value="ASIA">ASIA</option>
            <option value="JP">JP</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="format">Format</Label>
          <Select id="format" {...register("format")}>
            <option value="Constructed">Constructed</option>
            <option value="Sealed">Sealed</option>
            <option value="Teams">Teams</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="opSet">Set</Label>
          <Input id="opSet" {...register("opSet")} placeholder="OP15" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="bracketSummary">Bracket summary</Label>
          <Textarea id="bracketSummary" rows={3} {...register("bracketSummary")} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="coverImage">Cover image URL</Label>
          <Input id="coverImage" {...register("coverImage")} placeholder="https://" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" rows={4} {...register("notes")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select id="status" value={status} onChange={(e) => setValue("status", e.target.value as CmsEventForm["status"])}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </Select>
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch checked={featured} onCheckedChange={(v) => setValue("featured", v)} id="featured" />
          <Label htmlFor="featured">Featured event</Label>
        </div>
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : event ? "Update event" : "Create event"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
