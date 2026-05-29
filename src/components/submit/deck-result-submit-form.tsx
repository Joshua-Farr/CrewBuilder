"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProofUploadField } from "@/components/submit/proof-upload-field";
import { submitDeckResultAction } from "@/lib/admin/actions/submissions";
import {
  deckResultPayloadSchema,
  EVENT_TYPE_OPTIONS,
  OP_SET_OPTIONS,
  RECORD_PRESETS,
  type DeckResultPayload,
  type ProofImage,
} from "@/lib/schemas/submission";

const defaultValues: DeckResultPayload = {
  submitterEmail: "",
  playerName: "",
  eventName: "",
  eventDate: new Date().toISOString().slice(0, 10),
  usRegion: "East",
  country: "",
  opSet: "OP15",
  eventType: "Locals",
  numberOfPlayers: 8,
  placement: "1",
  record: "5-0",
  socialPostUrl: "",
  deckEntryMethod: "allblue_url",
  simDeckPaste: "",
  allblueDeckUrl: "",
  notes: "",
};

export function DeckResultSubmitForm() {
  const [proofImages, setProofImages] = useState<ProofImage[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [customOpSet, setCustomOpSet] = useState(false);
  const [customRecord, setCustomRecord] = useState(false);

  const form = useForm<DeckResultPayload>({
    resolver: zodResolver(deckResultPayloadSchema) as never,
    defaultValues,
  });

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = form;
  const deckMethod = watch("deckEntryMethod");
  const placement = watch("placement");

  async function onSubmit(values: DeckResultPayload) {
    if (!proofImages.length) {
      toast.error("Please upload at least one proof image");
      return;
    }
    const result = await submitDeckResultAction(values, proofImages);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setSubmitted(true);
    toast.success("Submission received! We'll review it soon.");
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="space-y-4 p-8 text-center">
          <p className="text-lg font-semibold">Thanks for your submission!</p>
          <p className="text-sm text-muted-foreground">
            Our team will review your result and publish it to allblue.gg if approved.
          </p>
          <Button asChild variant="outline">
            <Link href="/tournaments">Browse tournaments</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-2xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Event details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="eventName">Event name *</Label>
            <Input id="eventName" placeholder="Peoria, IL Regionals or Store Name Locals" {...register("eventName")} />
            {errors.eventName ? <p className="text-xs text-red-600">{errors.eventName.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventDate">Date *</Label>
            <Input id="eventDate" type="date" {...register("eventDate")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numberOfPlayers">Participants *</Label>
            <Input id="numberOfPlayers" type="number" min={2} {...register("numberOfPlayers", { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventType">Tournament type *</Label>
            <Select id="eventType" {...register("eventType")}>
              {EVENT_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="usRegion">Region *</Label>
            <Select id="usRegion" {...register("usRegion")}>
              <option value="East">East</option>
              <option value="West">West</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Input id="country" placeholder="United States" {...register("country")} />
            {errors.country ? <p className="text-xs text-red-600">{errors.country.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="opSet">Set *</Label>
            {customOpSet ? (
              <Input id="opSet" placeholder="Other set" {...register("opSet")} />
            ) : (
              <Select
                id="opSet"
                {...register("opSet")}
                onChange={(e) => {
                  if (e.target.value === "__other__") {
                    setCustomOpSet(true);
                    setValue("opSet", "");
                  } else {
                    setValue("opSet", e.target.value);
                  }
                }}
              >
                {OP_SET_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
                <option value="__other__">Other…</option>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your result</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="placement">Placement *</Label>
            <Select id="placement" {...register("placement")}>
              <option value="1">1st</option>
              <option value="2">2nd</option>
              <option value="3">3rd</option>
              <option value="4">4th</option>
              <option value="top8">Top 8</option>
              <option value="top16">Top 16</option>
              <option value="top32">Top 32</option>
              <option value="top64">Top 64</option>
              <option value="other">Other</option>
            </Select>
          </div>
          {placement === "other" ? (
            <div className="space-y-2">
              <Label htmlFor="placementOther">Placement number</Label>
              <Input id="placementOther" type="number" min={1} {...register("placementOther", { valueAsNumber: true })} />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="record">Score *</Label>
            {customRecord ? (
              <Input id="record" placeholder="e.g. 4-1" {...register("record")} />
            ) : (
              <Select
                id="record"
                {...register("record")}
                onChange={(e) => {
                  if (e.target.value === "other") {
                    setCustomRecord(true);
                    setValue("record", "");
                  } else {
                    setValue("record", e.target.value);
                  }
                }}
              >
                {RECORD_PRESETS.filter((r) => r !== "other").map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
                <option value="other">Other…</option>
              </Select>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="playerName">Display name</Label>
            <Input id="playerName" placeholder="Optional — leave blank to stay anonymous" {...register("playerName")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="socialPostUrl">Social post link</Label>
            <Input id="socialPostUrl" placeholder="Tweet, Facebook post, etc. with your decklist" {...register("socialPostUrl")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Decklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs
            value={deckMethod}
            onValueChange={(v) => setValue("deckEntryMethod", v as DeckResultPayload["deckEntryMethod"])}
          >
            <TabsList>
              <TabsTrigger value="allblue_url">allblue.gg link</TabsTrigger>
              <TabsTrigger value="sim_paste">OPTCG Sim paste</TabsTrigger>
            </TabsList>
            <TabsContent value="allblue_url" className="mt-4 space-y-2">
              <Label htmlFor="allblueDeckUrl">Deck builder URL</Label>
              <Input id="allblueDeckUrl" placeholder="https://allblue.gg/builder?deck=..." {...register("allblueDeckUrl")} />
              <p className="text-xs text-muted-foreground">
                Build at{" "}
                <Link href="/builder" className="text-primary underline">
                  allblue.gg/builder
                </Link>
                , then click &quot;Copy deck link&quot; and paste here.
              </p>
              {errors.allblueDeckUrl ? <p className="text-xs text-red-600">{errors.allblueDeckUrl.message}</p> : null}
            </TabsContent>
            <TabsContent value="sim_paste" className="mt-4 space-y-2">
              <Label htmlFor="simDeckPaste">Sim export</Label>
              <Textarea
                id="simDeckPaste"
                rows={8}
                placeholder={"1xOP05-060\n4xOP05-119\n..."}
                {...register("simDeckPaste")}
              />
              {errors.simDeckPaste ? <p className="text-xs text-red-600">{errors.simDeckPaste.message}</p> : null}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <ProofUploadField value={proofImages} onChange={setProofImages} />
          <div className="space-y-2">
            <Label htmlFor="submitterEmail">Your email *</Label>
            <Input id="submitterEmail" type="email" placeholder="For follow-up only — not published" {...register("submitterEmail")} />
            {errors.submitterEmail ? <p className="text-xs text-red-600">{errors.submitterEmail.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} placeholder="Anything else we should know…" {...register("notes")} />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting…" : "Submit for review"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
