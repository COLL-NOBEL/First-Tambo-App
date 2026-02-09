"use client";

import { cn } from "@/lib/utils";

export type WarehouseFunctionality = {
  id: string;
  title: string;
  description: string;
};

export type FunctionalitiesPanelProps = {
  items: WarehouseFunctionality[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
};

export function FunctionalitiesPanel({
  items,
  activeId,
  onSelect,
  className,
}: FunctionalitiesPanelProps) {
  return (
    <nav
      className={cn(
        "h-full w-72 border-r border-border bg-card text-card-foreground",
        className,
      )}
      aria-label="Warehouse sections"
    >
      <div className="p-4 border-b border-border">
        <div className="text-sm font-medium text-muted-foreground">App</div>
        <div className="text-lg font-semibold">Warehouse</div>
      </div>

      <ul className="p-2 space-y-1">
        {items.map((item) => {
          const isActive = item.id === activeId;

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className={cn(
                  "w-full text-left rounded-md px-3 py-2 transition-colors",
                  "hover:bg-muted/40",
                  isActive && "bg-muted/60",
                )}
              >
                <div className="text-sm font-medium">{item.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {item.description}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
