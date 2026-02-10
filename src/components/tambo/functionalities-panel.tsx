"use client";

import { useWarehouseAppState } from "@/lib/use-warehouse-app-state";
import { getWarehouseAppFeatures } from "@/services/warehouse-store";
import { z } from "zod";

export const functionalitiesPanelSchema = z.object({});

type FunctionalitiesPanelProps = z.infer<typeof functionalitiesPanelSchema>;

export function FunctionalitiesPanel(_props: FunctionalitiesPanelProps) {
  const { state } = useWarehouseAppState();
  const features = getWarehouseAppFeatures();
  const used = new Set(state.usedFeatures);

  const usedFeatures = features.filter((f) => used.has(f.id));
  const unusedFeatures = features.filter((f) => !used.has(f.id));

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div>
        <h2 className="text-xl font-semibold">Functionalities</h2>
        <p className="text-sm text-muted-foreground">
          Everything you can do in the warehouse app. Used features are the ones
          you have opened in this browser.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-border bg-background p-3">
          <h3 className="text-sm font-semibold">Used</h3>
          <div className="mt-3 space-y-2">
            {usedFeatures.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing yet.</p>
            ) : (
              usedFeatures.map((f) => (
                <div key={f.id} className="rounded-md border border-border p-3">
                  <div className="text-sm font-medium">{f.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {f.description}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-md border border-border bg-background p-3">
          <h3 className="text-sm font-semibold">Unused</h3>
          <div className="mt-3 space-y-2">
            {unusedFeatures.length === 0 ? (
              <p className="text-sm text-muted-foreground">All done.</p>
            ) : (
              unusedFeatures.map((f) => (
                <div key={f.id} className="rounded-md border border-border p-3">
                  <div className="text-sm font-medium">{f.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {f.description}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
