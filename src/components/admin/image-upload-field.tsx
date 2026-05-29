"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { generateUploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const UploadButton = generateUploadButton<OurFileRouter>();

type Endpoint = keyof OurFileRouter;

export function ImageUploadField({
  label,
  value,
  onChange,
  endpoint,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  endpoint: Endpoint;
}) {
  const [preview, setPreview] = useState(value);

  const onDrop = useCallback(() => {}, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    accept: { "image/*": [] },
  });

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        {...getRootProps()}
        className={cn(
          "flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/80 bg-muted/30 p-4",
          isDragActive && "border-primary bg-primary/5",
        )}
      >
        <input {...getInputProps()} />
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="max-h-32 rounded-lg object-contain" />
        ) : (
          <Upload className="h-8 w-8 text-muted-foreground" />
        )}
        <UploadButton
          endpoint={endpoint}
          onClientUploadComplete={(res) => {
            const url = res?.[0]?.ufsUrl ?? res?.[0]?.url ?? "";
            if (url) {
              setPreview(url);
              onChange(url);
            }
          }}
          onUploadError={(e) => console.error(e)}
        />
        <p className="text-xs text-muted-foreground">Drag & drop or upload · max 4MB</p>
      </div>
    </div>
  );
}
