import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, cacheSeconds = 60) {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": `public, s-maxage=${cacheSeconds}, stale-while-revalidate=${cacheSeconds * 2}`,
    },
  });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
