"use client";

import { useWarehouseStore } from "@/lib/warehouse-store";
import { z } from "zod";

export const warehouseTicketListSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe("Optional max number of tickets to show (newest first)."),
});

export type WarehouseTicketListProps = z.infer<typeof warehouseTicketListSchema>;

export function WarehouseTicketList({ limit }: WarehouseTicketListProps) {
  const { tickets } = useWarehouseStore();
  const items = typeof limit === "number" ? tickets.slice(0, limit) : tickets;

  return (
    <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-4">
      <h2 className="text-lg font-semibold">Saved goods (ticket ids)</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {tickets.length === 0
          ? "No goods saved yet."
          : `Showing ${items.length} of ${tickets.length} ticket(s).`}
      </p>

      {items.length > 0 && (
        <ul className="mt-4 divide-y divide-border">
          {items.map((ticket) => (
            <li key={ticket.id} className="py-3 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{ticket.goodName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  Warehouse {ticket.warehouseNumber}
                </p>
              </div>
              <code className="text-xs text-muted-foreground font-mono shrink-0">
                {ticket.id}
              </code>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
