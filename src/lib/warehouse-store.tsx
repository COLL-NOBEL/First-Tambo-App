"use client";

import * as React from "react";

export type WarehouseTicket = {
  id: string;
  goodName: string;
  warehouseNumber: number;
  units: number;
  unitWeight: number;
  expiryDate: string;
  createdAt: string;
};

export type CreateWarehouseTicketInput = Omit<
  WarehouseTicket,
  "id" | "createdAt"
>;

type WarehouseStoreState = {
  tickets: WarehouseTicket[];
  lastSavedTicket: WarehouseTicket | null;
};

type WarehouseStoreContextValue = {
  tickets: WarehouseTicket[];
  lastSavedTicket: WarehouseTicket | null;
  saveTicket: (input: CreateWarehouseTicketInput) => WarehouseTicket;
  getTicketById: (id: string) => WarehouseTicket | undefined;
  clearLastSavedTicket: () => void;
};

const STORAGE_KEY = "warehouse:tickets:v1";

function safeParseTickets(value: string | null): WarehouseTicket[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is WarehouseTicket => {
      if (!item || typeof item !== "object") return false;
      const record = item as Record<string, unknown>;
      return (
        typeof record.id === "string" &&
        typeof record.goodName === "string" &&
        typeof record.warehouseNumber === "number" &&
        typeof record.units === "number" &&
        typeof record.unitWeight === "number" &&
        typeof record.expiryDate === "string" &&
        typeof record.createdAt === "string"
      );
    });
  } catch {
    return [];
  }
}

function getInitialState(): WarehouseStoreState {
  if (typeof window === "undefined") {
    return { tickets: [], lastSavedTicket: null };
  }

  return {
    tickets: safeParseTickets(localStorage.getItem(STORAGE_KEY)),
    lastSavedTicket: null,
  };
}

const WarehouseStoreContext =
  React.createContext<WarehouseStoreContextValue | null>(null);

export function WarehouseStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = React.useState<WarehouseStoreState>(() =>
    getInitialState(),
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tickets));
  }, [state.tickets]);

  const saveTicket = React.useCallback(
    (input: CreateWarehouseTicketInput) => {
      const ticket: WarehouseTicket = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...input,
      };

      setState((prev) => ({
        tickets: [ticket, ...prev.tickets],
        lastSavedTicket: ticket,
      }));

      return ticket;
    },
    [],
  );

  const getTicketById = React.useCallback(
    (id: string) => state.tickets.find((t) => t.id === id),
    [state.tickets],
  );

  const clearLastSavedTicket = React.useCallback(() => {
    setState((prev) => ({ ...prev, lastSavedTicket: null }));
  }, []);

  const value = React.useMemo<WarehouseStoreContextValue>(
    () => ({
      tickets: state.tickets,
      lastSavedTicket: state.lastSavedTicket,
      saveTicket,
      getTicketById,
      clearLastSavedTicket,
    }),
    [
      clearLastSavedTicket,
      getTicketById,
      saveTicket,
      state.lastSavedTicket,
      state.tickets,
    ],
  );

  return (
    <WarehouseStoreContext.Provider value={value}>
      {children}
    </WarehouseStoreContext.Provider>
  );
}

export function useWarehouseStore(): WarehouseStoreContextValue {
  const context = React.useContext(WarehouseStoreContext);
  if (!context) {
    throw new Error(
      "useWarehouseStore must be used within a WarehouseStoreProvider",
    );
  }
  return context;
}
