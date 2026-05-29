"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(error === "AccessDenied" ? "You do not have admin access." : "");

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const result = await signIn("credentials", { email, password, redirect: false, callbackUrl });
    setLoading(false);
    if (result?.error) {
      setMessage("Invalid email or password.");
      return;
    }
    if (result?.url) window.location.href = result.url;
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-md border-border/60 shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">AllBlue.gg</p>
          <CardTitle className="text-2xl font-semibold tracking-tight">Admin CMS</CardTitle>
          <CardDescription>Sign in with your admin account to manage tournaments and decklists.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {message ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{message}</p> : null}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl })}
          >
            Continue with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or email</span>
            </div>
          </div>
          <form onSubmit={handleCredentials} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[70vh] items-center justify-center text-muted-foreground">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
