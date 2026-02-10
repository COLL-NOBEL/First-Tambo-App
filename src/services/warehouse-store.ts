import { z } from "zod";

export const WAREHOUSE_MAX_CAPACITY_KG = 1_000_000;

const STORAGE_KEY = "warehouseApp.v1";
const STORAGE_EVENT = "warehouseApp:updated";

let inMemoryState: WarehouseAppState | null = null;

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/u, "Expected YYYY-MM-DD date string");

export const warehouseSchema = z.object({
  id: z.string(),
  name: z.string(),
  maxCapacityKg: z.number().int().positive().default(WAREHOUSE_MAX_CAPACITY_KG),
});

export type Warehouse = z.infer<typeof warehouseSchema>;

export const storedGoodSchema = z.object({
  id: z.string(),
  warehouseId: z.string(),
  name: z.string(),
  quantity: z.number().int().positive(),
  unitWeightKg: z.number().positive(),
  expiryDate: dateStringSchema,
  tickets: z.number().int().nonnegative().default(0),
});

export type StoredGood = z.infer<typeof storedGoodSchema>;

export const goodsCategorySetSchema = z.object({
  id: z.string(),
  name: z.string(),
  categories: z.array(z.string()).min(1).max(3),
});

export type GoodsCategorySet = z.infer<typeof goodsCategorySetSchema>;

export const warehouseAppStateSchema = z.object({
  version: z.literal(1),
  warehouses: z.array(warehouseSchema),
  goods: z.array(storedGoodSchema),
  goodsCategorySets: z.array(goodsCategorySetSchema),
  goodsCategoryAssignments: z.record(z.string(), z.record(z.string(), z.string())),
  usedFeatures: z.array(z.string()),
});

export type WarehouseAppState = z.infer<typeof warehouseAppStateSchema>;

export type AddGoodInput = {
  warehouseId: string;
  name: string;
  quantity: number;
  unitWeightKg: number;
  expiryDate: string;
  tickets?: number;
};

export class WarehouseCapacityError extends Error {
  public readonly warehouseId: string;
  public readonly maxCapacityKg: number;
  public readonly currentWeightKg: number;
  public readonly attemptedAddKg: number;

  constructor(args: {
    warehouseId: string;
    maxCapacityKg: number;
    currentWeightKg: number;
    attemptedAddKg: number;
  }) {
    const nextKg = args.currentWeightKg + args.attemptedAddKg;
    super(
      `Warehouse ${args.warehouseId} capacity exceeded: ${nextKg}kg > ${args.maxCapacityKg}kg`,
    );
    this.name = "WarehouseCapacityError";
    this.warehouseId = args.warehouseId;
    this.maxCapacityKg = args.maxCapacityKg;
    this.currentWeightKg = args.currentWeightKg;
    this.attemptedAddKg = args.attemptedAddKg;
  }
}

function getDefaultState(): WarehouseAppState {
  const warehouses: Warehouse[] = [
    { id: "wh-1", name: "Central Warehouse", maxCapacityKg: WAREHOUSE_MAX_CAPACITY_KG },
    { id: "wh-2", name: "North Warehouse", maxCapacityKg: WAREHOUSE_MAX_CAPACITY_KG },
    { id: "wh-3", name: "South Warehouse", maxCapacityKg: WAREHOUSE_MAX_CAPACITY_KG },
    { id: "wh-4", name: "East Warehouse", maxCapacityKg: WAREHOUSE_MAX_CAPACITY_KG },
    { id: "wh-5", name: "West Warehouse", maxCapacityKg: WAREHOUSE_MAX_CAPACITY_KG },
    { id: "wh-6", name: "Port Warehouse", maxCapacityKg: WAREHOUSE_MAX_CAPACITY_KG },
  ];

  return {
    version: 1,
    warehouses,
    goods: [],
    goodsCategorySets: [],
    goodsCategoryAssignments: {},
    usedFeatures: [],
  };
}

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

function getRandomId(prefix: string): string {
  const cryptoAny = (globalThis as unknown as { crypto?: Crypto }).crypto;
  if (cryptoAny?.randomUUID) return `${prefix}_${cryptoAny.randomUUID()}`;
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function sanitizeGoodName(name: string): string {
  return name.trim();
}

function normalizeGoodKey(good: { name: string; unitWeightKg: number; expiryDate: string }) {
  return `${sanitizeGoodName(good.name).toLowerCase()}__${good.unitWeightKg}__${good.expiryDate}`;
}

export function getWarehouseUsedWeightKg(state: WarehouseAppState, warehouseId: string): number {
  return state.goods
    .filter((g) => g.warehouseId === warehouseId)
    .reduce((sum, g) => sum + g.quantity * g.unitWeightKg, 0);
}

export function readWarehouseAppState(): WarehouseAppState {
  const fallback = getDefaultState();
  if (!hasWindow()) return fallback;

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return inMemoryState ?? fallback;
  }

  if (!raw) return inMemoryState ?? fallback;

  try {
    const parsed = warehouseAppStateSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return inMemoryState ?? fallback;
    return parsed.data;
  } catch {
    return inMemoryState ?? fallback;
  }
}

function writeWarehouseAppState(state: WarehouseAppState) {
  if (!hasWindow()) return;
  inMemoryState = state;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore persistence errors; inMemoryState keeps the app functional.
  }
}

function emitWarehouseAppUpdated(state: WarehouseAppState) {
  if (!hasWindow()) return;
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: state }));
}

export function subscribeWarehouseAppState(
  listener: (state: WarehouseAppState) => void,
) {
  if (!hasWindow()) return () => {};

  const handler = (event: Event) => {
    const detail = (event as CustomEvent<WarehouseAppState>).detail;
    if (detail) listener(detail);
  };

  window.addEventListener(STORAGE_EVENT, handler);
  return () => window.removeEventListener(STORAGE_EVENT, handler);
}

export function updateWarehouseAppState(
  updater: (prev: WarehouseAppState) => WarehouseAppState,
): WarehouseAppState {
  const prev = readWarehouseAppState();
  const next = updater(prev);
  writeWarehouseAppState(next);
  emitWarehouseAppUpdated(next);
  return next;
}

export function markFeatureUsed(featureId: string): WarehouseAppState {
  return updateWarehouseAppState((prev) => {
    if (prev.usedFeatures.includes(featureId)) return prev;
    return { ...prev, usedFeatures: [...prev.usedFeatures, featureId] };
  });
}

export function addGoodToWarehouse(input: AddGoodInput): StoredGood {
  const safeName = sanitizeGoodName(input.name);
  if (!safeName) throw new Error("Good name is required");
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    throw new Error("Quantity must be a positive number");
  }
  if (!Number.isFinite(input.unitWeightKg) || input.unitWeightKg <= 0) {
    throw new Error("Unit weight must be a positive number");
  }

  const expiryParse = dateStringSchema.safeParse(input.expiryDate);
  if (!expiryParse.success) throw new Error("Expiry date must be YYYY-MM-DD");

  const tickets = input.tickets ?? 0;
  if (!Number.isFinite(tickets) || tickets < 0) {
    throw new Error("Tickets must be a non-negative number");
  }

  let result: StoredGood | null = null;
  updateWarehouseAppState((prev) => {
    const warehouse = prev.warehouses.find((w) => w.id === input.warehouseId);
    if (!warehouse) throw new Error("Warehouse not found");

    const currentWeightKg = getWarehouseUsedWeightKg(prev, warehouse.id);
    const attemptedAddKg = input.quantity * input.unitWeightKg;
    if (currentWeightKg + attemptedAddKg > warehouse.maxCapacityKg) {
      throw new WarehouseCapacityError({
        warehouseId: warehouse.id,
        maxCapacityKg: warehouse.maxCapacityKg,
        currentWeightKg,
        attemptedAddKg,
      });
    }

    const key = normalizeGoodKey({
      name: safeName,
      unitWeightKg: input.unitWeightKg,
      expiryDate: expiryParse.data,
    });

    const existingIndex = prev.goods.findIndex((g) => {
      if (g.warehouseId !== warehouse.id) return false;
      return normalizeGoodKey(g) === key;
    });

    const good: StoredGood = {
      id: getRandomId("good"),
      warehouseId: warehouse.id,
      name: safeName,
      quantity: Math.floor(input.quantity),
      unitWeightKg: input.unitWeightKg,
      expiryDate: expiryParse.data,
      tickets: Math.floor(tickets),
    };

    if (existingIndex === -1) {
      result = good;
      return { ...prev, goods: [...prev.goods, good] };
    }

    const existing = prev.goods[existingIndex];
    const merged: StoredGood = {
      ...existing,
      quantity: existing.quantity + good.quantity,
      tickets: existing.tickets + good.tickets,
    };

    result = merged;

    const goods = [...prev.goods];
    goods[existingIndex] = merged;
    return { ...prev, goods };
  });

  if (!result) throw new Error("Failed to create good");
  return result;
}

export function createGoodsCategorySet(input: {
  name: string;
  categories: string[];
}): GoodsCategorySet {
  const name = input.name.trim();
  if (!name) throw new Error("Category set name is required");

  const categories = input.categories
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  const categoriesParse = z.array(z.string()).min(1).max(3).safeParse(categories);
  if (!categoriesParse.success) {
    throw new Error("You must provide between 1 and 3 categories");
  }

  const unique = new Set(categoriesParse.data.map((c) => c.toLowerCase()));
  if (unique.size !== categoriesParse.data.length) {
    throw new Error("Categories must be unique");
  }

  const categorySet: GoodsCategorySet = {
    id: getRandomId("catset"),
    name,
    categories: categoriesParse.data,
  };

  updateWarehouseAppState((prev) => ({
    ...prev,
    goodsCategorySets: [...prev.goodsCategorySets, categorySet],
  }));

  return categorySet;
}

export function setGoodsCategoryAssignments(input: {
  categorySetId: string;
  assignments: Array<{ goodId: string; category: string }>;
}): WarehouseAppState {
  return updateWarehouseAppState((prev) => {
    const set = prev.goodsCategorySets.find((s) => s.id === input.categorySetId);
    if (!set) throw new Error("Category set not found");

    const allowed = new Set(set.categories.map((c) => c.toLowerCase()));
    const nextAssignments: Record<string, string> = {
      ...(prev.goodsCategoryAssignments[input.categorySetId] ?? {}),
    };

    for (const assignment of input.assignments) {
      const good = prev.goods.find((g) => g.id === assignment.goodId);
      if (!good) continue;

      if (!allowed.has(assignment.category.toLowerCase())) {
        throw new Error(
          `Category must be one of: ${set.categories.join(", ")}`,
        );
      }
      nextAssignments[good.id] = assignment.category;
    }

    return {
      ...prev,
      goodsCategoryAssignments: {
        ...prev.goodsCategoryAssignments,
        [input.categorySetId]: nextAssignments,
      },
    };
  });
}

export function getWarehouseAppFeatures() {
  return [
    {
      id: "stores",
      label: "Stores",
      description: "Browse warehouses, add goods, and view goods per warehouse",
    },
    {
      id: "goods-stored",
      label: "Goods stored",
      description: "See totals of goods by type across all warehouses",
    },
    {
      id: "close-expiry",
      label: "Close expiry",
      description: "See goods sorted by closest expiry dates first",
    },
    {
      id: "far-expiry",
      label: "Far expiry",
      description: "See goods sorted by furthest expiry dates first",
    },
    {
      id: "good-classes",
      label: "Good classes",
      description: "Create category sets (max 3 categories) and classify goods",
    },
    {
      id: "functionalities",
      label: "Functionalities",
      description: "See a list of all features split into used and unused",
    },
    {
      id: "ai",
      label: "AI assistant",
      description: "Use prompts to view and update warehouse data",
    },
  ] as const;
}
