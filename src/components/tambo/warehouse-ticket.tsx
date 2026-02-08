"use client";

import { useWarehouseStore } from "@/lib/warehouse-store";
import { z } from "zod";

export const warehouseTicketSchema = z.object({
  ticketId: z
    .string()
    .min(1)
    .describe("The unique id of the ticket to display."),
});

export type WarehouseTicketProps = z.infer<typeof warehouseTicketSchema>;

export function WarehouseTicket({ ticketId }: WarehouseTicketProps) {
  const { getTicketById } = useWarehouseStore();
  const ticket = getTicketById(ticketId);

  if (!ticket) {
    return (
      <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-4">
        <h2 className="text-lg font-semibold">Ticket not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          No saved good matches ticket id <span className="font-mono">{ticketId}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Warehouse ticket</h2>
          <p className="text-sm text-muted-foreground">
            Ticket ID: <span className="font-mono">{ticket.id}</span>
          </p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium text-muted-foreground">Good name</dt>
          <dd className="text-sm font-medium">{ticket.goodName}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-muted-foreground">Warehouse</dt>
          <dd className="text-sm font-medium">Warehouse {ticket.warehouseNumber}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-muted-foreground">Units</dt>
          <dd className="text-sm font-medium">{ticket.units}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-muted-foreground">Unit weight (kg)</dt>
          <dd className="text-sm font-medium">{ticket.unitWeight}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-muted-foreground">Expiry date</dt>
          <dd className="text-sm font-medium">{ticket.expiryDate}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-muted-foreground">Saved at</dt>
          <dd className="text-sm font-medium">{ticket.createdAt}</dd>
        </div>
      </dl>
    </div>
  );
}
