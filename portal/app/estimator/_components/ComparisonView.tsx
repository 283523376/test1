"use client";

import { HOUSING_FIELDS } from "@/lib/fields";
import { formatCurrency } from "@/lib/format";
import type { CompareRow } from "@/lib/types";

export function ComparisonView({ rows }: { rows: CompareRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50">
            <th scope="col" className="px-4 py-2 text-left font-medium text-slate-500">
              Feature
            </th>
            {rows.map((r, i) => (
              <th
                scope="col"
                key={i}
                className="px-4 py-2 text-left font-medium text-slate-700"
              >
                {r.label || `Property ${i + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HOUSING_FIELDS.map((f) => (
            <tr key={f.name} className="border-t border-slate-100">
              <td className="px-4 py-2 text-slate-600">{f.label}</td>
              {rows.map((r, i) => (
                <td key={i} className="px-4 py-2 tabular-nums text-slate-900">
                  {r.features[f.name]}
                </td>
              ))}
            </tr>
          ))}
          <tr className="border-t border-slate-200 bg-indigo-50/50">
            <td className="px-4 py-2 font-semibold text-slate-900">Predicted price</td>
            {rows.map((r, i) => (
              <td key={i} className="px-4 py-2 font-semibold tabular-nums text-indigo-700">
                {formatCurrency(r.price)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
