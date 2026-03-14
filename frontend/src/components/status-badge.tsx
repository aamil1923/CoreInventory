"use client";
import { cn } from "@/lib/utils";

type AnyStatus = string;

const STATUS_MAP: Record<string, string> = {
  DRAFT:    "bg-muted text-muted-foreground border-border",
  WAITING:  "bg-warning/10 text-warning border-warning/30",
  READY:    "bg-info/10 text-info border-info/30",
  DONE:     "bg-success/10 text-success border-success/30",
  CANCELED: "bg-destructive/10 text-destructive border-destructive/30",
  LOW:      "bg-warning/10 text-warning border-warning/30",
  OUT:      "bg-destructive/10 text-destructive border-destructive/30",
  OK:       "bg-success/10 text-success border-success/30",
  RECEIPT:  "bg-success/10 text-success border-success/30",
  DELIVERY: "bg-destructive/10 text-destructive border-destructive/30",
  TRANSFER: "bg-info/10 text-info border-info/30",
  ADJUSTMENT: "bg-warning/10 text-warning border-warning/30",
};

export function StatusBadge({ status }: { status: AnyStatus }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium font-mono tracking-wide border",
      STATUS_MAP[status] ?? "bg-muted text-muted-foreground border-border"
    )}>
      {status}
    </span>
  );
}
