"use client";

import ChatHeader from "./chat-header";

import ChatMessage from "./chat-message";
import { Message } from "@/types/chat";
import ChatInput from "./chat-typing";
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
    <div className="">
      <div>
        <ChatHeader otherUser={otherUser} />
        <ChatMessage
          conversationId={conversationId}
          initialMessages={initialMessages}
          currentUserId={currentUserId}
        />
        <ChatInput conversationId={conversationId} />
      </div>
    </div>
  );
}
