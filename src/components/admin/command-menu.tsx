"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { searchAdminIndex, type SearchResult } from "@/lib/admin/actions/search";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function AdminCommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runSearch = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const data = await searchAdminIndex(q);
      setResults(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => runSearch(query), 200);
    return () => clearTimeout(t);
  }, [query, open, runSearch]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <Button variant="outline" className="gap-2 text-muted-foreground" onClick={() => setOpen(true)}>
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded border bg-muted px-1.5 text-xs sm:inline">⌘K</kbd>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg gap-0 p-0">
          <DialogHeader className="border-b p-4">
            <DialogTitle className="sr-only">Search</DialogTitle>
            <Input
              placeholder="Search events, decklists, players…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto p-2 text-sm">
            {loading ? <p className="p-4 text-muted-foreground">Searching…</p> : null}
            {!loading && results ? (
              <>
                {results.events.length > 0 ? (
                  <Section title="Events">
                    {results.events.map((r) => (
                      <button key={r.id} type="button" className="w-full rounded-md px-3 py-2 text-left hover:bg-muted" onClick={() => go(r.href)}>
                        {r.label}
                      </button>
                    ))}
                  </Section>
                ) : null}
                {results.decklists.length > 0 ? (
                  <Section title="Decklists">
                    {results.decklists.map((r) => (
                      <button key={r.id} type="button" className="w-full rounded-md px-3 py-2 text-left hover:bg-muted" onClick={() => go(r.href)}>
                        {r.label}
                      </button>
                    ))}
                  </Section>
                ) : null}
                {results.players.length > 0 ? (
                  <Section title="Players">
                    {results.players.map((r) => (
                      <button key={r.id} type="button" className="w-full rounded-md px-3 py-2 text-left hover:bg-muted" onClick={() => go(r.href)}>
                        {r.label}
                      </button>
                    ))}
                  </Section>
                ) : null}
                {!results.events.length && !results.decklists.length && !results.players.length && query ? (
                  <p className="p-4 text-muted-foreground">No results</p>
                ) : null}
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <p className="px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}
