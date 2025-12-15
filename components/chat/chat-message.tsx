"use client";
import Image from "next/image";
import { pusherClient } from "@/lib/pusher-client";
import { useEffect, useState } from "react";
import { Message } from "@/types/chat";


export default function ChatMessage({
  conversationId,
  initialMessages,
}: {
  conversationId: string;
  initialMessages: Message[];
}) {
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
    <div className="space-y-3">
      {messages.map((msg) => (
        <div key={msg.id} className="flex gap-2">
          <Image
            height={40}
            width={40}
            alt="avatar"
            src={msg.sender.avatarUrl || "/avatar.png"}
            className="w-8 h-8 rounded-full"
          />
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <p className="text-sm font-medium">{msg.sender.username}</p>
              <span className="text-xs text-gray-500">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p className="text-sm">{msg.content}</p>
          </div>
        </div>
      ))}

      {/* ✅ Typing Indicator */}
      {typingUser && (
        <div className="flex gap-2 items-center text-sm text-gray-500 italic">
          <div className="flex gap-1">
            <span
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></span>
            <span
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></span>
            <span
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></span>
          </div>
          <span>{typingUser} is typing...</span>
        </div>
      )}
    </div>
  );
}
