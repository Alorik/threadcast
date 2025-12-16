"use client";
import Image from "next/image";
import { pusherClient } from "@/lib/pusher-client";
import { useEffect, useState } from "react";
import { Message } from "@/types/chat";
import { CheckCheck } from "lucide-react";
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
  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1a1d29] min-h-[calc(100vh-240px)]">
    {messages.map((msg) => {
      const isCurrentUser = msg.sender.id === currentUserId;
      const time = new Date(msg.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      return (
        <div
          key={msg.id}
          className={`flex gap-3 ${
            isCurrentUser ? "flex-row-reverse" : "flex-row"
          }`}
        >
          {/* Avatar */}
          {!isCurrentUser && (
            <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0 text-white font-semibold">
              {msg.sender.avatarUrl ? (
                <img
                  src={msg.sender.avatarUrl}
                  alt={msg.sender.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                msg.sender.username[0].toUpperCase()
              )}
            </div>
          )}

          {/* Message bubble wrapper */}
          <div
            className={`flex flex-col max-w-[70%] ${
              isCurrentUser ? "items-end" : "items-start"
            }`}
          >
            {/* The bubble */}
            <div
              className={`px-4 py-3 rounded-2xl ${
                isCurrentUser
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-tr-sm"
                  : "bg-[#2a2d3a] text-white rounded-tl-sm"
              }`}
            >
              <p className="text-[15px] leading-relaxed">{msg.content}</p>
            </div>

            {/* Time and checkmarks */}
            <div className="flex items-center gap-1 mt-1 px-2">
              <span className="text-xs text-gray-400">{time}</span>
              {isCurrentUser && (
                <CheckCheck size={14} className="text-cyan-400" />
              )}
            </div>
          </div>
        </div>
      );
    })}
  </div>
);
}
