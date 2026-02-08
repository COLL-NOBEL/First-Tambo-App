/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * This file serves as the central place to register your Tambo components and tools.
 * It exports arrays that will be used by the TamboProvider.
 *
 * Read more about Tambo at https://tambo.co/docs
 */

import { Graph, graphSchema } from "@/components/tambo/graph";
import {
  FunctionalitiesPanel,
  functionalitiesPanelSchema,
} from "@/components/tambo/functionalities-panel";
import {
  GoodsClassesManager,
  goodsClassesManagerSchema,
} from "@/components/tambo/goods-classes-manager";
import {
  GoodsExpiryList,
  goodsExpiryListSchema,
} from "@/components/tambo/goods-expiry-list";
import {
  GoodsStoredList,
  goodsStoredListSchema,
} from "@/components/tambo/goods-stored-list";
import {
  WarehouseExplorer,
  warehouseExplorerSchema,
} from "@/components/tambo/warehouse-explorer";
import {
  WarehouseGoodsList,
  warehouseGoodsListSchema,
} from "@/components/tambo/warehouse-goods-list";
import { DataCard, dataCardSchema } from "@/components/ui/card-data";
import {
  getCountryPopulations,
  getGlobalPopulationTrend,
} from "@/services/population-stats";
import {
  getWarehouseAppData,
  warehouseAddGood,
  warehouseCreateCategorySet,
  warehouseSetCategoryAssignments,
} from "@/services/warehouse-tools";
import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";

/**
 * tools
 *
 * This array contains all the Tambo tools that are registered for use within the application.
 * Each tool is defined with its name, description, and expected props. The tools
 * can be controlled by AI to dynamically fetch data based on user interactions.
 */

export const tools: TamboTool[] = [
  {
    name: "countryPopulation",
    description:
      "A tool to get population statistics by country with advanced filtering options",
    tool: getCountryPopulations,
    inputSchema: z.object({
      continent: z.string().optional(),
      sortBy: z.enum(["population", "growthRate"]).optional(),
      limit: z.number().optional(),
      order: z.enum(["asc", "desc"]).optional(),
    }),
    outputSchema: z.array(
      z.object({
        countryCode: z.string(),
        countryName: z.string(),
        continent: z.enum([
          "Asia",
          "Africa",
          "Europe",
          "North America",
          "South America",
          "Oceania",
        ]),
        population: z.number(),
        year: z.number(),
        growthRate: z.number(),
      }),
    ),
  },
  {
    name: "globalPopulation",
    description:
      "A tool to get global population trends with optional year range filtering",
    tool: getGlobalPopulationTrend,
    inputSchema: z.object({
      startYear: z.number().optional(),
      endYear: z.number().optional(),
    }),
    outputSchema: z.array(
      z.object({
        year: z.number(),
        population: z.number(),
        growthRate: z.number(),
      }),
    ),
  },
  {
    name: "warehouseAppData",
    description:
      "Get the current warehouse app data: warehouses, goods, category sets, and which features have been used",
    tool: getWarehouseAppData,
    inputSchema: z.object({}),
    outputSchema: z.object({
      warehouses: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          maxCapacityKg: z.number(),
          usedWeightKg: z.number(),
        }),
      ),
      goods: z.array(
        z.object({
          id: z.string(),
          warehouseId: z.string(),
          warehouseName: z.string(),
          name: z.string(),
          quantity: z.number(),
          unitWeightKg: z.number(),
          expiryDate: z.string(),
          tickets: z.number(),
        }),
      ),
      goodsCategorySets: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          categories: z.array(z.string()),
        }),
      ),
      usedFeatures: z.array(z.string()),
    }),
  },
  {
    name: "warehouseAddGood",
    description:
      "Add a good to a warehouse. Enforces the max capacity of 1,000,000kg per warehouse.",
    tool: warehouseAddGood,
    inputSchema: z.object({
      warehouseId: z.string(),
      name: z.string(),
      quantity: z.number(),
      unitWeightKg: z.number(),
      expiryDate: z.string(),
      tickets: z.number().optional(),
    }),
    outputSchema: z.object({
      id: z.string(),
      warehouseId: z.string(),
      name: z.string(),
      quantity: z.number(),
      unitWeightKg: z.number(),
      expiryDate: z.string(),
      tickets: z.number(),
    }),
  },
  {
    name: "warehouseCreateCategorySet",
    description:
      "Create a goods category set (1-3 categories). Example categories: Electronic, Not electronic.",
    tool: warehouseCreateCategorySet,
    inputSchema: z.object({
      name: z.string(),
      categories: z.array(z.string()).min(1).max(3),
    }),
    outputSchema: z.object({
      id: z.string(),
      name: z.string(),
      categories: z.array(z.string()),
    }),
  },
  {
    name: "warehouseSetCategoryAssignments",
    description:
      "Assign goods to categories for a category set. Each assignment is a goodId -> category.",
    tool: warehouseSetCategoryAssignments,
    inputSchema: z.object({
      categorySetId: z.string(),
      assignments: z.array(
        z.object({
          goodId: z.string(),
          category: z.string(),
        }),
      ),
    }),
    outputSchema: z.object({
      categorySetId: z.string(),
      totalAssignments: z.number(),
    }),
  },
  // Add more tools here
];

/**
 * components
 *
 * This array contains all the Tambo components that are registered for use within the application.
 * Each component is defined with its name, description, and expected props. The components
 * can be controlled by AI to dynamically render UI elements based on user interactions.
 */
export const components: TamboComponent[] = [
  {
    name: "Graph",
    description:
      "A component that renders various types of charts (bar, line, pie) using Recharts. Supports customizable data visualization with labels, datasets, and styling options.",
    component: Graph,
    propsSchema: graphSchema,
  },
  {
    name: "DataCard",
    description:
      "A component that displays options as clickable cards with links and summaries with the ability to select multiple items.",
    component: DataCard,
    propsSchema: dataCardSchema,
  },
  {
    name: "WarehouseExplorer",
    description:
      "Browse warehouses as a grid, then add goods to a selected warehouse or show all goods in that warehouse. Warehouses have a max capacity of 1,000,000kg.",
    component: WarehouseExplorer,
    propsSchema: warehouseExplorerSchema,
  },
  {
    name: "WarehouseGoodsList",
    description:
      "Show all goods stored in a warehouse, including quantity, weight, expiry date, and tickets.",
    component: WarehouseGoodsList,
    propsSchema: warehouseGoodsListSchema,
  },
  {
    name: "GoodsStoredList",
    description:
      "Show all goods types stored across all warehouses with total quantities and tickets.",
    component: GoodsStoredList,
    propsSchema: goodsStoredListSchema,
  },
  {
    name: "GoodsExpiryList",
    description:
      "Show all goods sorted by expiry date. Supports closest-expiry-first or furthest-expiry-first.",
    component: GoodsExpiryList,
    propsSchema: goodsExpiryListSchema,
  },
  {
    name: "GoodsClassesManager",
    description:
      "Create goods category sets (max 3 categories) and classify each good. Displays a table of goods grouped by category.",
    component: GoodsClassesManager,
    propsSchema: goodsClassesManagerSchema,
  },
  {
    name: "FunctionalitiesPanel",
    description:
      "Show the list of warehouse app functionalities split into used and unused.",
    component: FunctionalitiesPanel,
    propsSchema: functionalitiesPanelSchema,
  },
  // Add more components here
];
