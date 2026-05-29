"use client";

import { Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DEV_ADMIN_COOKIE, DEV_ADMIN_STORAGE_KEY } from "@/lib/auth/dev-admin";
import { cn } from "@/lib/utils";

function readEnabled(): boolean {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem(DEV_ADMIN_STORAGE_KEY) === "1") return true;
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${DEV_ADMIN_COOKIE}=1`));
}

function persist(enabled: boolean) {
  if (enabled) {
    localStorage.setItem(DEV_ADMIN_STORAGE_KEY, "1");
    document.cookie = `${DEV_ADMIN_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
  } else {
    localStorage.removeItem(DEV_ADMIN_STORAGE_KEY);
    document.cookie = `${DEV_ADMIN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  }
}

export function DevAdminToggle() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const on = readEnabled();
    setEnabled(on);
    if (on && !document.cookie.includes(`${DEV_ADMIN_COOKIE}=1`)) {
      persist(true);
    }
  }, []);

  if (!mounted || process.env.NODE_ENV !== "development") {
    return null;
  }

  function onToggle(next: boolean) {
    setEnabled(next);
    persist(next);
    router.refresh();
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border px-2 py-1",
        enabled ? "border-primary/30 bg-primary/5" : "border-border bg-muted/40",
      )}
    >
      <label htmlFor="dev-admin-toggle" className="flex cursor-pointer items-center gap-2 text-xs font-medium">
        <Shield className={cn("size-3.5", enabled && "text-primary")} />
        <span className="hidden sm:inline">{enabled ? "Admin view" : "User view"}</span>
        <Switch id="dev-admin-toggle" checked={enabled} onCheckedChange={onToggle} />
      </label>
      {enabled ? (
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
          <Link href="/admin">CMS</Link>
        </Button>
      ) : null}
    </div>
  );
}
