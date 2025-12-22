"use client";

import { pusherClient } from "@/lib/pusher-client";
import { useEffect, useRef, useState } from "react";
import { Message } from "@/types/chat";
import { CheckCheck } from "lucide-react";
import ImageMessage from "./image-message";

interface ChatMessageProps {
  conversationId: string;
  initialMessages: Message[];
  currentUserId: string;
}


export default function ChatMessage({
  conversationId,
  initialMessages,
  currentUserId,
}: ChatMessageProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  /* ------------------------------
   Auto scroll to bottom
  ------------------------------ */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  /* ------------------------------
   Mark messages as READ
  ------------------------------ */
  useEffect(() => {
    // Check if there are any unread messages from the OTHER user
    const unreadMessages = messages.filter(
      (m) => m.sender.id !== currentUserId && !m.readAt
    );

    if (unreadMessages.length > 0) {
      fetch("/api/chat/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
    }
  }, [conversationId, messages, currentUserId]);

  /* ------------------------------
   Pusher realtime events
  ------------------------------ */
  useEffect(() => {
    const channelName = `private-conversation-${conversationId}`;
    const channel = pusherClient.subscribe(channelName);

    // New message
    channel.bind("new-message", (message: Message) => {
      console.log("📨 Received new message:", message);
      console.log("Type:", message.type, "MediaUrl:", message.mediaUrl);
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    // Typing indicator
    channel.bind(
      "typing:start",
      (data: { userId: string; username: string }) => {
        if (data.userId !== currentUserId) {
          setTypingUser(data.username);
        }
      }
    );

    channel.bind("typing:stop", (data: { userId: string }) => {
      if (data.userId !== currentUserId) {
        setTypingUser(null);
      }
    });

    // Read receipts
    channel.bind("messages:read", () => {
      setMessages((prev) =>
        prev.map((m) => {
          // If the message was sent by ME and is currently unread, mark it as read
          if (m.sender.id === currentUserId && !m.readAt) {
            return { ...m, readAt: new Date().toISOString() };
          }
          return m;
        })
      );
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
    };
  }, [conversationId, currentUserId]);

  /* ------------------------------
   UI
  ------------------------------ */
  return (
    <div className="flex-1 overflow-y-auto bg-[#1a1d29] px-4 py-4 pb-32 space-y-4">
      {messages.map((msg) => {
        const isMe = msg.sender.id === currentUserId;
        const time = new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        // Check if readAt exists and is valid
        const isRead = Boolean(msg.readAt);

        return (
          <div
            key={msg.id}
            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] space-y-1 ${
                isMe ? "items-end flex flex-col" : ""
              }`}
            >
              {/* Message bubble */}
              <div
                className={`px-3 py-2 rounded-2xl ${
                  isMe
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-br-sm"
                    : "bg-[#2a2d3a] text-white rounded-bl-sm"
                }`}
              >
                {msg.type === "IMAGE" ? (
                  <ImageMessage
                    src={msg.mediaUrl!}
                    isOwn={msg.sender.id === currentUserId}
                  />
                ) : (
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                )}
              </div>
              {/* Time + Read receipt status */}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{time}</span>
                {isMe && (
                  <div className="flex items-center gap-1 transition-colors duration-300">
                    <span
                      className={
                        isRead ? "text-cyan-400 font-medium" : "text-gray-500"
                      }
                    >
                      {isRead ? "Read" : "Delivered"}
                    </span>
                    <CheckCheck
                      size={16}
                      className={isRead ? "text-cyan-400" : "text-gray-500"}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Typing indicator */}
      {typingUser && (
        <div className="flex gap-1 px-2 py-2">
          <span className="text-xs text-gray-500 mr-2">
            {typingUser} is typing
          </span>
          <div className="flex gap-1 items-center">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="h-1.5 w-1.5 rounded-full bg-gray-500 animate-bounce"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
