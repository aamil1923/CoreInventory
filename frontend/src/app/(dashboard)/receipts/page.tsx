"use client";
import { useState } from "react";
import { useReceipts, useCreateReceipt, useValidateReceipt } from "@/hooks/useReceipts";
import { OperationsPage, ValidateAction } from "@/components/operations-page";
import { ReceiptFormDialog } from "@/components/operation-forms";
import { Column } from "@/components/data-table";
import { Receipt } from "@/types";
import { cn, formatDate, STATUS_COLORS } from "@/lib/utils";

export default function ReceiptsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useReceipts({
    ...(statusFilter && { status: statusFilter }),
    page, limit: 20,
  });
  const createReceipt = useCreateReceipt();
  const validateReceipt = useValidateReceipt();

  const columns: Column<Receipt>[] = [
    { key: "id", label: "Ref",
      render: (r) => <span className="font-mono text-xs text-primary">{r.id.slice(0, 8)}…</span> },
    { key: "supplier", label: "Supplier",
      render: (r) => <span className="font-medium text-foreground">{r.supplier}</span> },
    { key: "items", label: "Items",
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
          <ValidateAction status={r.status}
            onValidate={() => validateReceipt.mutate(r.id)}
            isPending={validateReceipt.isPending && validateReceipt.variables === r.id} />
        </div>
      )},
  ];

  return (
    <OperationsPage
      title="Receipts"
      data={data?.data}
      meta={data?.meta}
      isLoading={isLoading}
      columns={columns}
      statusFilter={statusFilter}
      onStatusFilter={(s) => { setStatusFilter(s); setPage(1); }}
      onPageChange={setPage}
      onNew={() => setShowForm(true)}
      newLabel="New Receipt"
      FormComponent={showForm ? (
        <ReceiptFormDialog onClose={() => setShowForm(false)}
          onSubmit={async (d) => { await createReceipt.mutateAsync(d); setShowForm(false); }} />
      ) : undefined}
    />
  );
}
