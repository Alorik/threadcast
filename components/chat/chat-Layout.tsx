// ========== ChatLayout.tsx ==========
"use client";

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
  return (
    <div className="flex h-screen w-full bg-[#0f1115] overflow-hidden">
      {/* Sidebar */}
      <div className="w-96 flex-shrink-0 border-r border-white/10 overflow-hidden">
        <ChatSidebar />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - Fixed */}
        <ChatHeader otherUser={otherUser} />

        {/* Messages - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <ChatMessage
            conversationId={conversationId}
            initialMessages={initialMessages}
            currentUserId={currentUserId}
          />
        </div>

        {/* Input - Fixed */}
        <ChatInput conversationId={conversationId} />
      </div>
    </div>
  );
}
