"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { generateUploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";
import type { ProofImage } from "@/lib/schemas/submission";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const UploadButton = generateUploadButton<OurFileRouter>();

export function ProofUploadField({
  value,
  onChange,
  maxFiles = 5,
}: {
  value: ProofImage[];
  onChange: (images: ProofImage[]) => void;
  maxFiles?: number;
}) {
  const [uploading, setUploading] = useState(false);

  function removeImage(url: string) {
    onChange(value.filter((img) => img.url !== url));
  }

  return (
    <div className="space-y-3">
      <Label>Proof of placement *</Label>
      <p className="text-xs text-muted-foreground">
        Screenshot from the Bandai TCG app or similar. Used for verification only — never shown publicly.
      </p>
      <div
        className={cn(
          "flex min-h-[100px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/80 bg-muted/30 p-4",
        )}
      >
        {value.length > 0 ? (
          <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
            {value.map((img) => (
              <div key={img.url} className="relative overflow-hidden rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="h-24 w-full object-cover" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-1 top-1 h-6 w-6"
                  onClick={() => removeImage(img.url)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <Upload className="h-8 w-8 text-muted-foreground" />
        )}
        {value.length < maxFiles ? (
          <UploadButton
            endpoint="submissionProof"
            onUploadBegin={() => setUploading(true)}
            onClientUploadComplete={(res) => {
              setUploading(false);
              const added: ProofImage[] = (res ?? []).map((f) => ({
                url: f.ufsUrl ?? f.url ?? "",
                fileName: f.name,
              }));
              onChange([...value, ...added].slice(0, maxFiles));
            }}
            onUploadError={() => setUploading(false)}
          />
        ) : null}
        <p className="text-xs text-muted-foreground">
          {uploading ? "Uploading…" : `Up to ${maxFiles} images · max 10 MB each`}
        </p>
      </div>
    </div>
  );
}
