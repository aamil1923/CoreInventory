"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Eye, EyeOff, Package2 } from "lucide-react";
import { authApi, getErrorMessage } from "@/lib/api";
import { saveAuth, isAuthenticated } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email:    z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated()) router.replace("/dashboard");
  }, [router]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      const res = await authApi.login(data);
      saveAuth(res.data.token, res.data.user);
      router.push("/dashboard");
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-[400px] bg-card border-r border-border p-10 justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <Package2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-base font-bold">CoreInventory</span>
        </div>
        <div>
          <h1 className="font-display text-4xl font-bold leading-tight text-foreground mb-4">
            Inventory<br />Operations<br />Simplified.
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Real-time stock tracking, multi-warehouse support, and full audit trails — all in one platform.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Stock Latency", value: "<500ms" },
            { label: "Audit Trail",   value: "100%" },
            { label: "Warehouses",    value: "Multi" },
            { label: "Transactions",  value: "ACID" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-background p-3">
              <div className="text-xl font-bold font-mono text-primary">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
              <Package2 className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">CoreInventory</span>
          </div>

          <h2 className="font-display text-2xl font-bold mb-1">Welcome back</h2>
          <p className="text-muted-foreground text-sm mb-8">Sign in to your workspace</p>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@company.com"
                autoComplete="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPwd ? "text" : "password"}
                  placeholder="••••••••" autoComplete="current-password"
                  className="pr-10" {...register("password")} />
                <button type="button" onClick={() => setShowPwd((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>

          <div className="mt-6 p-3 rounded-md border border-border bg-card">
            <p className="text-xs text-muted-foreground mb-2 font-mono uppercase tracking-wider">Demo credentials</p>
            <div className="space-y-1 text-xs font-mono">
              <p><span className="text-muted-foreground">Manager →</span> <span className="text-foreground">manager@coreinventory.io</span> <span className="text-muted-foreground">/</span> <span className="text-foreground">manager123</span></p>
              <p><span className="text-muted-foreground">Staff →</span> <span className="text-foreground">staff@coreinventory.io</span> <span className="text-muted-foreground">/</span> <span className="text-foreground">staff123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
