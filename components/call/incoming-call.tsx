"use client";

import { pusherClient } from "@/lib/pusher-client";
import { useEffect, useState } from "react";

export default function IncomingCallListener({
  conversationId,
}: {
  conversationId: string;
}) {
  const [incoming, setIncoming] = useState(false);

  useEffect(() => {
    const channel = pusherClient.subscribe(
      `private-conversation-${conversationId}`
    );
    channel.bind("call:incoming", () => {
      setIncoming(true);
    });

    channel.bind("call:ended", () => {
      setIncoming(false);
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`private-conversation${conversationId}`);
    };
  }, [conversationId]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#16181d] p-6 rounded-2xl space-y-4">
        <h2 className="text-white font-semibold text-lg">Incoming Call</h2>
        <div className="flex gap-4">
          <button
            onClick={() => {
              fetch("/api/call/signal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  conversationId,
                  type: "call:accepted",
                }),
              });
            }}
            className="px-4 py-2 rounded-xl bg-green-500 text-black"
          >
            Accept
          </button>

          <button
            onClick={() => {
              fetch("/api/call/signal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  conversationId,
                  type: "call:rejected",
                }),
              });
            }}
            className="px-4 py-2 rounded-xl bg-green-500 text-black"
          >Reject</button>
        </div>
      </div>
    </div>
  );
}
