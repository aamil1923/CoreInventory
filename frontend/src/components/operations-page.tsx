"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { OperationStatus } from "@/types";
import { CheckCircle2, Plus, Loader2 } from "lucide-react";

const STATUSES: OperationStatus[] = ["DRAFT", "WAITING", "READY", "DONE", "CANCELED"];

interface OperationsPageProps<T extends { id: string; status: OperationStatus; createdAt: string }> {
  title: string;
  data: T[] | undefined;
  meta?: { page: number; pages: number; total: number };
  isLoading: boolean;
  columns: Column<T>[];
  onStatusFilter: (s: string) => void;
  statusFilter: string;
  onPageChange: (p: number) => void;
  onNew: () => void;
  newLabel: string;
  FormComponent?: React.ReactNode;
}

export function OperationsPage<T extends { id: string; status: OperationStatus; createdAt: string }>({
  title, data, meta, isLoading, columns, onStatusFilter, statusFilter,
  onPageChange, onNew, newLabel, FormComponent,
}: OperationsPageProps<T>) {
  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{meta?.total ?? 0} records</p>
        </div>
        <Button onClick={onNew}>
          <Plus className="h-4 w-4" /> {newLabel}
        </Button>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => onStatusFilter("")}
          className={cn(
            "px-3 py-1.5 rounded text-xs font-mono border transition-colors",
            !statusFilter ? "bg-primary text-primary-foreground border-primary" : "bg-transparent border-border text-muted-foreground hover:text-foreground"
          )}
        >All</button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => onStatusFilter(s)}
            className={cn(
              "px-3 py-1.5 rounded text-xs font-mono border transition-colors",
              statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "bg-transparent border-border text-muted-foreground hover:text-foreground"
            )}
          >{s}</button>
        ))}
      </div>

      {FormComponent}

      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        pagination={meta ? { page: meta.page, pages: meta.pages, total: meta.total, onPage: onPageChange } : undefined}
      />
    </div>
  );
}

export function ValidateAction({ status, onValidate, isPending }: {
  status: OperationStatus; onValidate: () => void; isPending: boolean;
}) {
  if (status === "DONE") return <StatusBadge status="DONE" />;
  if (status === "CANCELED") return <StatusBadge status="CANCELED" />;
  if (status !== "READY") return <StatusBadge status={status} />;
  return (
    <Button variant="success" size="sm" onClick={onValidate} disabled={isPending}>
      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
      Validate
    </Button>
  );
}

export function CompleteAction({ status, onComplete, isPending }: {
  status: OperationStatus; onComplete: () => void; isPending: boolean;
}) {
  if (status === "DONE") return <StatusBadge status="DONE" />;
  if (status === "CANCELED") return <StatusBadge status="CANCELED" />;
  return (
    <Button variant="success" size="sm" onClick={onComplete} disabled={isPending}>
      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
      Complete
    </Button>
  );
}
