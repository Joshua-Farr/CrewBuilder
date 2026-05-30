import { META_CACHE_HEADERS } from "@/lib/meta/cache";
import { getMetaConversion } from "@/lib/meta/analytics-service";
import { metaQuerySchema } from "@/lib/schemas/api";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = metaQuerySchema.safeParse(params);
  if (!parsed.success) return jsonError(parsed.error.message);

  const { format, opSet, region, window, venue, eventType } = parsed.data;
  const data = await getMetaConversion({ format, opSet, region, window, venue, eventType });
  return jsonOk(data, 300, META_CACHE_HEADERS);
}
