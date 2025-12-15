"use client";
import Image from "next/image";
import { pusherClient } from "@/lib/pusher-client";
import { useEffect, useState } from "react";
import { Message } from "@/types/chat";

interface ChatMessageProps {
  conversationId: string;
  initialMessages: Message[];
  currentUserId: string; // ✅ Add this prop
}

export default function ChatMessage({
  conversationId,
  initialMessages,
  currentUserId,
}: ChatMessageProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  useEffect(() => {
    const channelName = `private-conversation-${conversationId}`;
    const channel = pusherClient.subscribe(channelName);

    // Listen for new messages
    channel.bind("new-message", (message: Message) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    // Listen for typing indicators
    channel.bind("typing:start", (data: { username: string }) => {
      setTypingUser(data.username);
    });

    channel.bind("typing:stop", () => {
      setTypingUser(null);
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
    };
  }, [conversationId]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1a1d29]">
      {messages.map((msg) => {
        const isCurrentUser = msg.sender.id === currentUserId;

        return (
          <div
            key={msg.id}
            className={`flex gap-3 ${currentUserId}> "flex-row-reverse": "flex-row"`}
          >
            {/* //avatar */}
            {!isCurrentUser && (
              <div className="rounded-full w-10 h-10 bg-pink-500 flex items-center justify-center flex-shrink-0 text-white font-semibold">
                {msg.sender.avatarUrl ? (
                  <Image
                    src={msg.sender.avatarUrl}
                    alt={msg.sender.username}
                    height={35}
                    width={35}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  msg.sender.username[0].toLocaleUpperCase()
                )}
              </div>
            )}

            {/* Message bubble wrapper */}
            <div
              className={`flex flex-col max-w-[70%] ${
                isCurrentUser ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`px-4 py-3 rounded-2xl ${
                  isCurrentUser
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded--sm"
                    : "bg-[#2a2d3a] text-white rounded-tl-sm"
                }`}
              >
                <p className="text-[15px] leading-relaxed">{msg.content}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
