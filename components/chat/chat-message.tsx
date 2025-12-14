"use client";
import Image from "next/image";
import { pusherClient } from "@/lib/pusher-client";
import { useEffect, useState } from "react";

type Message = {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    avatarUrl?: string | null;
  };
};

export default function ChatMessage({
  conversationId,
  initialMessages,
}: {
  conversationId: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  useEffect(() => {
    const channelName = `private-conversation-${conversationId}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind("new-message", (message: Message) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    return () => {
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
              {/* ✅ Show timestamp */}
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
    </div>
  );
}
