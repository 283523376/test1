"use client";

import { PricePositionChart, type MarketRange } from "@/components/charts/PricePositionChart";
import { HOUSING_FIELDS } from "@/lib/fields";
import { formatCurrency } from "@/lib/format";
import type { Estimate } from "@/lib/types";

export function PredictionResult({
  estimate,
  market,
}: {
  estimate: Estimate;
  market?: MarketRange | null;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-slate-500">Estimated price</p>
        <p className="text-4xl font-semibold tracking-tight text-slate-900">
          {formatCurrency(estimate.price)}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-2 font-medium">Feature</th>
                <th scope="col" className="px-4 py-2 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {HOUSING_FIELDS.map((f) => (
                <tr key={f.name} className="border-t border-slate-100">
                  <td className="px-4 py-2 text-slate-600">{f.label}</td>
                  <td className="px-4 py-2 font-medium tabular-nums text-slate-900">
                    {estimate.features[f.name]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="h-64">
          <PricePositionChart predicted={estimate.price} market={market} />
        </div>
      </div>
    </div>
  );
}
