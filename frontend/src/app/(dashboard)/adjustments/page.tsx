'use client';
import { useState } from 'react';
import { useAdjustments, useCreateAdjustment } from '@/hooks/useOperations';
import { AdjustmentFormDialog } from '@/components/operation-forms';
import { DataTable, Column } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Adjustment } from '@/types';
import { cn, formatDate } from '@/lib/utils';
import { Plus } from 'lucide-react';

export default function AdjustmentsPage() {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = useAdjustments({ page, limit: 20 });
  const createAdjustment = useCreateAdjustment();

  const columns: Column<Adjustment>[] = [
    {
      key: 'id',
      label: 'Ref',
      render: (r) => <span className="font-mono text-xs text-primary">{r.id.slice(0, 8)}…</span>,
    },
    {
      key: 'product',
      label: 'Product',
      render: (r) => (
        <div>
          <div className="font-medium text-foreground">{r.product?.name}</div>
          <div className="text-xs text-muted-foreground font-mono">{r.product?.sku}</div>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (r) => (
        <span className="text-xs bg-accent border border-border px-2 py-0.5 rounded font-mono text-muted-foreground">
          {r.location?.warehouse?.name} / {r.location?.name}
        </span>
      ),
    },
    {
      key: 'systemQuantity',
      label: 'System',
      render: (r) => <span className="font-mono text-sm">{r.systemQuantity}</span>,
    },
    {
      key: 'physicalCount',
      label: 'Physical',
      render: (r) => <span className="font-mono text-sm">{r.physicalCount}</span>,
    },
    {
      key: 'quantityChange',
      label: 'Diff',
      render: (r) => (
        <span className={cn(
          'font-mono font-bold text-sm',
          r.quantityChange < 0 ? 'text-destructive' : r.quantityChange > 0 ? 'text-success' : 'text-muted-foreground'
        )}>
          {r.quantityChange > 0 ? '+' : ''}{r.quantityChange}
        </span>
      ),
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (r) => <span className="text-xs text-muted-foreground max-w-[180px] truncate block">{r.reason}</span>,
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (r) => <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Adjustments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {data?.meta?.total ?? 0} records · physical count reconciliation
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> New Adjustment
        </Button>
      </div>

      {showForm && (
        <AdjustmentFormDialog
          onClose={() => setShowForm(false)}
          onSubmit={async (formData) => {
            await createAdjustment.mutateAsync(formData);
            setShowForm(false);
          }}
        />
      )}

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        pagination={data?.meta ? {
          page: data.meta.page,
          pages: data.meta.pages,
          total: data.meta.total,
          onPage: setPage,
        } : undefined}
      />
    </div>
  );
}
