'use client';
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProducts } from '@/hooks/useProducts';
import { useLocations } from '@/hooks/useOperations';
import { cn } from '@/lib/utils';

// ── Receipt Form ───────────────────────────────────────────────────────────
const receiptSchema = z.object({
  supplier: z.string().min(1, 'Supplier required'),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().uuid('Select product'),
    locationId: z.string().uuid('Select location'),
    quantity: z.coerce.number().int().positive('Must be > 0'),
  })).min(1),
});
type ReceiptForm = z.infer<typeof receiptSchema>;

export function ReceiptFormDialog({ onSubmit, onClose }: {
  onSubmit: (data: ReceiptForm) => Promise<void>;
  onClose: () => void;
}) {
  const { data: productsData } = useProducts({ limit: 100 });
  const { data: locations } = useLocations();
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ReceiptForm>({
    resolver: zodResolver(receiptSchema),
    defaultValues: { items: [{ productId: '', locationId: '', quantity: 1 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  return (
    <FormDialog title="New Receipt" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label>Supplier</Label>
            <Input placeholder="Supplier name" {...register('supplier')} />
            {errors.supplier && <p className="text-xs text-destructive">{errors.supplier.message}</p>}
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Notes (optional)</Label>
            <Input placeholder="Notes..." {...register('notes')} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Items</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: '', locationId: '', quantity: 1 })}>
              <Plus className="h-3.5 w-3.5" /> Add Item
            </Button>
          </div>
          {fields.map((f, i) => (
            <div key={f.id} className="grid grid-cols-3 gap-2 p-3 rounded-md border border-border bg-muted/30">
              <SelectField label="Product" {...register(`items.${i}.productId`)}>
                <option value="">Select...</option>
                {productsData?.data?.map((p: { id: string; name: string; sku: string }) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </SelectField>
              <SelectField label="Location" {...register(`items.${i}.locationId`)}>
                <option value="">Select...</option>
                {locations?.map((l: { id: string; name: string; warehouse: { name: string } }) => (
                  <option key={l.id} value={l.id}>{l.warehouse?.name} / {l.name}</option>
                ))}
              </SelectField>
              <div className="space-y-1">
                <Label>Qty</Label>
                <div className="flex gap-1">
                  <Input type="number" min="1" className="font-mono" {...register(`items.${i}.quantity`)} />
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-destructive" onClick={() => remove(i)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <FormActions onClose={onClose} isSubmitting={isSubmitting} label="Create Receipt" />
      </form>
    </FormDialog>
  );
}

// ── Delivery Form ──────────────────────────────────────────────────────────
const deliverySchema = z.object({
  customer: z.string().min(1, 'Customer required'),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().uuid('Select product'),
    locationId: z.string().uuid('Select location'),
    quantity: z.coerce.number().int().positive(),
  })).min(1),
});
type DeliveryForm = z.infer<typeof deliverySchema>;

export function DeliveryFormDialog({ onSubmit, onClose }: {
  onSubmit: (data: DeliveryForm) => Promise<void>;
  onClose: () => void;
}) {
  const { data: productsData } = useProducts({ limit: 100 });
  const { data: locations } = useLocations();
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<DeliveryForm>({
    resolver: zodResolver(deliverySchema),
    defaultValues: { items: [{ productId: '', locationId: '', quantity: 1 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  return (
    <FormDialog title="New Delivery Order" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label>Customer</Label>
            <Input placeholder="Customer name" {...register('customer')} />
            {errors.customer && <p className="text-xs text-destructive">{errors.customer.message}</p>}
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Notes (optional)</Label>
            <Input placeholder="Notes..." {...register('notes')} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Items</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: '', locationId: '', quantity: 1 })}>
              <Plus className="h-3.5 w-3.5" /> Add Item
            </Button>
          </div>
          {fields.map((f, i) => (
            <div key={f.id} className="grid grid-cols-3 gap-2 p-3 rounded-md border border-border bg-muted/30">
              <SelectField label="Product" {...register(`items.${i}.productId`)}>
                <option value="">Select...</option>
                {productsData?.data?.map((p: { id: string; name: string; sku: string; totalStock?: number }) => (
                  <option key={p.id} value={p.id}>{p.name} — stock: {p.totalStock ?? 0}</option>
                ))}
              </SelectField>
              <SelectField label="Location" {...register(`items.${i}.locationId`)}>
                <option value="">Select...</option>
                {locations?.map((l: { id: string; name: string; warehouse: { name: string } }) => (
                  <option key={l.id} value={l.id}>{l.warehouse?.name} / {l.name}</option>
                ))}
              </SelectField>
              <div className="space-y-1">
                <Label>Qty</Label>
                <div className="flex gap-1">
                  <Input type="number" min="1" className="font-mono" {...register(`items.${i}.quantity`)} />
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-destructive" onClick={() => remove(i)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <FormActions onClose={onClose} isSubmitting={isSubmitting} label="Create Delivery" />
      </form>
    </FormDialog>
  );
}

// ── Transfer Form ──────────────────────────────────────────────────────────
const transferSchema = z.object({
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().uuid('Select product'),
    sourceLocationId: z.string().uuid('Select source'),
    destinationLocationId: z.string().uuid('Select destination'),
    quantity: z.coerce.number().int().positive(),
  })).min(1),
});
type TransferForm = z.infer<typeof transferSchema>;

export function TransferFormDialog({ onSubmit, onClose }: {
  onSubmit: (data: TransferForm) => Promise<void>;
  onClose: () => void;
}) {
  const { data: productsData } = useProducts({ limit: 100 });
  const { data: locations } = useLocations();
  const { register, control, handleSubmit, formState: { isSubmitting } } = useForm<TransferForm>({
    resolver: zodResolver(transferSchema),
    defaultValues: { items: [{ productId: '', sourceLocationId: '', destinationLocationId: '', quantity: 1 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  return (
    <FormDialog title="New Transfer" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Notes (optional)</Label>
          <Input placeholder="Transfer notes..." {...register('notes')} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Items</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: '', sourceLocationId: '', destinationLocationId: '', quantity: 1 })}>
              <Plus className="h-3.5 w-3.5" /> Add Item
            </Button>
          </div>
          {fields.map((f, i) => (
            <div key={f.id} className="grid grid-cols-2 gap-2 p-3 rounded-md border border-border bg-muted/30">
              <SelectField label="Product" {...register(`items.${i}.productId`)}>
                <option value="">Select...</option>
                {productsData?.data?.map((p: { id: string; name: string; sku: string }) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </SelectField>
              <div className="space-y-1">
                <Label>Qty</Label>
                <div className="flex gap-1">
                  <Input type="number" min="1" className="font-mono" {...register(`items.${i}.quantity`)} />
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-destructive" onClick={() => remove(i)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
              <SelectField label="From" {...register(`items.${i}.sourceLocationId`)}>
                <option value="">Select source...</option>
                {locations?.map((l: { id: string; name: string; warehouse: { name: string } }) => (
                  <option key={l.id} value={l.id}>{l.warehouse?.name} / {l.name}</option>
                ))}
              </SelectField>
              <SelectField label="To" {...register(`items.${i}.destinationLocationId`)}>
                <option value="">Select destination...</option>
                {locations?.map((l: { id: string; name: string; warehouse: { name: string } }) => (
                  <option key={l.id} value={l.id}>{l.warehouse?.name} / {l.name}</option>
                ))}
              </SelectField>
            </div>
          ))}
        </div>
        <FormActions onClose={onClose} isSubmitting={isSubmitting} label="Create Transfer" />
      </form>
    </FormDialog>
  );
}

// ── Adjustment Form ────────────────────────────────────────────────────────
const adjustmentSchema = z.object({
  productId: z.string().uuid('Select product'),
  locationId: z.string().uuid('Select location'),
  physicalCount: z.coerce.number().int().min(0, 'Must be ≥ 0'),
  reason: z.string().min(1, 'Reason required'),
});
type AdjustmentForm = z.infer<typeof adjustmentSchema>;

export function AdjustmentFormDialog({ onSubmit, onClose }: {
  onSubmit: (data: AdjustmentForm) => Promise<void>;
  onClose: () => void;
}) {
  const { data: productsData } = useProducts({ limit: 100 });
  const { data: locations } = useLocations();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AdjustmentForm>({
    resolver: zodResolver(adjustmentSchema),
  });

  return (
    <FormDialog title="New Adjustment" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Product" {...register('productId')}>
            <option value="">Select product...</option>
            {productsData?.data?.map((p: { id: string; name: string; sku: string; totalStock?: number }) => (
              <option key={p.id} value={p.id}>{p.name} — sys: {p.totalStock ?? 0}</option>
            ))}
          </SelectField>
          <SelectField label="Location" {...register('locationId')}>
            <option value="">Select location...</option>
            {locations?.map((l: { id: string; name: string; warehouse: { name: string } }) => (
              <option key={l.id} value={l.id}>{l.warehouse?.name} / {l.name}</option>
            ))}
          </SelectField>
          <div className="space-y-1.5">
            <Label>Physical Count</Label>
            <Input type="number" min="0" className="font-mono" placeholder="Actual counted qty" {...register('physicalCount')} />
            {errors.physicalCount && <p className="text-xs text-destructive">{errors.physicalCount.message}</p>}
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Reason</Label>
            <Input placeholder="e.g. Damaged goods, count discrepancy..." {...register('reason')} />
            {errors.reason && <p className="text-xs text-destructive">{errors.reason.message}</p>}
          </div>
        </div>
        <FormActions onClose={onClose} isSubmitting={isSubmitting} label="Record Adjustment" />
      </form>
    </FormDialog>
  );
}

// ── Shared primitives ──────────────────────────────────────────────────────
import React from 'react';

function FormDialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>
      {children}
    </div>
  );
}

const SelectField = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }>(
  ({ label, children, ...props }, ref) => (
    <div className="space-y-1">
      <Label>{label}</Label>
      <select
        ref={ref}
        className="flex h-9 w-full rounded-md border border-input bg-input px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        {...props}
      >
        {children}
      </select>
    </div>
  )
);
SelectField.displayName = 'SelectField';

function FormActions({ onClose, isSubmitting, label }: { onClose: () => void; isSubmitting: boolean; label: string }) {
  return (
    <div className="flex gap-3 pt-1">
      <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {label}
      </Button>
    </div>
  );
}
