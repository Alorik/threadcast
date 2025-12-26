"use client";

import { pusherClient } from "@/lib/pusher-client";
import { useEffect, useState } from "react";

interface IncomingCallListenerProps {
  caller: {
    id: string;
    username: string;
  };
  onAccept: () => Promise<void>;
  onReject: () => Promise<void>;
  conversationId: string;
}

export default function IncomingCallListener({
  caller,
  onAccept,
  onReject,
  conversationId,
}: IncomingCallListenerProps) {
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    const channel = pusherClient.subscribe(
      `private-conversation-${conversationId}`
    );

    channel.bind("call:accepted", () => {
      setIsAccepted(true);
    });

    channel.bind("call:rejected", () => {
      onReject();
    });

    channel.bind("call:ended", () => {
      setIsAccepted(false);
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`private-conversation-${conversationId}`);
    };
  }, [conversationId, onReject]);

  const handleAccept = async () => {
    try {
      await fetch("/api/call/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          type: "call:accepted",
        }),
      });
      await onAccept();
    } catch (error) {
      console.error("Failed to accept call:", error);
    }
  };

  const handleReject = async () => {
    try {
      await fetch("/api/call/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          type: "call:rejected",
        }),
      });
      await onReject();
    } catch (error) {
      console.error("Failed to reject call:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#16181d] p-6 rounded-2xl space-y-4">
        <h2 className="text-white font-semibold text-lg">Incoming Call</h2>
        <p className="text-white/60">{caller.username} is calling...</p>
        <div className="flex gap-4">
          <button
            onClick={handleAccept}
            className="px-4 py-2 rounded-xl bg-green-500 text-black font-medium hover:bg-green-600 transition-colors"
          >
            Accept
          </button>

          <button
            onClick={handleReject}
            className="px-4 py-2 rounded-xl bg-red-500 text-black font-medium hover:bg-red-600 transition-colors"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
