"use client";

import { cn } from "@/lib/utils";
import { useWarehouseStore } from "@/lib/warehouse-store";
import { useTamboComponentState } from "@tambo-ai/react";
import * as React from "react";
import { z } from "zod";

export const warehouseSaveGoodSchema = z.object({
  heading: z
    .string()
    .optional()
    .describe("Optional heading shown above the save-good form."),
  initialGoodName: z
    .string()
    .optional()
    .describe("Optional initial value for the good name."),
  initialWarehouseNumber: z
    .number()
    .int()
    .min(1)
    .max(15)
    .optional()
    .describe("Optional initial warehouse number (1-15)."),
  initialUnits: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe("Optional initial number of units."),
  initialUnitWeight: z
    .number()
    .min(0)
    .optional()
    .describe("Optional initial weight of one unit (kg)."),
  initialExpiryDate: z
    .string()
    .optional()
    .describe(
      "Optional initial expiry date as an ISO string or YYYY-MM-DD string.",
    ),
});

export type WarehouseSaveGoodProps = z.infer<typeof warehouseSaveGoodSchema>;

function formatDateForInput(value: string | undefined): string {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function WarehouseSaveGood({
  heading,
  initialGoodName,
  initialWarehouseNumber,
  initialUnits,
  initialUnitWeight,
  initialExpiryDate,
}: WarehouseSaveGoodProps) {
  const { saveTicket } = useWarehouseStore();

  const formattedInitialExpiryDate = formatDateForInput(initialExpiryDate);

  const [goodName, setGoodName] = useTamboComponentState<string>(
    "goodName",
    "",
    initialGoodName,
  );
  const [warehouseNumber, setWarehouseNumber] = useTamboComponentState<number>(
    "warehouseNumber",
    1,
    initialWarehouseNumber,
  );
  const [units, setUnits] = useTamboComponentState<number | null>(
    "units",
    null,
    initialUnits,
  );
  const [unitWeight, setUnitWeight] = useTamboComponentState<number | null>(
    "unitWeight",
    null,
    initialUnitWeight,
  );
  const [expiryDate, setExpiryDate] = useTamboComponentState<string>(
    "expiryDate",
    "",
    formattedInitialExpiryDate || undefined,
  );
  const [lastSavedId, setLastSavedId] = useTamboComponentState<string | null>(
    "lastSavedId",
    null,
  );
  const [error, setError] = React.useState<string | null>(null);

  const onSave = React.useCallback(() => {
    setError(null);

    const trimmedName = (goodName ?? "").trim();
    if (!trimmedName) {
      setError("Good name is required.");
      return;
    }
    if (!units || units <= 0) {
      setError("Units must be greater than 0.");
      return;
    }
    if (!unitWeight || unitWeight <= 0) {
      setError("Unit weight must be greater than 0.");
      return;
    }
    if (!expiryDate) {
      setError("Expiry date is required.");
      return;
    }

    const ticket = saveTicket({
      goodName: trimmedName,
      warehouseNumber: warehouseNumber ?? 1,
      units,
      unitWeight,
      expiryDate: expiryDate ?? "",
    });

    setLastSavedId(ticket.id);
  }, [
    expiryDate,
    goodName,
    saveTicket,
    setLastSavedId,
    unitWeight,
    units,
    warehouseNumber,
  ]);

  return (
    <div className="w-full max-w-2xl">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              {heading ?? "Save a good in a warehouse"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter the details below, then click Save to generate a ticket.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Good name</span>
            <input
              className={cn(
                "h-10 rounded-md border border-input bg-background px-3 text-sm",
              )}
              value={goodName ?? ""}
              onChange={(e) => setGoodName(e.target.value)}
              placeholder="e.g. Rice"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Warehouse (1-15)</span>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={warehouseNumber ?? 1}
              onChange={(e) => setWarehouseNumber(Number(e.target.value))}
            >
              {Array.from({ length: 15 }).map((_, index) => {
                const value = index + 1;
                return (
                  <option key={value} value={value}>
                    Warehouse {value}
                  </option>
                );
              })}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Units (count)</span>
            <input
              type="number"
              min={1}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={units ?? ""}
              onChange={(e) => {
                const raw = e.target.value;
                setUnits(raw === "" ? null : Number(raw));
              }}
              placeholder="e.g. 10"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Weight of one unit (kg)</span>
            <input
              type="number"
              min={0}
              step={0.01}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={unitWeight ?? ""}
              onChange={(e) => {
                const raw = e.target.value;
                setUnitWeight(raw === "" ? null : Number(raw));
              }}
              placeholder="e.g. 2.5"
            />
          </label>

          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-sm font-medium">Expiry date</span>
            <input
              type="date"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={expiryDate ?? ""}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </label>
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Save
          </button>

          {lastSavedId && (
            <p className="text-sm text-muted-foreground">
              Saved. Ticket ID: <span className="font-mono">{lastSavedId}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
