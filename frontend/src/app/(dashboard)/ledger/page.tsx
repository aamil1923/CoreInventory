'use client';
import { useState } from 'react';
import { ledgerApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { DataTable, Column } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { LedgerEntry, MovementType } from '@/types';
import { cn, formatDateTime } from '@/lib/utils';

const MOVEMENT_TYPES: MovementType[] = ['RECEIPT', 'DELIVERY', 'TRANSFER', 'ADJUSTMENT'];

export default function LedgerPage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['ledger', { page, movementType: typeFilter }],
    queryFn: () => ledgerApi.list({
      page,
      limit: 30,
      ...(typeFilter && { movementType: typeFilter }),
    }),
  });

  const columns: Column<LedgerEntry>[] = [
    {
      key: 'id',
      label: 'ID',
      render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.id.slice(0, 8)}…</span>,
    },
    {
      key: 'product',
      label: 'Product',
      render: (r) => (
        <div>
          <div className="text-sm text-foreground">{r.product?.name}</div>
          <div className="text-xs text-muted-foreground font-mono">{r.product?.sku}</div>
        </div>
      ),
    },
    {
      key: 'movementType',
      label: 'Type',
      render: (r) => <StatusBadge status={r.movementType} />,
    },
    {
      key: 'quantityChange',
      label: 'Qty Change',
      render: (r) => (
        <span className={cn(
          'font-mono font-bold text-sm',
          r.quantityChange > 0 ? 'text-success' : 'text-destructive'
        )}>
          {r.quantityChange > 0 ? '+' : ''}{r.quantityChange}
        </span>
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
      key: 'referenceId',
      label: 'Reference',
      render: (r) => <span className="font-mono text-xs text-primary">{r.referenceId.slice(0, 12)}…</span>,
    },
    {
      key: 'createdAt',
      label: 'Timestamp',
      render: (r) => <span className="text-xs text-muted-foreground font-mono">{formatDateTime(r.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold">Movement History</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {data?.total ?? 0} ledger entries · full audit trail
        </p>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => { setTypeFilter(''); setPage(1); }}
          className={cn(
            'px-3 py-1.5 rounded text-xs font-mono border transition-colors',
            !typeFilter ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent border-border text-muted-foreground hover:text-foreground'
          )}
        >All</button>
        {MOVEMENT_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => { setTypeFilter(t); setPage(1); }}
            className={cn(
              'px-3 py-1.5 rounded text-xs font-mono border transition-colors',
              typeFilter === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent border-border text-muted-foreground hover:text-foreground'
            )}
          >{t}</button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data?.entries ?? []}
        isLoading={isLoading}
        emptyMessage="No ledger entries yet"
        pagination={data ? {
          page: data.page,
          pages: data.pages,
          total: data.total,
          onPage: setPage,
        } : undefined}
      />
    </div>
  );
}
