"use client";

import { ApiKeyCheck } from "@/components/ApiKeyCheck";
import { MessageThreadPanel } from "@/components/tambo/message-thread-panel";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { components, tools } from "@/lib/tambo";
import { TamboProvider } from "@tambo-ai/react";
import { WarehouseCanvas } from "./warehouse-canvas";
import { WarehouseTopNav } from "./warehouse-top-nav";

export function WarehouseScreen() {
  const mcpServers = useMcpServers();

  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY ?? ""}
      components={components}
      tools={tools}
      tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
      mcpServers={mcpServers}
    >
      <div className="h-screen w-full bg-background text-foreground">
        <div className="flex h-full w-full flex-col md:flex-row">
          <div className="flex h-full w-full flex-col md:w-[70%]">
            <WarehouseTopNav />
            <div className="min-h-0 flex-1">
              <WarehouseCanvas />
            </div>
          </div>

          <div className="flex w-full flex-col gap-4 border-t border-border bg-background p-4 md:w-[30%] md:border-l md:border-t-0">
            <ApiKeyCheck>
              <div className="h-[60vh] w-full overflow-hidden rounded-lg border border-border bg-card">
                <MessageThreadPanel />
              </div>
            </ApiKeyCheck>
          </div>
        </div>
      </div>
    </TamboProvider>
  );
}
