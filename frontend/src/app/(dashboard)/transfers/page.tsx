"use client";
import { useState } from "react";
import { useTransfers, useCreateTransfer, useCompleteTransfer } from "@/hooks/useOperations";
import { OperationsPage, CompleteAction } from "@/components/operations-page";
import { TransferFormDialog } from "@/components/operation-forms";
import { Column } from "@/components/data-table";
import { Transfer } from "@/types";
import { cn, formatDate, STATUS_COLORS } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export default function TransfersPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useTransfers({
    ...(statusFilter && { status: statusFilter }), page, limit: 20,
  });
  const createTransfer = useCreateTransfer();
  const completeTransfer = useCompleteTransfer();

  const columns: Column<Transfer>[] = [
    { key: "id", label: "Ref",
      render: (r) => <span className="font-mono text-xs text-primary">{r.id.slice(0, 8)}…</span> },
    { key: "route", label: "Route",
      render: (r) => {
        const first = r.items[0];
        if (!first) return <span className="text-muted-foreground text-xs">—</span>;
        return (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="bg-accent border border-border px-1.5 py-0.5 rounded font-mono text-muted-foreground">
              {first.sourceLocation?.warehouse?.name}
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="bg-accent border border-border px-1.5 py-0.5 rounded font-mono text-muted-foreground">
              {first.destinationLocation?.warehouse?.name}
            </span>
          </div>
        );
      }},
    { key: "products", label: "Products",
      render: (r) => (
        <div className="space-y-0.5">
          {r.items.slice(0, 2).map((it) => (
            <div key={it.id} className="text-xs text-muted-foreground font-mono">
              {it.product?.name} × {it.quantity}
            </div>
          ))}
          {r.items.length > 2 && <div className="text-xs text-muted-foreground">+{r.items.length - 2} more</div>}
        </div>
      )},
    { key: "status", label: "Status",
      render: (r) => <span className={cn("status-badge border", STATUS_COLORS[r.status])}>{r.status}</span> },
    { key: "createdAt", label: "Date",
      render: (r) => <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span> },
    { key: "actions", label: "",
      render: (r) => (
        <div className="flex justify-end">
          <CompleteAction status={r.status}
            onComplete={() => completeTransfer.mutate(r.id)}
            isPending={completeTransfer.isPending && completeTransfer.variables === r.id} />
        </div>
      )},
  ];

  return (
    <OperationsPage
      title="Internal Transfers"
      data={data?.data}
      meta={data?.meta}
      isLoading={isLoading}
      columns={columns}
      statusFilter={statusFilter}
      onStatusFilter={(s) => { setStatusFilter(s); setPage(1); }}
      onPageChange={setPage}
      onNew={() => setShowForm(true)}
      newLabel="New Transfer"
      FormComponent={showForm ? (
        <TransferFormDialog onClose={() => setShowForm(false)}
          onSubmit={async (d) => { await createTransfer.mutateAsync(d); setShowForm(false); }} />
      ) : undefined}
    />
  );
}
