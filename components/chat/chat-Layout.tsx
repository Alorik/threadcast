"use client";

import ChatHeader from "./chat-header";
import ChatMessage from "./chat-message";

interface ChatLayoutProps {
  conversationId: string;
  initialMessages: any[];
  otherUser: {
    id: string;
    username: string;
    avatarUrl: string | null;
  } | null;
}

export default function ChatLayout({
  conversationId,
  initialMessages,
}: ChatLayoutProps) {
  return (
    <div className="">
      <div>
        <ChatHeader />
        <ChatMessage
          conversationId={conversationId}
          initialMessages={initialMessages}
        />
      </div>
    </div>
  );
}
