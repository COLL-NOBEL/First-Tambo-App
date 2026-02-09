"use client";

import { ApiKeyCheck } from "@/components/ApiKeyCheck";
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
import { components, tools } from "@/lib/tambo";
import { TamboProvider } from "@tambo-ai/react";
import { useState } from "react";
import {
  FunctionalitiesPanel,
  type WarehouseFunctionality,
} from "./components/functionalities-panel";

const warehouseFunctionalities: WarehouseFunctionality[] = [
  {
    id: "inventory",
    title: "Inventory",
    description: "View on-hand stock levels and search items by SKU.",
  },
  {
    id: "receiving",
    title: "Receiving",
    description: "Log incoming shipments and update stock quantities.",
  },
  {
    id: "picking",
    title: "Picking & packing",
    description: "Generate pick lists and track orders through packing.",
  },
  {
    id: "reports",
    title: "Reports",
    description: "Monitor trends like inbound volume and stockouts.",
  },
];

function WarehouseMain({ activeId }: { activeId: string }) {
  const active = warehouseFunctionalities.find((f) => f.id === activeId);

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-3xl space-y-6">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="text-sm font-medium text-muted-foreground">
            Current section
          </div>
          <div className="text-2xl font-semibold">
            {active?.title ?? "Warehouse"}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {active?.description ??
              "Use the assistant to add workflows and components for your warehouse app."}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="text-sm font-medium">Try prompts</div>
          <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground space-y-2">
            <li>
              “Add a low-stock alert for items under 10 units and show it as a
              table.”
            </li>
            <li>
              “Create a receiving form with fields: supplier, SKU, quantity,
              expected date.”
            </li>
            <li>
              “Show a chart of stockouts by week for the last 8 weeks.”
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function WarehouseAppShell() {
  const [activeId, setActiveId] = useState<string>(warehouseFunctionalities[0].id);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <FunctionalitiesPanel
        items={warehouseFunctionalities}
        activeId={activeId}
        onSelect={setActiveId}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-border bg-card px-6 py-4">
          <div className="text-lg font-semibold">Warehouse app</div>
          <div className="text-sm text-muted-foreground">
            Assistant-powered workflows with generative UI
          </div>
        </header>

        <div className="flex-1 min-h-0">
          <WarehouseMain activeId={activeId} />
        </div>
      </div>

      <aside className="hidden xl:flex h-full w-[420px] border-l border-border bg-card flex-col">
        <div className="p-4 border-b border-border">
          <div className="text-sm font-medium">Assistant</div>
          <div className="text-xs text-muted-foreground">
            Tell Tambo what to build inside this app
          </div>
        </div>

        <ScrollableMessageContainer className="flex-1 p-4">
          <ThreadContent variant="default">
            <ThreadContentMessages />
          </ThreadContent>
        </ScrollableMessageContainer>

        <div className="p-4 border-t border-border">
          <MessageInput variant="bordered">
            <MessageInputTextarea placeholder="Describe what you want to build..." />
            <MessageInputToolbar>
              <MessageInputSubmitButton />
            </MessageInputToolbar>
          </MessageInput>
        </div>
      </aside>
    </div>
  );
}

export default function WarehouseAppPage() {
  const apiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY;

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-3xl space-y-6">
          <div>
            <div className="text-3xl font-semibold">Warehouse app</div>
            <div className="mt-2 text-sm text-muted-foreground">
              Initialize Tambo to enable the assistant.
            </div>
          </div>
          <ApiKeyCheck>{null}</ApiKeyCheck>
        </div>
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
