"use client";

import { useWarehouseAppState } from "@/lib/use-warehouse-app-state";
import { cn } from "@/lib/utils";
import { z } from "zod";
import * as React from "react";

export const goodsClassesManagerSchema = z.object({});

type GoodsClassesManagerProps = z.infer<typeof goodsClassesManagerSchema>;

function formatNumber(value: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
    value,
  );
}

export function GoodsClassesManager(_props: GoodsClassesManagerProps) {
  const { state, createGoodsCategorySet, setGoodsCategoryAssignments } =
    useWarehouseAppState();

  const [selectedSetId, setSelectedSetId] = React.useState<string | null>(
    state.goodsCategorySets[0]?.id ?? null,
  );

  const [newSetName, setNewSetName] = React.useState<string>("");
  const [category1, setCategory1] = React.useState<string>("");
  const [category2, setCategory2] = React.useState<string>("");
  const [category3, setCategory3] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");

  React.useEffect(() => {
    if (!selectedSetId && state.goodsCategorySets[0]?.id) {
      setSelectedSetId(state.goodsCategorySets[0].id);
    }
  }, [selectedSetId, state.goodsCategorySets]);

  const selectedSet = state.goodsCategorySets.find((s) => s.id === selectedSetId);
  const assignments =
    (selectedSetId && state.goodsCategoryAssignments[selectedSetId]) || {};

  const goodsRows = state.goods
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((g) => {
      const warehouseName =
        state.warehouses.find((w) => w.id === g.warehouseId)?.name ?? g.warehouseId;
      return {
        ...g,
        warehouseName,
        category: selectedSetId ? assignments[g.id] ?? "" : "",
      };
    });

  const grouped = React.useMemo(() => {
    if (!selectedSet) return null;

    const groups: Record<string, string[]> = {};
    for (const c of selectedSet.categories) groups[c] = [];
    groups["Unassigned"] = [];

    for (const row of goodsRows) {
      const cat = row.category || "Unassigned";
      (groups[cat] ??= []).push(row.name);
    }

    return groups;
  }, [goodsRows, selectedSet]);

  const handleCreateSet = (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setError("");
      const created = createGoodsCategorySet({
        name: newSetName,
        categories: [category1, category2, category3],
      });
      setSelectedSetId(created.id);
      setNewSetName("");
      setCategory1("");
      setCategory2("");
      setCategory3("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category set");
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div>
        <h2 className="text-xl font-semibold">Good classes</h2>
        <p className="text-sm text-muted-foreground">
          Create a set of up to 3 categories (example: Electronic / Not electronic),
          then assign each good to a category.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold">Category sets</h3>
            <div className="mt-2 space-y-2">
              {state.goodsCategorySets.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No category sets yet.
                </p>
              ) : (
                state.goodsCategorySets.map((set) => (
                  <button
                    key={set.id}
                    type="button"
                    onClick={() => setSelectedSetId(set.id)}
                    className={cn(
                      "w-full rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-muted",
                      set.id === selectedSetId && "ring-2 ring-ring",
                    )}
                  >
                    <div className="font-medium">{set.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {set.categories.join(" · ")}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded-md border border-border bg-background p-3">
            <h3 className="text-sm font-semibold">Add a category set</h3>
            <form onSubmit={handleCreateSet} className="mt-3 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Set name</label>
                <input
                  value={newSetName}
                  onChange={(e) => setNewSetName(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Example: Electronics"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Category 1</label>
                  <input
                    value={category1}
                    onChange={(e) => setCategory1(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Example: Electronic"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Category 2</label>
                  <input
                    value={category2}
                    onChange={(e) => setCategory2(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Example: Not electronic"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Category 3</label>
                  <input
                    value={category3}
                    onChange={(e) => setCategory3(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
              >
                Create
              </button>
            </form>
            {error ? (
              <p className="mt-3 text-sm text-destructive">{error}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-md border border-border bg-background p-3">
            <h3 className="text-sm font-semibold">Classify goods</h3>
            {!selectedSet ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Create and select a category set to start classifying.
              </p>
            ) : goodsRows.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                No goods yet. Add goods in Stores first.
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-4">Good</th>
                      <th className="py-2 pr-4">Warehouse</th>
                      <th className="py-2 pr-4">Qty</th>
                      <th className="py-2">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goodsRows.map((row) => (
                      <tr key={row.id} className="border-t border-border">
                        <td className="py-2 pr-4 font-medium">{row.name}</td>
                        <td className="py-2 pr-4">{row.warehouseName}</td>
                        <td className="py-2 pr-4">{formatNumber(row.quantity)}</td>
                        <td className="py-2">
                          <select
                            value={row.category}
                            onChange={(e) => {
                              if (!selectedSetId) return;
                              const nextCategory = e.target.value;
                              if (!nextCategory) return;
                              setGoodsCategoryAssignments({
                                categorySetId: selectedSetId,
                                assignments: [
                                  { goodId: row.id, category: nextCategory },
                                ],
                              });
                            }}
                            className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
                          >
                            <option value="" disabled>
                              Select...
                            </option>
                            {selectedSet.categories.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-md border border-border bg-background p-3">
            <h3 className="text-sm font-semibold">Goods by category</h3>
            {!selectedSet || !grouped ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Select a category set to view the grouped goods table.
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-4">Category</th>
                      <th className="py-2">Goods</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(grouped).map(([category, goods]) => (
                      <tr key={category} className="border-t border-border">
                        <td className="py-2 pr-4 font-medium">{category}</td>
                        <td className="py-2 text-muted-foreground">
                          {goods.length === 0 ? "—" : goods.join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Tip: you can also use the AI assistant to create category sets and
            classify goods by prompt.
          </p>
        </div>
      </div>
    </div>
  );
}
