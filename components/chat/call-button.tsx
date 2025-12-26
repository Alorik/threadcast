"use client";

import { Video } from "lucide-react";

interface CallButtonProps {
  conversationId: string;
  onCallStart?: () => void; // ← This is missing
}

export default function CallButton({
  conversationId,
  onCallStart,
}: CallButtonProps) {
  const handleCall = async () => {
    try {
      // Send call:incoming signal
      await fetch("/api/call/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          type: "call:incoming",
        }),
      });

      // Trigger the callback to show CallOverlay
      onCallStart?.();
    } catch (error) {
      console.error("Failed to start call:", error);
    }
  };

  return (
    <Video
      size={20}
      className="cursor-pointer hover:text-white transition"
      onClick={handleCall}
    />
  );
}
