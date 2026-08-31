"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/Button";
import { marketExportUrl } from "@/lib/api";
import type { MarketFilters, Property } from "@/lib/types";

export function ExportBar({
  filters,
  properties,
}: {
  filters: MarketFilters;
  properties: Property[];
}) {
  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Property Market Data", 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [["ID", "Sq ft", "Beds", "Baths", "Year", "Lot", "Distance", "School", "Price"]],
      body: properties.map((p) => [
        p.id,
        p.squareFootage,
        p.bedrooms,
        p.bathrooms,
        p.yearBuilt,
        p.lotSize,
        p.distanceToCityCenter,
        p.schoolRating,
        p.price,
      ]),
    });
    doc.save("market-data.pdf");
  };

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={marketExportUrl(filters)}
        className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
      >
        Download CSV
      </a>
      <Button variant="secondary" onClick={exportPdf} disabled={properties.length === 0}>
        Download PDF
      </Button>
    </div>
  );
}
