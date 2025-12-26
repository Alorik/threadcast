"use client";

import { Video } from "lucide-react";

interface ChatHeaderProps {
  conversationId: string;
  otherUser: {
    id: string;
    username: string;
    avatarUrl: string | null;
  } | null;
  onCallStart: () => void;
}

export default function ChatHeader({
  conversationId,
  otherUser,
  onCallStart,
}: ChatHeaderProps) {
  const handleCallClick = async () => {
    console.log("📞 Call button clicked");
    
    try {
      // Send the call invitation
      const response = await fetch("/api/call/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          type: "call:incoming",
          data: {
            fromUser: {
              id: "current-user-id", // You need to pass this from props
              username: "Your Name", // You need to pass this from props
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send call invitation");
      }

      console.log("✅ Call invitation sent");
      
      // Start the call on our side
      onCallStart();
    } catch (error) {
      console.error("❌ Failed to start call:", error);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
          {otherUser?.username?.[0]?.toUpperCase() || "?"}
        </div>
        <div>
          <h2 className="text-white font-semibold">
            {otherUser?.username || "Unknown"}
          </h2>
        </div>
      </div>

      <button
        onClick={handleCallClick}
        className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors"
        title="Start video call"
      >
        <Video className="w-5 h-5 text-white" />
      </button>
    </div>
  );
}
