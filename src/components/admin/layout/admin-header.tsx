"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { AdminCommandMenu } from "@/components/admin/command-menu";
import { Button } from "@/components/ui/button";

export function AdminHeader({ title, description }: { title: string; description?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex flex-col gap-4 border-b border-border bg-card px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="flex items-center gap-2">
        <AdminCommandMenu />
        <Button
          variant="outline"
          size="icon"
          className="relative"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </header>
  );
}
