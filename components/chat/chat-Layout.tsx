"use client";

import { useEffect } from "react";
import { pusherClient } from "@/lib/pusher-client";

import ChatHeader from "./chat-header";
import ChatMessage from "./chat-message";
import { Message } from "@/types/chat";
import ChatInput from "./chat-typing";
import ChatSidebar from "./chat-sidebar";

interface ChatLayoutProps {
  conversationId: string;
  initialMessages: Message[];
  otherUser: {
    id: string;
    username: string;
    avatarUrl: string | null;
  } | null;
  currentUserId: string;
}

export default function ChatLayout({
  conversationId,
  initialMessages,
  otherUser,
  currentUserId,
}: ChatLayoutProps) {
  /* ===============================
     📞 CALL SIGNAL LISTENERS
  =============================== */
  useEffect(() => {
    const channel = pusherClient.subscribe(
      `private-conversation-${conversationId}`
    );

    channel.bind("call:accepted", () => {
      console.log("📞 Call accepted — starting WebRTC next");
      // next step → open video UI
    });

    channel.bind("call:rejected", () => {
      alert("❌ Call rejected");
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`private-conversation-${conversationId}`);
    };
  }, [conversationId]);

  return (
    <div className="flex h-screen w-full bg-[#0f1115] overflow-hidden">
      {/* Sidebar */}
      <div className="w-96 flex-shrink-0 border-r border-white/10 overflow-hidden">
        <ChatSidebar />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <ChatHeader otherUser={otherUser} />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <ChatMessage
            conversationId={conversationId}
            initialMessages={initialMessages}
            currentUserId={currentUserId}
          />
        </div>

        {/* Input */}
        <ChatInput conversationId={conversationId} />
      </div>
    </div>
  );
}
