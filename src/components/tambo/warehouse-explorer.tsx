"use client";

import { WarehouseGoodsList } from "@/components/tambo/warehouse-goods-list";
import { useWarehouseAppState } from "@/lib/use-warehouse-app-state";
import { cn } from "@/lib/utils";
import {
  getWarehouseUsedWeightKg,
  WarehouseCapacityError,
} from "@/services/warehouse-store";
import { X } from "lucide-react";
import * as React from "react";
import { z } from "zod";

export const warehouseExplorerSchema = z.object({
  initialWarehouseId: z
    .string()
    .optional()
    .describe("Optional warehouse id to preselect (example: wh-1)"),
});

type WarehouseExplorerProps = z.infer<typeof warehouseExplorerSchema>;

function formatNumber(value: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
    value,
  );
}

type ActivePanel = "none" | "add" | "view";

export function WarehouseExplorer(props: WarehouseExplorerProps) {
  const { state, addGoodToWarehouse } = useWarehouseAppState();
  const [selectedWarehouseId, setSelectedWarehouseId] = React.useState<
    string | null
  >(props?.initialWarehouseId ?? null);
  const [activePanel, setActivePanel] = React.useState<ActivePanel>("none");
  const [error, setError] = React.useState<string>("");

  const [name, setName] = React.useState<string>("");
  const [quantity, setQuantity] = React.useState<number>(1);
  const [unitWeightKg, setUnitWeightKg] = React.useState<number>(1);
  const [expiryDate, setExpiryDate] = React.useState<string>("");
  const [tickets, setTickets] = React.useState<number>(0);

  React.useEffect(() => {
    if (!selectedWarehouseId && props?.initialWarehouseId) {
      setSelectedWarehouseId(props.initialWarehouseId);
    }
  }, [props?.initialWarehouseId, selectedWarehouseId]);

  const selectedWarehouse = state.warehouses.find(
    (w) => w.id === selectedWarehouseId,
  );

  const handleSelectWarehouse = (warehouseId: string) => {
    setSelectedWarehouseId(warehouseId);
    setActivePanel("none");
    setError("");
  };

  const handleSaveGood = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedWarehouseId) return;

    try {
      setError("");
      addGoodToWarehouse({
        warehouseId: selectedWarehouseId,
        name,
        quantity,
        unitWeightKg,
        expiryDate,
        tickets,
      });
      setName("");
      setQuantity(1);
      setUnitWeightKg(1);
      setExpiryDate("");
      setTickets(0);
      setActivePanel("view");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save good";
      if (err instanceof WarehouseCapacityError) {
        setError(
          `Capacity exceeded. Current: ${formatNumber(
            err.currentWeightKg,
          )}kg, trying to add: ${formatNumber(
            err.attemptedAddKg,
          )}kg, max: ${formatNumber(err.maxCapacityKg)}kg.`,
        );
      } else {
        setError(message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Warehouses</h2>
        <p className="text-sm text-muted-foreground">
          Select a warehouse to add goods or view stored goods. Each warehouse has
          a maximum capacity of 1,000,000kg.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {state.warehouses.map((w) => {
          const usedWeightKg = getWarehouseUsedWeightKg(state, w.id);
          const remainingKg = w.maxCapacityKg - usedWeightKg;
          const isSelected = w.id === selectedWarehouseId;

          return (
            <button
              key={w.id}
              type="button"
              onClick={() => handleSelectWarehouse(w.id)}
              className={cn(
                "rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-muted",
                isSelected && "ring-2 ring-ring",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{w.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Used: {formatNumber(usedWeightKg)}kg
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  Remaining
                  <div className="font-medium text-foreground">
                    {formatNumber(remainingKg)}kg
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedWarehouse ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">{selectedWarehouse.name}</h3>
              <p className="text-sm text-muted-foreground">
                Choose an action for this warehouse.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setActivePanel("add");
                  setError("");
                }}
                className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
              >
                Add good
              </button>
              <button
                type="button"
                onClick={() => {
                  setActivePanel("view");
                  setError("");
                }}
                className="rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
              >
                Show goods
              </button>
            </div>
          </div>

          {activePanel === "add" ? (
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-semibold">Add a good</h4>
                <button
                  type="button"
                  onClick={() => {
                    setActivePanel("none");
                    setError("");
                  }}
                  className="rounded-md p-2 hover:bg-muted"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveGood} className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Good name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Example: Rice"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Expiry date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    min={1}
                    step={1}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Unit weight (kg)</label>
                  <input
                    type="number"
                    value={unitWeightKg}
                    onChange={(e) => setUnitWeightKg(Number(e.target.value))}
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    min={0.01}
                    step={0.01}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Tickets</label>
                  <input
                    type="number"
                    value={tickets}
                    onChange={(e) => setTickets(Number(e.target.value))}
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    min={0}
                    step={1}
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
                  >
                    Save
                  </button>
                </div>
              </form>

              {error ? (
                <p className="mt-3 text-sm text-destructive">{error}</p>
              ) : null}
            </div>
          ) : null}

          {activePanel === "view" ? (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Goods in warehouse</h4>
                <button
                  type="button"
                  onClick={() => setActivePanel("none")}
                  className="rounded-md p-2 hover:bg-muted"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <WarehouseGoodsList warehouseId={selectedWarehouse.id} />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
