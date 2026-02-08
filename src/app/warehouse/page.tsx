"use client";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { FunctionalitiesPanel } from "@/components/tambo/functionalities-panel";
import { GoodsClassesManager } from "@/components/tambo/goods-classes-manager";
import { GoodsExpiryList } from "@/components/tambo/goods-expiry-list";
import { GoodsStoredList } from "@/components/tambo/goods-stored-list";
import {
  MessageInput,
  MessageInputSubmitButton,
  MessageInputTextarea,
  MessageInputToolbar,
} from "@/components/tambo/message-input";
import { ScrollableMessageContainer } from "@/components/tambo/scrollable-message-container";
import {
  ThreadContent,
  ThreadContentMessages,
} from "@/components/tambo/thread-content";
import { WarehouseExplorer } from "@/components/tambo/warehouse-explorer";
import { useWarehouseAppState } from "@/lib/use-warehouse-app-state";
import { components, tools } from "@/lib/tambo";
import { cn } from "@/lib/utils";
import { TamboProvider } from "@tambo-ai/react";
import { Bot, X } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";

type ViewId =
  | "stores"
  | "goods-stored"
  | "close-expiry"
  | "far-expiry"
  | "good-classes"
  | "functionalities";

type NavItem = {
  id: ViewId;
  label: string;
};

function ViewPanel(props: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-semibold">{props.title}</h2>
        <button
          type="button"
          onClick={props.onClose}
          className="rounded-md p-2 hover:bg-muted"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4">{props.children}</div>
    </div>
  );
}

export default function WarehouseAppPage() {
  const { markFeatureUsed } = useWarehouseAppState();

  const [activeView, setActiveView] = useState<ViewId | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const navItems: NavItem[] = useMemo(
    () => [
      { id: "stores", label: "Stores" },
      { id: "goods-stored", label: "Goods stored" },
      { id: "close-expiry", label: "Close expiry" },
      { id: "far-expiry", label: "Far expiry" },
      { id: "good-classes", label: "Good classes" },
      { id: "functionalities", label: "Functionalities" },
    ],
    [],
  );

  const openView = (viewId: ViewId) => {
    setActiveView((prev) => {
      const next = prev === viewId ? null : viewId;
      if (next) markFeatureUsed(viewId);
      return next;
    });
  };

  const activeContent = (() => {
    switch (activeView) {
      case "stores":
        return <WarehouseExplorer />;
      case "goods-stored":
        return <GoodsStoredList />;
      case "close-expiry":
        return <GoodsExpiryList order="close" />;
      case "far-expiry":
        return <GoodsExpiryList order="far" />;
      case "good-classes":
        return <GoodsClassesManager />;
      case "functionalities":
        return <FunctionalitiesPanel />;
      default:
        return null;
    }
  })();

  const activeTitle = (() => {
    switch (activeView) {
      case "stores":
        return "Stores";
      case "goods-stored":
        return "Goods stored";
      case "close-expiry":
        return "Close expiry";
      case "far-expiry":
        return "Far expiry";
      case "good-classes":
        return "Good classes";
      case "functionalities":
        return "Functionalities";
      default:
        return "";
    }
  })();

  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={components}
      tools={tools}
      tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
    >
      <div className="flex h-screen flex-col bg-background">
        <div className="sticky top-0 z-10 border-b border-border bg-card">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openView(item.id)}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm hover:bg-muted",
                    activeView === item.id && "bg-muted",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const next = !isChatOpen;
                  setIsChatOpen(next);
                  if (next) markFeatureUsed("ai");
                }}
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
              >
                <Bot className="h-4 w-4" />
                <span className="hidden sm:inline">AI</span>
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-auto">
            <div className="mx-auto max-w-6xl p-4">
              {activeView ? (
                <ViewPanel
                  title={activeTitle}
                  onClose={() => setActiveView(null)}
                >
                  {activeContent}
                </ViewPanel>
              ) : (
                <div className="rounded-lg border border-border bg-card p-6">
                  <h1 className="text-2xl font-semibold">Warehouse app</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Use the buttons in the navigation bar to view warehouses,
                    stored goods, expiry lists, and good classes.
                  </p>
                </div>
              )}
            </div>
          </main>

          <aside
            className={cn(
              "border-l border-border bg-card transition-[width] duration-200",
              isChatOpen ? "w-[360px]" : "w-0",
            )}
          >
            {isChatOpen ? (
              <div className="flex h-full w-[360px] flex-col">
                <div className="flex items-center justify-between gap-2 border-b border-border p-4">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    <h2 className="text-sm font-semibold">AI assistant</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsChatOpen(false)}
                    className="rounded-md p-2 hover:bg-muted"
                    aria-label="Close AI assistant"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <ScrollableMessageContainer className="flex-1 p-4">
                  <ThreadContent variant="default">
                    <ThreadContentMessages />
                  </ThreadContent>
                </ScrollableMessageContainer>

                <div className="border-t border-border p-4">
                  <MessageInput variant="bordered">
                    <MessageInputTextarea placeholder="Ask about warehouses or goods..." />
                    <MessageInputToolbar>
                      <MessageInputSubmitButton />
                    </MessageInputToolbar>
                  </MessageInput>
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </TamboProvider>
  );
}
