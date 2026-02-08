"use client";

import { useWarehouseAppState } from "@/lib/use-warehouse-app-state";
import { z } from "zod";

export const goodsStoredListSchema = z.object({});

type GoodsStoredListProps = z.infer<typeof goodsStoredListSchema>;

function formatNumber(value: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
    value,
  );
}

type GoodsAggregate = {
  name: string;
  totalQuantity: number;
  totalTickets: number;
  totalWeightKg: number;
  warehousesCount: number;
};

export function GoodsStoredList(_props: GoodsStoredListProps) {
  const { state } = useWarehouseAppState();

  const aggregates = new Map<string, GoodsAggregate>();
  const warehousesById = new Map(state.warehouses.map((w) => [w.id, w.name]));

  for (const g of state.goods) {
    const key = g.name.trim().toLowerCase();
    const prev = aggregates.get(key);

    const next: GoodsAggregate = prev
      ? {
          ...prev,
          totalQuantity: prev.totalQuantity + g.quantity,
          totalTickets: prev.totalTickets + g.tickets,
          totalWeightKg: prev.totalWeightKg + g.quantity * g.unitWeightKg,
          warehousesCount: prev.warehousesCount,
        }
      : {
          name: g.name,
          totalQuantity: g.quantity,
          totalTickets: g.tickets,
          totalWeightKg: g.quantity * g.unitWeightKg,
          warehousesCount: 0,
        };

    aggregates.set(key, next);
  }

  const uniqueWarehousesByGood = new Map<string, Set<string>>();
  for (const g of state.goods) {
    const key = g.name.trim().toLowerCase();
    const set = uniqueWarehousesByGood.get(key) ?? new Set<string>();
    set.add(warehousesById.get(g.warehouseId) ?? g.warehouseId);
    uniqueWarehousesByGood.set(key, set);
  }

  for (const [key, set] of uniqueWarehousesByGood.entries()) {
    const agg = aggregates.get(key);
    if (!agg) continue;
    agg.warehousesCount = set.size;
  }

  const rows = Array.from(aggregates.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div>
        <h2 className="text-xl font-semibold">Goods stored</h2>
        <p className="text-sm text-muted-foreground">
          Totals across all warehouses.
        </p>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="py-2 pr-4">Good type</th>
              <th className="py-2 pr-4">Total qty</th>
              <th className="py-2 pr-4">Total kg</th>
              <th className="py-2 pr-4">Tickets</th>
              <th className="py-2">Warehouses</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-3 text-muted-foreground italic">
                  No goods stored yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.name} className="border-t border-border">
                  <td className="py-2 pr-4 font-medium">{row.name}</td>
                  <td className="py-2 pr-4">{formatNumber(row.totalQuantity)}</td>
                  <td className="py-2 pr-4">{formatNumber(row.totalWeightKg)}</td>
                  <td className="py-2 pr-4">{formatNumber(row.totalTickets)}</td>
                  <td className="py-2">{formatNumber(row.warehousesCount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
