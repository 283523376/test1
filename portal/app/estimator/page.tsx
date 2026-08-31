import type { Metadata } from "next";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageHeader } from "@/components/PageHeader";
import { EstimatorClient } from "./_components/EstimatorClient";

export const metadata: Metadata = { title: "Property Value Estimator" };

export default function EstimatorPage() {
  return (
    <div>
      <PageHeader
        title="Property Value Estimator"
        description="Enter a property's details to get an instant price prediction, save estimates, and compare multiple properties side-by-side."
      />
      <ErrorBoundary>
        <EstimatorClient />
      </ErrorBoundary>
    </div>
  );
}
