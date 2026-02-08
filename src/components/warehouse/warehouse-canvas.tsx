"use client";

import { WarehouseSavedMessage } from "@/components/tambo/warehouse-saved-message";
import { cn } from "@/lib/utils";
import { useTambo, type TamboThreadMessage } from "@tambo-ai/react";
import * as React from "react";

type RenderedComponentMessage = {
  messageId: string;
  component: React.ReactNode;
};

function getRenderedComponentMessages(
  messages: TamboThreadMessage[] | undefined,
): RenderedComponentMessage[] {
  if (!messages) return [];

  return messages
    .filter(
      (m): m is TamboThreadMessage & {
        id: string;
        renderedComponent: React.ReactNode;
      } => Boolean(m.id) && Boolean(m.renderedComponent) && !m.isCancelled,
    )
    .filter((m) => m.role === "assistant")
    .map((m) => ({ messageId: m.id!, component: m.renderedComponent! }));
}

export function WarehouseCanvas({ className }: { className?: string }) {
  const { thread } = useTambo();
  const [focusedMessageId, setFocusedMessageId] = React.useState<string | null>(
    null,
  );
  const itemRefs = React.useRef(new Map<string, HTMLDivElement>());

  const renderedComponents = React.useMemo(
    () => getRenderedComponentMessages(thread?.messages),
    [thread?.messages],
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const onShow = (event: Event) => {
      const detail = (event as CustomEvent).detail as
        | { messageId?: string }
        | undefined;
      const messageId = detail?.messageId;
      if (!messageId) return;

      setFocusedMessageId(messageId);
      requestAnimationFrame(() => {
        itemRefs.current.get(messageId)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    };

    window.addEventListener("tambo:showComponent", onShow);
    return () => window.removeEventListener("tambo:showComponent", onShow);
  }, []);

  React.useEffect(() => {
    if (!focusedMessageId) return;
    const timer = setTimeout(() => setFocusedMessageId(null), 2000);
    return () => clearTimeout(timer);
  }, [focusedMessageId]);

  return (
    <div
      data-canvas-space="true"
      className={cn("w-full h-full overflow-y-auto", className)}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4">
        <WarehouseSavedMessage />

        {renderedComponents.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Warehouse dashboard</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use the chat on the right to add components here. Example prompts:
            </p>
            <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground">
              <li>"Help me save a good in warehouse 3"</li>
              <li>"List all ticket ids"</li>
              <li>"Show ticket id &lt;paste-id-here&gt;"</li>
            </ul>
          </div>
        ) : (
          renderedComponents.map(({ messageId, component }) => (
            <div
              key={messageId}
              ref={(node) => {
                if (node) itemRefs.current.set(messageId, node);
                else itemRefs.current.delete(messageId);
              }}
              className={cn(
                "flex justify-center",
                focusedMessageId === messageId && "animate-flash rounded-lg",
              )}
            >
              <div className="w-full flex justify-center">{component}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
