"use client";

import { useWarehouseStore } from "@/lib/warehouse-store";
import { z } from "zod";

export const warehouseSavedMessageSchema = z.object({});

export type WarehouseSavedMessageProps = z.infer<
  typeof warehouseSavedMessageSchema
>;

export function WarehouseSavedMessage(_props: WarehouseSavedMessageProps) {
  const { lastSavedTicket } = useWarehouseStore();

  if (!lastSavedTicket) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-4">
      <p className="text-sm">
        Saved <span className="font-medium">{lastSavedTicket.goodName}</span> in
        Warehouse {lastSavedTicket.warehouseNumber}. Ticket ID:{" "}
        <span className="font-mono">{lastSavedTicket.id}</span>
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {lastSavedTicket.units} unit(s) × {lastSavedTicket.unitWeight}kg • Expiry:{" "}
        {lastSavedTicket.expiryDate}
      </p>
    </div>
  );
}
