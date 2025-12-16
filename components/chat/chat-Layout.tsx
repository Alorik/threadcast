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
  currentUserId
}: ChatLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-[#0f1115]">
      {/* Sidebar - Fixed width */}
      <div className="w-96 flex-shrink-0 border-r border-white/10">
        <ChatSidebar />
      </div>

      {/* Main Chat Area - Takes remaining space */}
      <div className="flex-1 flex flex-col">
        {/* Header - Fixed at top */}
        <div className="flex-shrink-0">
          <ChatHeader otherUser={otherUser} />
        </div>

        {/* Messages - Scrollable area */}
        <div className="flex-1 overflow-hidden">
          <ChatMessage
            conversationId={conversationId}
            initialMessages={initialMessages}
            currentUserId={currentUserId}
          />
        </div>

        {/* Input - Fixed at bottom */}
        <div className="flex-shrink-0">
          <ChatInput conversationId={conversationId} />
        </div>
      </div>
    </div>
  );
}