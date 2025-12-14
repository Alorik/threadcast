"use client"
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
            height={400}
            width={400}
            alt="img"
            src={msg.sender.avatarUrl || "/avatar.png"}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <p className="text-sm font-medium">{msg.sender.username}</p>
            <p className="text-sm">{msg.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}