"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/hooks/useProducts";
import { Loader2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  categoryId: z.string().uuid("Select a valid category"),
  unitOfMeasure: z.string().min(1, "Unit is required"),
  reorderLevel: z.coerce.number().int().min(0).default(10),
});

export type ProductFormValues = z.infer<typeof schema>;

interface ProductFormProps {
  defaultValues?: Partial<ProductFormValues>;
  onSubmit: (values: ProductFormValues) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function ProductForm({ defaultValues, onSubmit, isLoading, submitLabel = "Save Product" }: ProductFormProps) {
  const { data: categories, isLoading: loadingCats } = useCategories();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { reorderLevel: 10, ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" placeholder="e.g. Steel Rods 10mm" {...register("name")} />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" placeholder="e.g. SR-010" {...register("sku")} />
          {errors.sku && <p className="text-xs text-red-500">{errors.sku.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select
            value={watch("categoryId")}
            onValueChange={(v) => setValue("categoryId", v, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingCats ? "Loading..." : "Select category"} />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="uom">Unit of Measure</Label>
          <Input id="uom" placeholder="pcs, kg, m, rolls..." {...register("unitOfMeasure")} />
          {errors.unitOfMeasure && <p className="text-xs text-red-500">{errors.unitOfMeasure.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reorderLevel">Reorder Level</Label>
        <Input id="reorderLevel" type="number" min={0} {...register("reorderLevel")} />
        {errors.reorderLevel && <p className="text-xs text-red-500">{errors.reorderLevel.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}
