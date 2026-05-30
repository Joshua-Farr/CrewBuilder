import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, cacheSeconds = 60, extraHeaders?: Record<string, string>) {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": `public, s-maxage=${cacheSeconds}, stale-while-revalidate=${cacheSeconds * 2}`,
      ...extraHeaders,
    },
  });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
