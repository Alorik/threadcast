"use client";

import { pusherClient } from "@/lib/pusher-client";
import { useEffect, useRef, useState } from "react";
import { Message } from "@/types/chat";
import { CheckCheck } from "lucide-react";

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

  // Always scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  useEffect(() => {
    const channel = pusherClient.subscribe(
      `private-conversation-${conversationId}`
    );

    // Handle new messages
    channel.bind("new-message", (message: Message) => {
      setMessages((prev) =>
        prev.some((m) => m.id === message.id) ? prev : [...prev, message]
      );
    });

    // Handle typing events
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

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`private-conversation-${conversationId}`);
    };
  }, [conversationId, currentUserId]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#1a1d29] px-4 py-4 pb-32 space-y-4">
      {messages.map((msg) => {
        const isMe = msg.sender.id === currentUserId;
        const time = new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={msg.id}
            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
          >
            <div className="max-w-[70%] space-y-1">
              <div
                className={`px-4 py-3 rounded-2xl ${
                  isMe
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-br-sm"
                    : "bg-[#2a2d3a] text-white rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>

              <div className="flex items-center gap-1 text-xs text-gray-400 justify-end">
                {time}
                {isMe && <CheckCheck size={14} className="text-cyan-400" />}
              </div>
            </div>
          </div>
        );
      })}

      {/* Typing indicator */}
      {typingUser && (
        <div className="flex space-x-1">
          {[0, 150, 300].map((delay) => (
            <div
              key={delay}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
