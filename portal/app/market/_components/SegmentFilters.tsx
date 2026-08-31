"use client";

import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import type { MarketFilters } from "@/lib/types";

const BEDROOMS = ["1", "2", "3", "4"];
const YEARS = ["1979", "1985", "1990", "1995", "2000", "2005", "2010"];
const DISTANCES = ["3", "5", "7"];

export function SegmentFilters({
  value,
  onChange,
}: {
  value: MarketFilters;
  onChange: (filters: MarketFilters) => void;
}) {
  const set = (patch: Partial<MarketFilters>) => onChange({ ...value, ...patch });

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Select
        label="Bedrooms"
        value={value.bedrooms ?? ""}
        onChange={(e) =>
          set({ bedrooms: e.target.value ? Number(e.target.value) : undefined })
        }
      >
        <option value="">Any</option>
        {BEDROOMS.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </Select>

      <Select
        label="Year built (min)"
        value={value.yearMin ?? ""}
        onChange={(e) =>
          set({ yearMin: e.target.value ? Number(e.target.value) : undefined })
        }
      >
        <option value="">Any</option>
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </Select>

      <Select
        label="Year built (max)"
        value={value.yearMax ?? ""}
        onChange={(e) =>
          set({ yearMax: e.target.value ? Number(e.target.value) : undefined })
        }
      >
        <option value="">Any</option>
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </Select>

      <Select
        label="Max distance to city (mi)"
        value={value.distanceMax ?? ""}
        onChange={(e) =>
          set({ distanceMax: e.target.value ? Number(e.target.value) : undefined })
        }
      >
        <option value="">Any</option>
        {DISTANCES.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </Select>

      {(value.bedrooms || value.yearMin || value.yearMax || value.distanceMax) && (
        <Button variant="ghost" onClick={() => onChange({})}>
          Reset
        </Button>
      )}
    </div>
  );
}
