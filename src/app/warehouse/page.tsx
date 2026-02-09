"use client";

import { ApiKeyCheck } from "@/components/ApiKeyCheck";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { FunctionalitiesPanel } from "@/components/tambo/functionalities-panel";
import { GoodsClassesManager } from "@/components/tambo/goods-classes-manager";
import { GoodsExpiryList } from "@/components/tambo/goods-expiry-list";
import { GoodsStoredList } from "@/components/tambo/goods-stored-list";
import {
  Message,
  MessageContent,
  MessageImages,
  MessageRenderedComponentArea,
  ReasoningInfo,
  ToolcallInfo,
} from "@/components/tambo/message";
import {
  MessageInput,
  MessageInputSubmitButton,
  MessageInputTextarea,
  MessageInputToolbar,
} from "@/components/tambo/message-input";
import { WarehouseExplorer } from "@/components/tambo/warehouse-explorer";
import { useWarehouseAppState } from "@/lib/use-warehouse-app-state";
import { components, tools } from "@/lib/tambo";
import { cn } from "@/lib/utils";
import { TamboProvider, useTambo } from "@tambo-ai/react";
import { Bot, X } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";

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

type WorkspaceMode = "navigation" | "ai";

function AiResultsPanel(props: { startIndex: number; onClose: () => void }) {
  const { thread, generationStage, isIdle } = useTambo();
  const isGenerating = !isIdle;

  const filteredMessages = useMemo(
    () =>
      (thread?.messages ?? []).filter(
        (message) => message.role !== "system" && !message.parentMessageId,
      ),
    [thread?.messages],
  );

  const assistantMessages = useMemo(
    () =>
      filteredMessages
        .slice(props.startIndex)
        .filter((message) => message.role === "assistant"),
    [filteredMessages, props.startIndex],
  );

  return (
    <ViewPanel title="AI results" onClose={props.onClose}>
      <div className="space-y-4">
        {assistantMessages.length === 0 ? (
          <div className="rounded-md border border-border bg-background p-4">
            <div className="text-sm font-medium">Waiting for results…</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {isGenerating
                ? generationStage
                  ? `Generating (${generationStage})`
                  : "Generating"
                : "Submit a prompt in the AI panel."}
            </div>
          </div>
        ) : (
          assistantMessages.map((message, index) => (
            <div
              key={
                message.id ??
                `${message.role}-${message.createdAt ?? `${index}`}-${message.content?.toString().substring(0, 10)}`
              }
            >
              <Message
                role="assistant"
                message={message}
                variant="default"
                isLoading={isGenerating && index === assistantMessages.length - 1}
                className="flex w-full justify-start"
              >
                <div className="flex w-full flex-col">
                  <ReasoningInfo />
                  <MessageImages />
                  <MessageContent className="text-foreground font-sans" />
                  <ToolcallInfo />
                  <MessageRenderedComponentArea className="w-full" />
                </div>
              </Message>
            </div>
          ))
        )}
      </div>
    </ViewPanel>
  );
}

function WarehouseAppShell() {
  const { markFeatureUsed } = useWarehouseAppState();
  const { thread } = useTambo();

  const [activeView, setActiveView] = useState<ViewId | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>(
    "navigation",
  );
  const [aiStartIndex, setAiStartIndex] = useState(0);

  const filteredMessages = useMemo(
    () =>
      (thread?.messages ?? []).filter(
        (message) => message.role !== "system" && !message.parentMessageId,
      ),
    [thread?.messages],
  );

  useEffect(() => {
    if (!activeView) return;
    markFeatureUsed(activeView);
  }, [activeView, markFeatureUsed]);

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
    setWorkspaceMode("navigation");
    setActiveView((prev) => (prev === viewId ? null : viewId));
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
                  workspaceMode === "navigation" &&
                    activeView === item.id &&
                    "bg-muted",
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
            {workspaceMode === "navigation" && activeView ? (
              <ViewPanel title={activeTitle} onClose={() => setActiveView(null)}>
                {activeContent}
              </ViewPanel>
            ) : workspaceMode === "ai" ? (
              <AiResultsPanel
                startIndex={aiStartIndex}
                onClose={() => setWorkspaceMode("navigation")}
              />
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
                  <h2 className="text-sm font-semibold">AI prompt</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChatOpen(false)}
                  className="rounded-md p-2 hover:bg-muted"
                  aria-label="Close AI prompt"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 p-4">
                <div className="rounded-md border border-border bg-background p-4 text-sm text-muted-foreground">
                  Use this panel to submit prompts. Results will appear in the
                  main workspace below the navigation bar.
                </div>
              </div>

              <div className="border-t border-border p-4">
                <MessageInput
                  variant="bordered"
                  onSubmitCapture={() => {
                    setWorkspaceMode("ai");
                    setActiveView(null);
                    setAiStartIndex(filteredMessages.length);
                  }}
                >
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
  );
}

export default function WarehouseAppPage() {
  const apiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY;
  if (!apiKey) {
    return (
      <div className="min-h-screen bg-background p-8">
        <ApiKeyCheck>
          <div />
        </ApiKeyCheck>
      </div>
    );
  }

  return (
    <TamboProvider
      apiKey={apiKey}
      components={components}
      tools={tools}
      tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
    >
      <WarehouseAppShell />
    </TamboProvider>
  );
}
