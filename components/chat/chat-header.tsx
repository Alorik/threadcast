"use client";

import Image from "next/image";
import { MoreVertical, Phone, Video } from "lucide-react";
import { usePresence } from "@/app/providers/presence-provider";
import { useEffect } from "react";
import CallButton from "./call-button";

type ChatHeaderProps = {
  conversationId: string,
  otherUser: {
    id: string;
    avatarUrl: string | null;
    username: string;
  } | null;
};

export default function ChatHeader({ conversationId ,otherUser }: ChatHeaderProps) {
  const { onlineUsers } = usePresence();

  const isOnline = otherUser?.id ? onlineUsers.has(otherUser.id) : false;

  return (
    <div className="h-20 border-b border-white/10 flex items-center bg-slate-950">
      <div className="flex items-center justify-between w-full px-4">
        {/* Left */}
        <div className="flex gap-4 items-center">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center">
              {otherUser?.avatarUrl ? (
                <Image
                  src={otherUser.avatarUrl}
                  alt={otherUser.username}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              ) : (
                <span className="text-white font-semibold text-lg">
                  {otherUser?.username?.[0]?.toUpperCase() || "?"}
                </span>
              )}
            </div>

            {/* Online dot */}
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-950 rounded-full" />
            )}
          </div>

          <div className="flex flex-col">
            <div className="text-white font-semibold">
              {otherUser?.username || "Unknown"}
            </div>
            <div className="text-gray-400 text-sm">
              {isOnline ? "online" : "offline"}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex gap-4 items-center text-gray-400">
          <Phone
            size={20}
            className="cursor-pointer hover:text-white transition"
          />
          <CallButton conversationId={conversationId } />
          <div className="w-px h-6 bg-white/20 mx-2" />
          <MoreVertical
            size={20}
            className="cursor-pointer hover:text-white transition"
          />
        </div>
      </div>
    </div>
  );
}
