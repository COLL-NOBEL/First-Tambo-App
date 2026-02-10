"use client";

import {
  addGoodToWarehouse,
  createGoodsCategorySet,
  markFeatureUsed,
  readWarehouseAppState,
  setGoodsCategoryAssignments,
  subscribeWarehouseAppState,
  type AddGoodInput,
  type WarehouseAppState,
} from "@/services/warehouse-store";
import { useEffect, useMemo, useState } from "react";

export function useWarehouseAppState() {
  const [state, setState] = useState<WarehouseAppState>(() =>
    readWarehouseAppState(),
  );

  useEffect(() => {
    setState(readWarehouseAppState());
    return subscribeWarehouseAppState(setState);
  }, []);

  const actions = useMemo(
    () => ({
      addGoodToWarehouse: (input: AddGoodInput) => addGoodToWarehouse(input),
      createGoodsCategorySet: (input: { name: string; categories: string[] }) =>
        createGoodsCategorySet(input),
      setGoodsCategoryAssignments: (input: {
        categorySetId: string;
        assignments: Array<{ goodId: string; category: string }>;
      }) => setGoodsCategoryAssignments(input),
      markFeatureUsed: (featureId: string) => markFeatureUsed(featureId),
      refresh: () => setState(readWarehouseAppState()),
    }),
    [],
  );

  return { state, ...actions };
}
