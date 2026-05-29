"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SavedDecksSection } from "@/components/auth/saved-decks-section";
import { useAuth } from "@/components/providers/auth-provider";
import { siteConfig } from "@/lib/seo";

export function AuthPanel() {
  const { signInWithGoogle, signInWithEmail, registerWithEmail, signInWithDiscord, user, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function run(action: () => Promise<void>) {
    try {
      setMessage(null);
      await action();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed");
    }
  }

  if (user) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Signed in</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{user.email}</p>
            <Button onClick={() => run(logout)}>Sign out</Button>
          </CardContent>
        </Card>
        <SavedDecksSection />
      </div>
    );
  }

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle>Join {siteConfig.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button className="w-full" onClick={() => run(signInWithGoogle)}>
          Continue with Google
        </Button>
        <Button className="w-full" variant="outline" onClick={() => run(signInWithDiscord)}>
          Discord OAuth placeholder
        </Button>
        <div className="grid gap-3 border-t border-border pt-4">
          <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Email" />
          <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Password" />
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => run(() => signInWithEmail(email, password))}>
              Sign in
            </Button>
            <Button variant="outline" onClick={() => run(() => registerWithEmail(email, password))}>
              Create account
            </Button>
          </div>
        </div>
        {message ? <p className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{message}</p> : null}
        <p className="text-center text-xs leading-5 text-muted-foreground">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-primary underline-offset-4 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}
