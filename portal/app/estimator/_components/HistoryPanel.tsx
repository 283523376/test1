"use client";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Estimate } from "@/lib/types";

export function HistoryPanel({
  items,
  loading,
  error,
  selectedIds,
  onToggleSelect,
  onDelete,
}: {
  items: Estimate[];
  loading: boolean;
  error: string | null;
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-2" role="status" aria-label="Loading history">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    );
  }

  if (error) return <Alert tone="error">{error}</Alert>;

  if (items.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No estimates yet — submit a property to get started.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {items.map((item) => {
        const selected = selectedIds.includes(item.id);
        const name = item.label || `Estimate #${item.id}`;
        return (
          <li key={item.id} className="flex items-center gap-3 py-3">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(item.id)}
              aria-label={`Select ${name}`}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{name}</p>
              <p className="text-xs text-slate-500">{formatDate(item.created_at)}</p>
            </div>
            <span className="text-sm font-semibold tabular-nums text-slate-900">
              {formatCurrency(item.price)}
            </span>
            <Button
              variant="ghost"
              onClick={() => onDelete(item.id)}
              aria-label={`Delete ${name}`}
              className="px-2 text-rose-600 hover:bg-rose-50"
            >
              Delete
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
