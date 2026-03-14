import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transfersApi, adjustmentsApi, warehousesApi, getErrorMessage } from "@/lib/api";
import { toast } from "@/hooks/useToast";

// ── Transfers ──────────────────────────────────────────────────────────────
export function useTransfers(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["transfers", params],
    queryFn: () => transfersApi.list(params),
  });
}

export function useCreateTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: transfersApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transfers"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: "Transfer created", variant: "success" });
    },
    onError: (e) => toast({ title: getErrorMessage(e), variant: "destructive" }),
  });
}

export function useCompleteTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: transfersApi.complete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transfers"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: "Transfer completed — stock relocated", variant: "success" });
    },
    onError: (e) => toast({ title: getErrorMessage(e), variant: "destructive" }),
  });
}

// ── Adjustments ────────────────────────────────────────────────────────────
export function useAdjustments(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["adjustments", params],
    queryFn: () => adjustmentsApi.list(params),
  });
}

export function useCreateAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adjustmentsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adjustments"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: "Adjustment recorded — stock corrected", variant: "success" });
    },
    onError: (e) => toast({ title: getErrorMessage(e), variant: "destructive" }),
  });
}

// ── Warehouses / Locations ─────────────────────────────────────────────────
export function useWarehouses() {
  return useQuery({
    queryKey: ["warehouses"],
    queryFn: warehousesApi.list,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLocations(warehouseId?: string) {
  return useQuery({
    queryKey: ["locations", warehouseId],
    queryFn: () => warehousesApi.locations(warehouseId),
    staleTime: 5 * 60 * 1000,
  });
}
