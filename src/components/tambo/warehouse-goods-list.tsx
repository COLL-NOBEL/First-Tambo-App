"use client";

import { useWarehouseAppState } from "@/lib/use-warehouse-app-state";
import { getWarehouseUsedWeightKg } from "@/services/warehouse-store";
import { z } from "zod";

export const warehouseGoodsListSchema = z.object({
  warehouseId: z
    .string()
    .describe("The warehouse id to show goods for (example: wh-1)"),
});

type WarehouseGoodsListProps = z.infer<typeof warehouseGoodsListSchema>;

function parseDate(dateString: string) {
  return new Date(`${dateString}T00:00:00.000Z`).getTime();
}

function formatNumber(value: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
    value,
  );
}

export function WarehouseGoodsList(props: WarehouseGoodsListProps) {
  const { state } = useWarehouseAppState();
  const warehouseId = props?.warehouseId;

  const warehouse = state.warehouses.find((w) => w.id === warehouseId);
  const goods = state.goods
    .filter((g) => g.warehouseId === warehouseId)
    .slice()
    .sort((a, b) => parseDate(a.expiryDate) - parseDate(b.expiryDate));

  const usedWeightKg = warehouseId
    ? getWarehouseUsedWeightKg(state, warehouseId)
    : 0;
  const maxCapacityKg = warehouse?.maxCapacityKg ?? 0;

  if (!warehouseId) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">No warehouse selected.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold">
          {warehouse?.name ?? `Warehouse ${warehouseId}`}
        </h3>
        <p className="text-sm text-muted-foreground">
          Capacity: {formatNumber(usedWeightKg)}kg / {formatNumber(maxCapacityKg)}kg
        </p>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="py-2 pr-4">Good</th>
              <th className="py-2 pr-4">Qty</th>
              <th className="py-2 pr-4">Unit kg</th>
              <th className="py-2 pr-4">Total kg</th>
              <th className="py-2 pr-4">Expiry</th>
              <th className="py-2">Tickets</th>
            </tr>
          </thead>
          <tbody>
            {goods.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-3 text-muted-foreground italic"
                >
                  No goods stored in this warehouse yet.
                </td>
              </tr>
            ) : (
              goods.map((g) => (
                <tr key={g.id} className="border-t border-border">
                  <td className="py-2 pr-4 font-medium">{g.name}</td>
                  <td className="py-2 pr-4">{formatNumber(g.quantity)}</td>
                  <td className="py-2 pr-4">{formatNumber(g.unitWeightKg)}</td>
                  <td className="py-2 pr-4">
                    {formatNumber(g.unitWeightKg * g.quantity)}
                  </td>
                  <td className="py-2 pr-4">{g.expiryDate}</td>
                  <td className="py-2">{formatNumber(g.tickets)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
