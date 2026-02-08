import {
  addGoodToWarehouse,
  createGoodsCategorySet,
  getWarehouseUsedWeightKg,
  readWarehouseAppState,
  setGoodsCategoryAssignments,
} from "@/services/warehouse-store";

export async function getWarehouseAppData() {
  const state = readWarehouseAppState();
  return {
    warehouses: state.warehouses.map((w) => ({
      ...w,
      usedWeightKg: getWarehouseUsedWeightKg(state, w.id),
    })),
    goods: state.goods.map((g) => {
      const warehouse = state.warehouses.find((w) => w.id === g.warehouseId);
      return {
        ...g,
        warehouseName: warehouse?.name ?? g.warehouseId,
      };
    }),
    goodsCategorySets: state.goodsCategorySets,
    usedFeatures: state.usedFeatures,
  };
}

export async function warehouseAddGood(input: {
  warehouseId: string;
  name: string;
  quantity: number;
  unitWeightKg: number;
  expiryDate: string;
  tickets?: number;
}) {
  return addGoodToWarehouse(input);
}

export async function warehouseCreateCategorySet(input: {
  name: string;
  categories: string[];
}) {
  return createGoodsCategorySet(input);
}

export async function warehouseSetCategoryAssignments(input: {
  categorySetId: string;
  assignments: Array<{ goodId: string; category: string }>;
}) {
  const next = setGoodsCategoryAssignments(input);
  return {
    categorySetId: input.categorySetId,
    totalAssignments: Object.keys(next.goodsCategoryAssignments[input.categorySetId] ?? {})
      .length,
  };
}
