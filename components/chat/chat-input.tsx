"use client";

import { useEffect, useRef } from "react";
import { pusherClient } from "@/lib/pusher-client";

export default function ChatInput({
  conversationId,
}: {
  conversationId: string;
}) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  function handleTyping() {
    pusherClient.send_event(
      "typing:start",
      {},
      `private-conversation-${conversationId}`
    );

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      pusherClient.send_event(
        "typing:stop",
        {},
        `private-conversation-${conversationId}`
      );
    }, 1500);
  }

  return (
    <input
      type="text"
      placeholder="Type a message..."
      className="w-full border rounded px-3 py-2"
      onChange={handleTyping}
    />
  );
}
