import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { OperationStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric", month: "short", day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(date));
}

export const STATUS_COLORS: Record<OperationStatus, string> = {
  DRAFT:    "bg-muted text-muted-foreground border-border",
  WAITING:  "bg-warning/10 text-warning border-warning/30",
  READY:    "bg-info/10 text-info border-info/30",
  DONE:     "bg-success/10 text-success border-success/30",
  CANCELED: "bg-destructive/10 text-destructive border-destructive/30",
};
