"use client";

import { useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusher-client";

import ChatHeader from "./chat-header";
import ChatMessage from "./chat-message";
import ChatInput from "./chat-typing";
import ChatSidebar from "./chat-sidebar";

import { Message } from "@/types/chat";
import IncomingCallListener from "../call/incoming-call";
import CallOverlay from "../call/Overlay";

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

  const [isInCall, setIsInCall] = useState(false);
  const [isCaller, setIsCaller] = useState(false);

  /* ------------------------------
     Pusher — Call Signaling
  ------------------------------ */
  useEffect(() => {
    const channelName = `private-conversation-${conversationId}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind(
      "call:incoming",
      (data: {
        fromUser: { id: string; username: string };
        userId: string;
      }) => {
        console.log("📞 Incoming call:", data);

        // Only show incoming call modal if I'm NOT the one who initiated the call
        if (data.userId !== currentUserId) {
          setIncomingCall(data);
        }
      }
    );

    channel.bind("call:accepted", () => {
      console.log("✅ Call accepted");
      setIncomingCall(null);
      setIsInCall(true);
    });

    channel.bind("call:rejected", () => {
      console.log("❌ Call rejected");
      setIncomingCall(null);
      setIsInCall(false);
      setIsCaller(false);
    });

    channel.bind("call:ended", () => {
      console.log("📴 Call ended");
      setIncomingCall(null);
      setIsInCall(false);
      setIsCaller(false);
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
    };
  }, [conversationId, currentUserId]);

  /* ------------------------------
     Accept / Reject handlers
  ------------------------------ */
  const acceptCall = async () => {
    await fetch("/api/call/signal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        type: "call:accepted",
      }),
    });

    setIncomingCall(null);
    setIsInCall(true);
    setIsCaller(false); // I'm the receiver
  };

  const rejectCall = async () => {
    await fetch("/api/call/signal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        type: "call:rejected",
      }),
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
          otherUser={otherUser}
          onCallStart={() => {
            console.log("🎬 onCallStart called!");
            console.log("Setting isCaller=true, isInCall=true");
            setIsCaller(true);
            setIsInCall(true);
            console.log("State set:", { isCaller: true, isInCall: true });
          }}
        />

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

      {/* Incoming Call Modal - Only show if NOT the caller */}
      {incomingCall && !isCaller && (
        <IncomingCallListener
          caller={incomingCall.fromUser}
          onAccept={acceptCall}
          onReject={rejectCall}
          conversationId={conversationId}
        />
      )}

      {/* Call Overlay - Show when in active call */}
      {isInCall && (
        <CallOverlay
          conversationId={conversationId}
          isCaller={isCaller}
          onEndCall={() => {
            setIsInCall(false);
            setIsCaller(false);
            setIncomingCall(null);
          }}
        />
      )}
    </div>
  );
}
