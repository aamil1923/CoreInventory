"use client";
import { usePathname } from "next/navigation";
import { getUser } from "@/lib/auth";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard":  { title: "Dashboard",         subtitle: "Real-time inventory overview" },
  "/products":   { title: "Products",           subtitle: "Manage your product catalog" },
  "/products/create": { title: "New Product",   subtitle: "Add a product to your catalog" },
  "/receipts":   { title: "Receipts",           subtitle: "Incoming goods from suppliers" },
  "/deliveries": { title: "Delivery Orders",    subtitle: "Outbound shipments to customers" },
  "/transfers":  { title: "Internal Transfers", subtitle: "Move stock between locations" },
  "/adjustments":{ title: "Adjustments",        subtitle: "Reconcile physical vs system stock" },
  "/ledger":     { title: "Movement History",   subtitle: "Full audit trail of stock movements" },
};

export function Header() {
  const pathname = usePathname();
  const user = getUser();
  const meta = PAGE_TITLES[pathname] ?? { title: "CoreInventory", subtitle: "" };

  return (
    <header className="flex items-center justify-between px-6 h-14 bg-card border-b border-border shrink-0">
      <div>
        <h2 className="text-sm font-semibold text-foreground">{meta.title}</h2>
        {meta.subtitle && <p className="text-xs text-muted-foreground">{meta.subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-success font-mono bg-success/10 border border-success/20 rounded px-2 py-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          LIVE
        </div>
        {user && (
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-foreground">{user.name}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{user.role}</p>
            </div>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-xs font-bold font-mono">
              {user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
