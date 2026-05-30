import { META_CACHE_HEADERS } from "@/lib/meta/cache";
import { getMetaPrep } from "@/lib/meta/analytics-service";
import { metaPrepSchema, metaQuerySchema } from "@/lib/schemas/api";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = metaPrepSchema.safeParse(body);
    if (!parsed.success) return jsonError(parsed.error.message);

    const { metaShares, format, opSet } = parsed.data;
    const data = await getMetaPrep(metaShares, { format, opSet });
    return jsonOk(data, 300, META_CACHE_HEADERS);
  } catch {
    return jsonError("Invalid request body");
  }
}

export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = metaQuerySchema.safeParse(params);
  if (!parsed.success) return jsonError(parsed.error.message);

  const defaultShares: Record<string, number> = {
    "op07-079": 25,
    "op05-060": 20,
    "op06-001": 15,
    "op08-058": 12,
    "st13-001": 10,
    "op09-001": 8,
    "op04-040": 5,
    "op03-040": 5,
  };

  const data = await getMetaPrep(defaultShares, {
    format: parsed.data.format,
    opSet: parsed.data.opSet,
  });
  return jsonOk(data, 300, META_CACHE_HEADERS);
}
