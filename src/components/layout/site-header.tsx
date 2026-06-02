"use client";
import { Menu, Search, UserRound } from "lucide-react";
import { DevAdminToggle } from "@/components/layout/dev-admin-toggle";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { siteConfig } from "@/lib/seo";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/decks", label: "Decks" },
  { href: "/cards", label: "Cards" },
  { href: "/tournaments", label: "Tournaments" },
  { href: "/submit/result", label: "Submit" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 tracking-tight">
          <span className="flex size-10 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-950 text-sm font-semibold text-white shadow-sm">
            AB
          </span>
          <span className="hidden text-lg font-semibold sm:inline">{siteConfig.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-neutral-100 hover:text-foreground",
                  active && "bg-neutral-100 text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <DevAdminToggle />
          <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/cards">
              <Search className="size-4" /> Search
            </Link>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="top-4 max-w-[calc(100%-2rem)] translate-y-0 sm:max-w-sm">
              <DialogTitle>Navigation</DialogTitle>
              <div className="grid gap-2">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-neutral-100 hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="grid gap-2 border-t border-border pt-4">
                <div className="flex justify-center px-2">
                  <DevAdminToggle />
                </div>
                <Button variant="outline" asChild>
                  <Link href="/auth">
                    <UserRound className="size-4" /> Account
                  </Link>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
