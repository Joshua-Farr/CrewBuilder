import type { SourceId } from "@/lib/schemas/common";
import type { ScraperProvider } from "./base/scraper-interface";
import { limitlessProvider } from "./limitless/provider";
import { onepiecetopdecksProvider } from "./onepiecetopdecks/provider";
import { egmanProvider } from "./egman/provider";
import { gumgumProvider } from "./gumgum/provider";
import { onepieceggProvider } from "./onepiecegg/provider";

const providers: Record<SourceId, ScraperProvider> = {
  limitless: limitlessProvider,
  onepiecetopdecks: onepiecetopdecksProvider,
  egman: egmanProvider,
  gumgum: gumgumProvider,
  onepiecegg: onepieceggProvider,
};

export function getProvider(source: SourceId): ScraperProvider {
  const provider = providers[source];
  if (!provider) throw new Error(`Unknown scraper source: ${source}`);
  return provider;
}

export function getAllProviders(): ScraperProvider[] {
  return Object.values(providers);
}

export function getEnabledSources(): SourceId[] {
  return (Object.keys(providers) as SourceId[]).filter((id) => {
    if (process.env.INGESTION_DISABLED_SOURCES) {
      const disabled = process.env.INGESTION_DISABLED_SOURCES.split(",");
      return !disabled.includes(id);
    }
    return true;
  });
}
