"use client"

import Image from "next/image";
import {
  MoreVertical,
  Phone,
  Video,
} from "lucide-react";

type ChatHeaderProps = {
  otherUser: {
    id: string;
    avatarUrl: string | null;
    username: string;
  }
}

export default function ChatHeader({otherUser}: ChatHeaderProps) {
  

  return (
    <div className="h-20 border border-white/20 flex items-center overflow-hidden max-w-3xl bg-slate-950">
      <div className="flex items-center justify-between w-full px-4">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
            {otherUser?.avatarUrl ? (
              <Image
                src={otherUser.avatarUrl}
                alt={otherUser.username}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-lg">
                {otherUser?.username?.[0]?.toUpperCase() || "?"}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <div className="text-white font-semibold">
              {otherUser?.username || "Unknown"}
            </div>
            <div className="text-gray-400 text-sm">online</div>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <Phone size={20} className="cursor-pointer hover:opacity-80" />
          <Video size={20} className="cursor-pointer hover:opacity-80" />
          <div className="w-px h-6 bg-white/20 mx-2" />
          <MoreVertical size={20} />
        </div>
      </div>
    </div>
  );
}