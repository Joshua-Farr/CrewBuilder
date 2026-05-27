"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/providers/auth-provider";
import { submitTournament } from "@/lib/services/firestore";
import { tournamentUploadSchema, type TournamentUploadInput, type TournamentUploadValues } from "@/lib/validators";

export function TournamentUploadForm() {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TournamentUploadInput, unknown, TournamentUploadValues>({ resolver: zodResolver(tournamentUploadSchema) });
  const { getRootProps, getInputProps, acceptedFiles, isDragActive } = useDropzone({
    accept: { "application/json": [".json"], "text/csv": [".csv"] },
    maxFiles: 3,
  });

  async function onSubmit(values: TournamentUploadValues) {
    await submitTournament(values, user?.uid);
    reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload tournament report</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field error={errors.name?.message}>
              <Input placeholder="Tournament name" {...register("name")} />
            </Field>
            <Field error={errors.opSet?.message}>
              <Input placeholder="OP set, e.g. OP08" {...register("opSet")} />
            </Field>
            <Field error={errors.region?.message}>
              <Select {...register("region")} defaultValue="NA">
                <option value="NA">NA</option>
                <option value="EU">EU</option>
                <option value="LATAM">LATAM</option>
                <option value="OCE">OCE</option>
                <option value="ASIA">ASIA</option>
                <option value="JP">JP</option>
              </Select>
            </Field>
            <Field error={errors.format?.message}>
              <Select {...register("format")} defaultValue="Constructed">
                <option value="Constructed">Constructed</option>
                <option value="Sealed">Sealed</option>
                <option value="Teams">Teams</option>
              </Select>
            </Field>
            <Field error={errors.date?.message}>
              <Input type="date" {...register("date")} />
            </Field>
            <Field error={errors.players?.message}>
              <Input type="number" placeholder="Players" {...register("players")} />
            </Field>
          </div>
          <Field error={errors.bracketSummary?.message}>
            <Textarea placeholder="Bracket summary, notable matchups, top cut notes..." {...register("bracketSummary")} />
          </Field>
          <div
            {...getRootProps()}
            className={`cursor-pointer rounded-2xl border border-dashed p-8 text-center transition ${
              isDragActive ? "border-primary bg-blue-50" : "border-border bg-neutral-50 hover:bg-neutral-100"
            }`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto size-8 text-primary" />
            <p className="mt-3 font-semibold">Drag JSON/CSV decklists or bracket exports here</p>
            <p className="text-sm text-muted-foreground">
              {acceptedFiles.length ? acceptedFiles.map((file) => file.name).join(", ") : "Files are staged for Firebase Storage upload in production."}
            </p>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit for moderation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ children, error }: { children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1">
      {children}
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
