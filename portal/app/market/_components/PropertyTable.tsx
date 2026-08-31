"use client";

import { useMemo, useState } from "react";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { Property } from "@/lib/types";

const COLUMNS = [
  { key: "price", label: "Price" },
  { key: "squareFootage", label: "Sq ft" },
  { key: "bedrooms", label: "Beds" },
  { key: "bathrooms", label: "Baths" },
  { key: "yearBuilt", label: "Year" },
  { key: "lotSize", label: "Lot" },
  { key: "distanceToCityCenter", label: "Distance (mi)" },
  { key: "schoolRating", label: "School" },
] as const;

type SortKey = (typeof COLUMNS)[number]["key"];

export function PropertyTable({ properties }: { properties: Property[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("price");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const arr = [...properties];
    arr.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === bv) return 0;
      const gt = av > bv ? 1 : -1;
      return sortDir === "asc" ? gt : -gt;
    });
    return arr;
  }, [properties, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  if (properties.length === 0) {
    return <p className="text-sm text-slate-500">No properties match the current filters.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50">
            {COLUMNS.map((c) => (
              <th key={c.key} scope="col" className="text-left">
                <button
                  type="button"
                  onClick={() => toggleSort(c.key)}
                  aria-sort={
                    sortKey === c.key ? (sortDir === "asc" ? "ascending" : "descending") : undefined
                  }
                  className="flex items-center gap-1 px-4 py-2 font-medium text-slate-500 hover:text-slate-900"
                >
                  {c.label}
                  {sortKey === c.key && <span aria-hidden>{sortDir === "asc" ? "↑" : "↓"}</span>}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr key={p.id} className="border-t border-slate-100">
              <td className="px-4 py-2 font-medium tabular-nums text-slate-900">
                {formatCurrency(p.price)}
              </td>
              <td className="px-4 py-2 tabular-nums text-slate-700">
                {formatNumber(p.squareFootage)}
              </td>
              <td className="px-4 py-2 text-slate-700">{p.bedrooms}</td>
              <td className="px-4 py-2 text-slate-700">{p.bathrooms}</td>
              <td className="px-4 py-2 text-slate-700">{p.yearBuilt}</td>
              <td className="px-4 py-2 tabular-nums text-slate-700">{formatNumber(p.lotSize)}</td>
              <td className="px-4 py-2 tabular-nums text-slate-700">
                {formatNumber(p.distanceToCityCenter, 1)}
              </td>
              <td className="px-4 py-2 tabular-nums text-slate-700">
                {formatNumber(p.schoolRating, 1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
