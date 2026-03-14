"use client";
import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  label: string;
  header?: string;
  sortable?: boolean;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

interface Pagination {
  page: number;
  pages: number;
  total: number;
  onPage: (p: number) => void;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  pagination?: Pagination;
  // legacy compat
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  totalCount?: number;
}

export function DataTable<T extends Record<string, unknown>>({
  data, columns, isLoading, emptyMessage = "No records found",
  pagination, totalPages, currentPage, onPageChange, totalCount = 0,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const av = a[sortKey]; const bv = b[sortKey];
    if (av === undefined || bv === undefined) return 0;
    const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
    return sortDir === "asc" ? cmp : -cmp;
  });

  // normalise pagination
  const pg = pagination ?? (totalPages && totalPages > 1 ? {
    page: currentPage ?? 1, pages: totalPages, total: totalCount,
    onPage: onPageChange ?? (() => {}),
  } : undefined);

  return (
    <div className="w-full">
      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-widest whitespace-nowrap font-mono",
                      col.sortable && "cursor-pointer select-none hover:text-foreground",
                      col.className
                    )}
                    onClick={() => col.sortable && toggleSort(col.key)}
                  >
                    <span className="flex items-center gap-1">
                      {col.label ?? col.header}
                      {col.sortable && (
                        sortKey === col.key
                          ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
                          : <ChevronsUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                sorted.map((row, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className={cn("px-4 py-3 text-muted-foreground", col.className)}>
                        {col.render ? col.render(row) : String(row[col.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pg && pg.pages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-xs text-muted-foreground font-mono">
            Page {pg.page} of {pg.pages} · {pg.total} records
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => pg.onPage(pg.page - 1)} disabled={pg.page <= 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs font-mono text-muted-foreground px-1">{pg.page}</span>
            <Button variant="outline" size="sm" onClick={() => pg.onPage(pg.page + 1)} disabled={pg.page >= pg.pages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
