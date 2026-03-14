"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, ArrowDownToLine, ArrowUpFromLine,
  ArrowLeftRight, SlidersHorizontal, ScrollText, LogOut, Boxes,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { clearAuth, getUser } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { section: "Operations" },
  { href: "/receipts", label: "Receipts", icon: ArrowDownToLine },
  { href: "/deliveries", label: "Deliveries", icon: ArrowUpFromLine },
  { href: "/transfers", label: "Transfers", icon: ArrowLeftRight },
  { href: "/adjustments", label: "Adjustments", icon: SlidersHorizontal },
  { section: "Reports" },
  { href: "/ledger", label: "Move History", icon: ScrollText },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <aside className="flex flex-col w-64 h-screen bg-sidebar border-r border-sidebar-border shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-14 border-b border-sidebar-border shrink-0">
        <div className="flex items-center justify-center w-7 h-7 bg-primary rounded-md shrink-0">
          <Boxes className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <div>
          <p className="font-display font-bold text-foreground text-sm leading-tight">CoreInventory</p>
          <p className="text-[10px] text-muted-foreground font-mono">IMS v1.0</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {navItems.map((item, idx) => {
          if ("section" in item) {
            return (
              <p key={idx} className="px-3 pt-4 pb-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest font-mono">
                {item.section}
              </p>
            );
          }
          const { href, label, icon: Icon } = item as { href: string; label: string; icon: React.ElementType };
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-150",
                active
                  ? "bg-accent text-foreground border-l-2 border-primary pl-[10px]"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground border-l-2 border-transparent pl-[10px]"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary text-xs font-bold font-mono shrink-0">
              {user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors pl-[10px]"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
