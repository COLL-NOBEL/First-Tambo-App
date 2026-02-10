"use client";

import { useWarehouseAppState } from "@/lib/use-warehouse-app-state";
import { z } from "zod";

export const goodsExpiryListSchema = z.object({
  order: z
    .enum(["close", "far"])
    .optional()
    .describe("Sort order: 'close' = closest expiry first, 'far' = furthest first"),
});

type GoodsExpiryListProps = z.infer<typeof goodsExpiryListSchema>;

function parseDate(dateString: string) {
  return new Date(`${dateString}T00:00:00.000Z`).getTime();
}

function formatNumber(value: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
    value,
  );
}

export function GoodsExpiryList(props: GoodsExpiryListProps) {
  const { state } = useWarehouseAppState();
  const order = props?.order ?? "close";

  const warehousesById = new Map(state.warehouses.map((w) => [w.id, w.name]));
  const rows = state.goods
    .map((g) => ({
      ...g,
      warehouseName: warehousesById.get(g.warehouseId) ?? g.warehouseId,
    }))
    .slice()
    .sort((a, b) => {
      const dateCompare = parseDate(a.expiryDate) - parseDate(b.expiryDate);
      if (dateCompare !== 0) return order === "close" ? dateCompare : -dateCompare;
      return a.name.localeCompare(b.name);
    });

  const title = order === "close" ? "Close expiry" : "Far expiry";

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">
          Goods sorted by expiry date.
        </p>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="py-2 pr-4">Good</th>
              <th className="py-2 pr-4">Warehouse</th>
              <th className="py-2 pr-4">Qty</th>
              <th className="py-2 pr-4">Expiry</th>
              <th className="py-2 pr-4">Tickets</th>
              <th className="py-2">Total kg</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-3 text-muted-foreground italic">
                  No goods stored yet.
                </td>
              </tr>
            ) : (
              rows.map((g) => (
                <tr key={g.id} className="border-t border-border">
                  <td className="py-2 pr-4 font-medium">{g.name}</td>
                  <td className="py-2 pr-4">{g.warehouseName}</td>
                  <td className="py-2 pr-4">{formatNumber(g.quantity)}</td>
                  <td className="py-2 pr-4">{g.expiryDate}</td>
                  <td className="py-2 pr-4">{formatNumber(g.tickets)}</td>
                  <td className="py-2">{formatNumber(g.quantity * g.unitWeightKg)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
