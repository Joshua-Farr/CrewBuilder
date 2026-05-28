const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

function apiUrl(path: string) {
  if (typeof window !== "undefined") return path;
  return `${baseUrl}${path}`;
}

export async function fetchDecks(params?: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(apiUrl(`/api/decks${qs ? `?${qs}` : ""}`), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to fetch decks");
  return res.json() as Promise<{ items: unknown[]; nextCursor: string | null }>;
}

export async function fetchTournaments(params?: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(apiUrl(`/api/tournaments${qs ? `?${qs}` : ""}`), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to fetch tournaments");
  return res.json() as Promise<{ items: unknown[]; nextCursor: string | null }>;
}

export async function fetchMeta(params?: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(apiUrl(`/api/meta${qs ? `?${qs}` : ""}`), { next: { revalidate: 300 } });
  if (!res.ok) throw new Error("Failed to fetch meta");
  return res.json() as Promise<{ items: unknown[]; nextCursor: string | null }>;
}

export async function fetchLeaders(params?: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(apiUrl(`/api/leaders${qs ? `?${qs}` : ""}`), { next: { revalidate: 300 } });
  if (!res.ok) throw new Error("Failed to fetch leaders");
  return res.json() as Promise<{ leaders: unknown[]; generatedAt: string | null }>;
}
