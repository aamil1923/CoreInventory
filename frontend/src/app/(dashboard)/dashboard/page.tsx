'use client';
import { useDashboardKpis, useDashboardActivity, useDashboardAlerts } from '@/hooks/useDashboard';
import {
  Package2, TrendingDown, AlertTriangle, ArrowDownToLine,
  ArrowUpFromLine, ArrowLeftRight, RefreshCw, Loader2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { cn, formatDateTime, STATUS_COLORS } from '@/lib/utils';
import { ActivityItem } from '@/types';

const MOVEMENT_CHART = [
  { day: 'Mon', receipts: 4, deliveries: 7, transfers: 2 },
  { day: 'Tue', receipts: 8, deliveries: 5, transfers: 3 },
  { day: 'Wed', receipts: 3, deliveries: 9, transfers: 1 },
  { day: 'Thu', receipts: 12, deliveries: 6, transfers: 4 },
  { day: 'Fri', receipts: 7, deliveries: 11, transfers: 5 },
  { day: 'Sat', receipts: 2, deliveries: 3, transfers: 2 },
  { day: 'Sun', receipts: 5, deliveries: 4, transfers: 1 },
];

const STOCK_CHART = [
  { month: 'Oct', value: 1820 },
  { month: 'Nov', value: 2100 },
  { month: 'Dec', value: 1950 },
  { month: 'Jan', value: 2380 },
  { month: 'Feb', value: 2240 },
  { month: 'Mar', value: 2618 },
];

function KpiCard({ label, value, icon: Icon, variant = 'default', sub }: {
  label: string; value?: number; icon: React.ElementType; variant?: string; sub?: string;
}) {
  return (
    <div className={cn(
      'kpi-card flex flex-col gap-3',
      variant === 'warn' && 'border-warning/20',
      variant === 'danger' && 'border-destructive/20',
    )}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-widest font-mono">{label}</span>
        <div className={cn(
          'w-8 h-8 rounded-md flex items-center justify-center',
          variant === 'warn' ? 'bg-warning/10' : variant === 'danger' ? 'bg-destructive/10' : 'bg-primary/10'
        )}>
          <Icon className={cn(
            'h-4 w-4',
            variant === 'warn' ? 'text-warning' : variant === 'danger' ? 'text-destructive' : 'text-primary'
          )} />
        </div>
      </div>
      {value === undefined ? (
        <div className="h-8 w-16 bg-muted animate-pulse rounded" />
      ) : (
        <div className={cn(
          'text-3xl font-bold font-mono',
          variant === 'warn' && 'text-warning',
          variant === 'danger' && 'text-destructive',
          variant === 'default' && 'text-foreground',
        )}>{value}</div>
      )}
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  RECEIPT: ArrowDownToLine,
  DELIVERY: ArrowUpFromLine,
  TRANSFER: ArrowLeftRight,
};

export default function DashboardPage() {
  const { data: kpis } = useDashboardKpis();
  const { data: activity, isLoading: activityLoading } = useDashboardActivity();
  const { data: alerts } = useDashboardAlerts();

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time inventory overview</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-success font-mono bg-success/10 border border-success/20 rounded px-2.5 py-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          LIVE
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard label="Products" value={kpis?.totalProducts} icon={Package2} sub="total SKUs" />
        <KpiCard label="Low Stock" value={kpis?.lowStockItems} icon={TrendingDown} variant="warn" sub="below reorder" />
        <KpiCard label="Out of Stock" value={kpis?.outOfStockItems} icon={AlertTriangle} variant="danger" sub="zero inventory" />
        <KpiCard label="Receipts" value={kpis?.pendingReceipts} icon={ArrowDownToLine} sub="pending" />
        <KpiCard label="Deliveries" value={kpis?.pendingDeliveries} icon={ArrowUpFromLine} sub="pending" />
        <KpiCard label="Transfers" value={kpis?.pendingTransfers} icon={ArrowLeftRight} sub="in progress" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Movement trend */}
        <div className="xl:col-span-2 rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Movement Activity</h3>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-sm bg-primary" />Receipts</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-sm bg-destructive" />Deliveries</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-sm bg-warning" />Transfers</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MOVEMENT_CHART} barGap={4}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} width={24} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 6 }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
              />
              <Bar dataKey="receipts" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} maxBarSize={20} />
              <Bar dataKey="deliveries" fill="hsl(var(--destructive))" radius={[3, 3, 0, 0]} maxBarSize={20} />
              <Bar dataKey="transfers" fill="hsl(var(--warning))" radius={[3, 3, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stock trend */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Total Stock Value</h3>
            <p className="text-xs text-muted-foreground">6-month trend</p>
          </div>
          <div className="text-2xl font-bold font-mono text-foreground mb-3">2,618 <span className="text-sm text-muted-foreground font-normal">units</span></div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={STOCK_CHART}>
              <defs>
                <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 6 }}
                itemStyle={{ color: 'hsl(var(--primary))' }}
              />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#stockGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
          {activityLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : (
            <div className="space-y-0">
              {(activity as ActivityItem[] || []).slice(0, 7).map((a) => {
                const Icon = ACTIVITY_ICONS[a.type] || RefreshCw;
                return (
                  <div key={a.id} className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0">
                    <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center shrink-0">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground truncate font-mono">{a.id}</div>
                      <div className="text-xs text-muted-foreground">{a.party || a.type} · {formatDateTime(a.createdAt)}</div>
                    </div>
                    <span className={cn('status-badge border', STATUS_COLORS[a.status])}>{a.status}</span>
                  </div>
                );
              })}
              {(!activity || (activity as ActivityItem[]).length === 0) && (
                <p className="text-sm text-muted-foreground py-4 text-center">No recent activity</p>
              )}
            </div>
          )}
        </div>

        {/* Stock Alerts */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Stock Alerts</h3>
          <div className="space-y-0">
            {alerts?.outOfStock?.map((p: { id: string; name: string; sku: string; reorderLevel: number }) => (
              <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-border/50">
                <div>
                  <div className="text-sm text-foreground">{p.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{p.sku}</div>
                </div>
                <span className="status-badge border bg-destructive/10 text-destructive border-destructive/30">OUT</span>
              </div>
            ))}
            {alerts?.lowStock?.map((p: { id: string; name: string; sku: string; reorderLevel: number; totalStock?: number }) => (
              <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                <div className="flex-1 min-w-0 mr-3">
                  <div className="text-sm text-foreground truncate">{p.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-warning rounded-full"
                        style={{ width: `${Math.min(100, ((p.totalStock ?? 0) / p.reorderLevel) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground shrink-0">{p.totalStock ?? 0}/{p.reorderLevel}</span>
                  </div>
                </div>
                <span className="status-badge border bg-warning/10 text-warning border-warning/30">LOW</span>
              </div>
            ))}
            {!alerts?.outOfStock?.length && !alerts?.lowStock?.length && (
              <p className="text-sm text-muted-foreground py-4 text-center">No stock alerts</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
