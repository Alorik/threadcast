"use client";

import { useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusher-client";

import ChatHeader from "./chat-header";
import ChatMessage from "./chat-message";
import ChatInput from "./chat-typing";
import ChatSidebar from "./chat-sidebar";

import { Message } from "@/types/chat";
import IncomingCallListener from "../call/incoming-call";

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
  /* ------------------------------
     Incoming Call State
  ------------------------------ */
  const [incomingCall, setIncomingCall] = useState<{
    fromUser: {
      id: string;
      username: string;
    };
  } | null>(null);

  /* ------------------------------
     Pusher — Call Signaling
  ------------------------------ */
  useEffect(() => {
    const channelName = `private-conversation-${conversationId}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind("call:incoming", (data) => {
      console.log("📞 Incoming call:", data);
      setIncomingCall(data);
    });

    channel.bind("call:ended", () => {
      setIncomingCall(null);
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
    };
  }, [conversationId]);

  /* ------------------------------
     Accept / Reject handlers
  ------------------------------ */
  const acceptCall = async () => {
    await fetch("/api/chat/call/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId }),
    });

    setIncomingCall(null);
  };

  const rejectCall = async () => {
    await fetch("/api/chat/call/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId }),
    });

    setIncomingCall(null);
  };

  /* ------------------------------
     UI
  ------------------------------ */
  return (
    <div className="flex h-screen w-full bg-[#0f1115] overflow-hidden">
      {/* Sidebar */}
      <div className="w-96 flex-shrink-0 border-r border-white/10">
        <ChatSidebar />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <ChatHeader
          conversationId={conversationId}
          otherUser={otherUser} />

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

      {/* Incoming Call Modal */}
      {incomingCall && (
        <IncomingCallListener
          caller={incomingCall.fromUser}
          onAccept={acceptCall}
          onReject={rejectCall}
        />
      )}
    </div>
  );
}
