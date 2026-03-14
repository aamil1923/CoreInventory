import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveriesApi, getErrorMessage } from "@/lib/api";
import { toast } from "@/hooks/useToast";

export function useDeliveries(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["deliveries", params],
    queryFn: () => deliveriesApi.list(params),
  });
}

export function useCreateDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deliveriesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deliveries"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: "Delivery order created", variant: "success" });
    },
    onError: (e) => toast({ title: getErrorMessage(e), variant: "destructive" }),
  });
}

export function useValidateDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deliveriesApi.validate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deliveries"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: "Delivery validated — stock decremented", variant: "success" });
    },
    onError: (e) => toast({ title: getErrorMessage(e), variant: "destructive" }),
  });
}
