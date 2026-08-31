import type { Metadata } from "next";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageHeader } from "@/components/PageHeader";
import { fetchMarketProperties, fetchMarketSegments, fetchMarketSummary } from "@/lib/server";
import { MarketClient } from "./_components/MarketClient";

export const metadata: Metadata = { title: "Property Market Analysis" };

export default async function MarketPage() {
  // Server-side initial data loading (React Server Component).
  const [s, seg, p] = await Promise.allSettled([
    fetchMarketSummary(),
    fetchMarketSegments(),
    fetchMarketProperties(),
  ]);

  return (
    <div>
      <PageHeader
        title="Property Market Analysis"
        description="Explore aggregate market statistics, filter segments, run what-if scenarios, and export the data to CSV or PDF."
      />
      <ErrorBoundary>
        <MarketClient
          initialSummary={s.status === "fulfilled" ? s.value : null}
          initialSegments={seg.status === "fulfilled" ? seg.value : null}
          initialProperties={p.status === "fulfilled" ? p.value : null}
        />
      </ErrorBoundary>
    </div>
  );
}
