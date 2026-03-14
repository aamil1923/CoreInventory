import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { receiptsApi, getErrorMessage } from "@/lib/api";
import { toast } from "@/hooks/useToast";

export function useReceipts(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["receipts", params],
    queryFn: () => receiptsApi.list(params),
  });
}

export function useCreateReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: receiptsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["receipts"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: "Receipt created", variant: "success" });
    },
    onError: (e) => toast({ title: getErrorMessage(e), variant: "destructive" }),
  });
}

export function useValidateReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: receiptsApi.validate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["receipts"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: "Receipt validated — stock updated", variant: "success" });
    },
    onError: (e) => toast({ title: getErrorMessage(e), variant: "destructive" }),
  });
}
