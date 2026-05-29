"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  approveSubmissionAction,
  getSubmissionAction,
  rejectSubmissionAction,
} from "@/lib/admin/actions/submissions";
import { previewDeckFromSubmission } from "@/lib/submissions/promote";
import { displayPlayerName, placementChoiceToNumber } from "@/lib/submissions/parsers";
import type { DeckResultSubmission } from "@/lib/schemas/submission";
import { parseSocialPostUrl } from "@/lib/social-post";

export default function AdminSubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const [submission, setSubmission] = useState<DeckResultSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  useEffect(() => {
    getSubmissionAction(id).then((data) => {
      setSubmission(data);
      setLoading(false);
    });
  }, [id]);

  async function handleApprove(publishAs: "draft" | "published") {
    setActing(true);
    const result = await approveSubmissionAction(id, publishAs);
    setActing(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(publishAs === "published" ? "Published to site" : "Saved as draft");
    router.push(`/admin/events/${result.data.eventId}`);
    router.refresh();
  }

  async function handleReject() {
    setActing(true);
    const result = await rejectSubmissionAction(id, rejectReason);
    setActing(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Submission rejected");
    router.push("/admin/submissions");
    router.refresh();
  }

  if (loading) {
    return (
      <>
        <AdminHeader title="Submission" description="Loading…" />
        <p className="p-8 text-sm text-muted-foreground">Loading submission…</p>
      </>
    );
  }

  if (!submission) {
    return (
      <>
        <AdminHeader title="Submission" description="Not found" />
        <p className="p-8 text-sm text-muted-foreground">Submission not found.</p>
      </>
    );
  }

  const { payload } = submission;
  const deckPreview = previewDeckFromSubmission(payload);
  const social = parseSocialPostUrl(payload.socialPostUrl);
  const placementNum = placementChoiceToNumber(payload.placement, payload.placementOther);
  const isPending = submission.status === "pending";

  return (
    <>
      <AdminHeader
        title={payload.eventName}
        description={`${displayPlayerName(submission.playerName ?? payload.playerName)} · ${payload.eventDate}`}
      />
      <div className="mx-auto max-w-3xl space-y-6 p-8">
        {isPending && payload.eventType === "Locals" && placementNum > 1 ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Note: Locals are typically published for 1st place only. You can still approve if this placement should go live.
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Name" value={payload.eventName} />
              <Row label="Date" value={payload.eventDate} />
              <Row label="Type" value={payload.eventType} />
              <Row label="Set" value={payload.opSet} />
              <Row label="Country" value={payload.country} />
              <Row label="US region" value={payload.usRegion} />
              <Row label="Participants" value={String(payload.numberOfPlayers)} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Player" value={displayPlayerName(submission.playerName ?? payload.playerName)} />
              <Row label="Placement" value={String(placementNum)} />
              <Row label="Record" value={payload.record} />
              <Row label="Email" value={submission.submitterEmail} />
              {payload.socialPostUrl ? (
                <Row
                  label="Social"
                  value={
                    social ? (
                      <a href={payload.socialPostUrl} target="_blank" rel="noreferrer" className="text-primary underline">
                        View post
                      </a>
                    ) : (
                      payload.socialPostUrl
                    )
                  }
                />
              ) : null}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Decklist preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {deckPreview ? (
              <>
                <Row label="Leader" value={`${deckPreview.leaderName} (${deckPreview.leaderCode})`} />
                <Row label="Cards" value={`${deckPreview.totalCards} total`} />
                <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-lg border p-3 text-xs">
                  {deckPreview.lines.map((line) => (
                    <li key={line.code}>
                      {line.quantity}x {line.code}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-muted-foreground">Could not parse decklist — review raw input before approving.</p>
            )}
          </CardContent>
        </Card>

        {submission.proofImages.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Proof (moderation only)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {submission.proofImages.map((img) => (
                  <a key={img.url} href={img.url} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="h-32 w-full rounded-lg border object-cover" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {payload.notes ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent className="whitespace-pre-wrap text-sm">{payload.notes}</CardContent>
          </Card>
        ) : null}

        {submission.status === "approved" && submission.promotedEventId ? (
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href={`/admin/events/${submission.promotedEventId}`}>View event</Link>
            </Button>
            {submission.promotedDecklistId ? (
              <Button asChild variant="outline">
                <Link href={`/admin/decklists/${submission.promotedDecklistId}`}>View decklist</Link>
              </Button>
            ) : null}
          </div>
        ) : null}

        {isPending ? (
          <div className="space-y-4 border-t pt-6">
            {showReject ? (
              <div className="space-y-3">
                <textarea
                  className="w-full rounded-lg border p-3 text-sm"
                  rows={3}
                  placeholder="Rejection reason (optional)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={handleReject} disabled={acting}>
                    Confirm reject
                  </Button>
                  <Button variant="ghost" onClick={() => setShowReject(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => handleApprove("published")} disabled={acting || !deckPreview}>
                  {acting ? "Working…" : "Approve & publish"}
                </Button>
                <Button variant="secondary" onClick={() => handleApprove("draft")} disabled={acting || !deckPreview}>
                  Approve as draft
                </Button>
                <Button variant="outline" onClick={() => setShowReject(true)} disabled={acting}>
                  Reject
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/admin/submissions">Back</Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Status: <span className="font-medium capitalize">{submission.status}</span>
            {submission.rejectionReason ? ` — ${submission.rejectionReason}` : null}
          </div>
        )}
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
