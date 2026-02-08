"use client";

import type { messageVariants } from "@/components/tambo/message";
import {
  MessageInput,
  MessageInputError,
  MessageInputFileButton,
  MessageInputMcpConfigButton,
  MessageInputMcpPromptButton,
  MessageInputMcpResourceButton,
  MessageInputSubmitButton,
  MessageInputTextarea,
  MessageInputToolbar,
} from "@/components/tambo/message-input";
import {
  MessageSuggestions,
  MessageSuggestionsList,
  MessageSuggestionsStatus,
} from "@/components/tambo/message-suggestions";
import { ScrollableMessageContainer } from "@/components/tambo/scrollable-message-container";
import { ThreadContainer } from "@/components/tambo/thread-container";
import {
  ThreadContent,
  ThreadContentMessages,
} from "@/components/tambo/thread-content";
import type { Suggestion } from "@tambo-ai/react";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";

export interface MessageThreadPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: VariantProps<typeof messageVariants>["variant"];
}

export const MessageThreadPanel = React.forwardRef<
  HTMLDivElement,
  MessageThreadPanelProps
>(({ className, variant, ...props }, ref) => {
  const defaultSuggestions: Suggestion[] = [
    {
      id: "warehouse-save",
      title: "Save a good",
      detailedSuggestion: "Help me save a good in a warehouse.",
      messageId: "warehouse-save",
    },
    {
      id: "warehouse-list",
      title: "List tickets",
      detailedSuggestion: "List all ticket ids and good names.",
      messageId: "warehouse-list",
    },
    {
      id: "warehouse-ticket",
      title: "Show ticket",
      detailedSuggestion: "Show ticket id <paste-id-here>.",
      messageId: "warehouse-ticket",
    },
  ];

  return (
    <ThreadContainer
      ref={ref}
      disableSidebarSpacing
      className={className}
      {...props}
    >
      <ScrollableMessageContainer className="p-4">
        <ThreadContent variant={variant}>
          <ThreadContentMessages />
        </ThreadContent>
      </ScrollableMessageContainer>

      <MessageSuggestions>
        <MessageSuggestionsStatus />
      </MessageSuggestions>

      <div className="px-4 pb-4">
        <MessageInput>
          <MessageInputTextarea placeholder="Ask me to save a good, list tickets, or show a ticket..." />
          <MessageInputToolbar>
            <MessageInputFileButton />
            <MessageInputMcpPromptButton />
            <MessageInputMcpResourceButton />
            <MessageInputMcpConfigButton />
            <MessageInputSubmitButton />
          </MessageInputToolbar>
          <MessageInputError />
        </MessageInput>
      </div>

      <MessageSuggestions initialSuggestions={defaultSuggestions}>
        <MessageSuggestionsList />
      </MessageSuggestions>
    </ThreadContainer>
  );
});
MessageThreadPanel.displayName = "MessageThreadPanel";
