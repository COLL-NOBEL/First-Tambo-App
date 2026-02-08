const NAV_ITEMS = [
  "Stores",
  "Goods stored",
  "Close Expiry",
  "Far Expiry",
  "Good classes",
] as const;

export function WarehouseTopNav() {
  return (
    <div className="flex h-14 items-center gap-2 border-b border-border bg-card px-4">
      <div className="flex items-center gap-2 overflow-x-auto">
        {NAV_ITEMS.map((label) => (
          <button
            key={label}
            type="button"
            className="h-9 shrink-0 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted/30"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
