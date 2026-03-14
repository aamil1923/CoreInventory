"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Trash2, Edit2, Loader2 } from "lucide-react";
import { useProducts, useCategories, useDeleteProduct } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Product } from "@/types";
import { cn } from "@/lib/utils";

export default function ProductsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useProducts({
    ...(search && { search }),
    ...(activeCat && { categoryId: activeCat }),
    page,
    limit: 20,
  });

  const { data: categories } = useCategories();
  const deleteProduct = useDeleteProduct();

  const columns: Column<Product>[] = [
    {
      key: "sku", label: "SKU",
      render: (p) => <span className="font-mono text-primary text-xs">{p.sku}</span>,
    },
    {
      key: "name", label: "Name",
      render: (p) => <span className="font-medium text-foreground">{p.name}</span>,
    },
    {
      key: "category", label: "Category",
      render: (p) => (
        <span className="text-xs bg-accent border border-border px-2 py-0.5 rounded font-mono text-muted-foreground">
          {p.category?.name}
        </span>
      ),
    },
    {
      key: "unitOfMeasure", label: "UOM",
      render: (p) => <span className="font-mono text-xs text-muted-foreground">{p.unitOfMeasure}</span>,
    },
    {
      key: "totalStock", label: "Stock",
      render: (p) => {
        const stock = p.totalStock ?? 0;
        const isOut = stock === 0;
        const isLow = !isOut && stock < p.reorderLevel;
        return (
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-mono font-bold text-sm",
              isOut ? "text-destructive" : isLow ? "text-warning" : "text-foreground"
            )}>{stock}</span>
            {isOut && <StatusBadge status="OUT" />}
            {isLow && <StatusBadge status="LOW" />}
          </div>
        );
      },
    },
    {
      key: "reorderLevel", label: "Reorder",
      render: (p) => <span className="font-mono text-xs text-muted-foreground">{p.reorderLevel}</span>,
    },
    {
      key: "actions", label: "",
      render: (p) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="sm"
            onClick={(e) => { e.stopPropagation(); router.push(`/products/create?edit=${p.id}`); }}>
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete "${p.name}"?`)) deleteProduct.mutate(p.id);
            }}>
            {deleteProduct.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{data?.meta?.total ?? 0} total SKUs</p>
        </div>
        <Button onClick={() => router.push("/products/create")}>
          <Plus className="h-4 w-4" /> New Product
        </Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search name or SKU…" className="pl-9"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => { setActiveCat(""); setPage(1); }}
            className={cn(
              "px-3 py-1.5 rounded text-xs font-mono border transition-colors",
              !activeCat ? "bg-primary text-primary-foreground border-primary" : "bg-transparent border-border text-muted-foreground hover:text-foreground"
            )}>All</button>
          {(categories as { id: string; name: string }[] ?? []).map((c) => (
            <button key={c.id}
              onClick={() => { setActiveCat(c.id); setPage(1); }}
              className={cn(
                "px-3 py-1.5 rounded text-xs font-mono border transition-colors",
                activeCat === c.id ? "bg-primary text-primary-foreground border-primary" : "bg-transparent border-border text-muted-foreground hover:text-foreground"
              )}>{c.name}</button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        pagination={data?.meta ? {
          page: data.meta.page, pages: data.meta.pages,
          total: data.meta.total, onPage: setPage,
        } : undefined}
      />
    </div>
  );
}
