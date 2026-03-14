"use client";
import { Suspense } from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCategories, useCreateProduct, useUpdateProduct, useProduct } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name:          z.string().min(1, "Name required"),
  sku:           z.string().min(1, "SKU required"),
  categoryId:    z.string().uuid("Select a category"),
  unitOfMeasure: z.string().min(1, "UOM required"),
  reorderLevel:  z.coerce.number().int().min(0),
});
type FormData = z.infer<typeof schema>;

function CreateProductForm() {
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get("edit");

  const { data: categories } = useCategories();
  const { data: existing } = useProduct(editId ?? "");
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { reorderLevel: 10 },
  });

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name, sku: existing.sku,
        categoryId: existing.categoryId, unitOfMeasure: existing.unitOfMeasure,
        reorderLevel: existing.reorderLevel,
      });
    }
  }, [existing, reset]);

  const onSubmit = async (data: FormData) => {
    if (editId) await updateProduct.mutateAsync({ id: editId, data });
    else await createProduct.mutateAsync(data);
    router.push("/products");
  };

  return (
    <div className="max-w-lg space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{editId ? "Edit Product" : "New Product"}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Fill in product details</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Product Name</Label>
              <Input placeholder="e.g. Steel Rods 10mm" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>SKU</Label>
              <Input placeholder="e.g. SR-010" className="font-mono" {...register("sku")} />
              {errors.sku && <p className="text-xs text-destructive">{errors.sku.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Unit of Measure</Label>
              <Input placeholder="pcs, kg, m…" {...register("unitOfMeasure")} />
              {errors.unitOfMeasure && <p className="text-xs text-destructive">{errors.unitOfMeasure.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-input px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                {...register("categoryId")}
              >
                <option value="">Select category…</option>
                {(categories as { id: string; name: string }[] ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Reorder Level</Label>
              <Input type="number" min="0" placeholder="10" className="font-mono" {...register("reorderLevel")} />
              {errors.reorderLevel && <p className="text-xs text-destructive">{errors.reorderLevel.message}</p>}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {editId ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateProductPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground text-sm font-mono p-4">Loading…</div>}>
      <CreateProductForm />
    </Suspense>
  );
}
