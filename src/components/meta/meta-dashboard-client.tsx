"use client";

import * as React from "react";
import { MetaFilterBar, DEFAULT_META_FILTERS } from "@/components/analytics/filters/meta-filter-bar";
import { AnalyticsSectionSkeleton } from "@/components/analytics/skeletons/analytics-section-skeleton";
import { MatchupMatrixSection } from "@/components/meta/sections/matchup-matrix-section";
import { MetaOverviewSection } from "@/components/meta/sections/meta-overview-section";
import { RegionalMetaSection } from "@/components/meta/sections/regional-meta-section";
import { TechCardAnalyticsSection } from "@/components/meta/sections/tech-card-analytics-section";
import { TopCutConversionSection } from "@/components/meta/sections/top-cut-conversion-section";
import { TrendAnalyticsSection } from "@/components/meta/sections/trend-analytics-section";
import { getMockAnalyticsBundle } from "@/lib/meta/mock-analytics";
import type { MetaAnalyticsBundle, MetaFilters } from "@/lib/meta/types";

function buildQuery(filters: MetaFilters) {
  const params = new URLSearchParams();
  params.set("window", filters.window);
  params.set("format", filters.format);
  params.set("opSet", filters.opSet);
  if (filters.region) params.set("region", filters.region);
  if (filters.venue !== "all") params.set("venue", filters.venue);
  if (filters.eventType) params.set("eventType", filters.eventType);
  return params.toString();
}

async function fetchSection<T>(path: string, filters: MetaFilters): Promise<T | null> {
  try {
    const res = await fetch(`/api/meta/${path}?${buildQuery(filters)}`);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function MetaDashboardClient({ initialFilters }: { initialFilters?: Partial<MetaFilters> }) {
  const [filters, setFilters] = React.useState<MetaFilters>({ ...DEFAULT_META_FILTERS, ...initialFilters });
  const [loading, setLoading] = React.useState(true);
  const [bundle, setBundle] = React.useState<MetaAnalyticsBundle>(() => getMockAnalyticsBundle(filters));

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      const [overview, matchups, trends, techCards, conversion, regional] = await Promise.all([
        fetchSection<MetaAnalyticsBundle["overview"]>("overview", filters),
        fetchSection<MetaAnalyticsBundle["matchups"]>("matchups", filters),
        fetchSection<MetaAnalyticsBundle["trends"]>("trends", filters),
        fetchSection<{ cards: MetaAnalyticsBundle["techCards"]["byLeader"][string]; dataQuality: MetaAnalyticsBundle["techCards"]["dataQuality"] }>("tech-cards", filters),
        fetchSection<MetaAnalyticsBundle["conversion"]>("conversion", filters),
        fetchSection<MetaAnalyticsBundle["regional"]>("regional", filters),
      ]);

      if (cancelled) return;

      const mock = getMockAnalyticsBundle(filters);
      const techByLeader = mock.techCards.byLeader;
      if (techCards?.cards) {
        const leaderId = Object.keys(techByLeader)[0];
        if (leaderId) techByLeader[leaderId] = techCards.cards;
      }

      setBundle({
        overview: overview ?? mock.overview,
        matchups: matchups ?? mock.matchups,
        trends: trends ?? mock.trends,
        techCards: { byLeader: techByLeader, dataQuality: techCards?.dataQuality ?? mock.techCards.dataQuality },
        conversion: conversion ?? mock.conversion,
        regional: regional ?? mock.regional,
      });
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [filters]);

  if (loading) {
    return (
      <div className="space-y-8">
        <MetaFilterBar filters={filters} onChange={setFilters} />
        <AnalyticsSectionSkeleton />
        <AnalyticsSectionSkeleton />
      </div>
    );
  }

  const { overview, matchups, trends, techCards, conversion, regional } = bundle;

  return (
    <div className="space-y-10">
      <MetaFilterBar filters={filters} onChange={setFilters} />

      <MetaOverviewSection
        leaders={overview.leaders}
        dataQuality={overview.dataQuality}
        generatedAt={overview.generatedAt}
      />

      <MatchupMatrixSection
        leaders={matchups.leaders}
        matrix={matchups.matrix}
        dataQuality={matchups.dataQuality}
        generatedAt={overview.generatedAt}
      />

      <TrendAnalyticsSection
        leaders={overview.leaders}
        trendPoints={trends.points}
        highlights={trends.highlights}
        dataQuality={trends.dataQuality}
        generatedAt={overview.generatedAt}
      />

      <TechCardAnalyticsSection
        leaders={overview.leaders}
        techCardsByLeader={techCards.byLeader}
        dataQuality={techCards.dataQuality}
        generatedAt={overview.generatedAt}
      />

      <TopCutConversionSection
        rows={conversion.rows}
        dataQuality={conversion.dataQuality}
        generatedAt={overview.generatedAt}
      />

      <RegionalMetaSection
        snapshots={regional.snapshots}
        globalLeaders={regional.globalLeaders}
        dataQuality={regional.dataQuality}
        generatedAt={overview.generatedAt}
      />
    </div>
  );
}
