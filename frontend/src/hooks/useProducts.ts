import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi, getErrorMessage } from "@/lib/api";
import { toast } from "@/hooks/useToast";

export function useProducts(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productsApi.list(params),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => productsApi.get(id),
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: productsApi.categories,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product created", variant: "success" });
    },
    onError: (e) => toast({ title: getErrorMessage(e), variant: "destructive" }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => productsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product updated", variant: "success" });
    },
    onError: (e) => toast({ title: getErrorMessage(e), variant: "destructive" }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product deleted", variant: "success" });
    },
    onError: (e) => toast({ title: getErrorMessage(e), variant: "destructive" }),
  });
}
