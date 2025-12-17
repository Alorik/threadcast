// app/chat/page.tsx
"use client";

import ChatSidebar from "@/components/chat/chat-sidebar";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Conversation = {
  id: string;
  updatedAt: string;
  members: {
    userId: string;
    user: {
      id: string;
      username: string;
      avatarUrl: string | null;
    };
  }[];
  messages: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
  }[];
};

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current user
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        console.log("📦 Session:", session);
        setCurrentUserId(session?.user?.id);

        // Fetch conversations
        const convRes = await fetch("/api/chat/conversations");

        if (!convRes.ok) {
          const errorData = await convRes.json();
          console.error("❌ API Error:", errorData);
          return;
        }

        const data = await convRes.json();
        console.log("📦 Conversations data from API:", data);
        console.log(
          "📊 Number of conversations:",
          Array.isArray(data) ? data.length : "Not an array"
        );

        if (Array.isArray(data)) {
          setConversations(data);
        } else {
          console.error("❌ Data is not an array:", data);
          setConversations([]);
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get other user from conversation
  const getOtherUser = (conv: Conversation) => {
    const otherMember = conv.members.find((m) => m.userId !== currentUserId);
    return (
      otherMember?.user || {
        id: "unknown",
        username: "Unknown User",
        avatarUrl: null,
      }
    );
  };

  // Format timestamp
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
      const diffInMins = Math.floor(diffInMs / (1000 * 60));
      return diffInMins < 1 ? "now" : `${diffInMins}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="h-screen w-full bg-[#0f1115] flex">
      {/* Sidebar - Fixed width */}
      <div className="w-96 shrink-0 border-r border-white/10">
        <ChatSidebar />
      </div>

      {/* Main content area - Shows conversations */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold text-white">Messages</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 animate-pulse"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-700 rounded w-1/3" />
                    <div className="h-3 bg-slate-700 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-slate-400">
                <p className="text-lg mb-2">No conversations yet</p>
                <p className="text-sm">
                  Start chatting with someone to see your conversations here
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => {
                const otherUser = getOtherUser(conv);
                const lastMessage = conv.messages[0];
                const isLastMessageFromMe =
                  lastMessage?.senderId === currentUserId;
                const timestamp = lastMessage
                  ? formatTimestamp(lastMessage.createdAt)
                  : "";

                return (
                  <button
                    key={conv.id}
                    onClick={() => router.push(`/chat/${conv.id}`)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all text-left"
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center overflow-hidden">
                        {otherUser.avatarUrl ? (
                          <Image
                            height={64}
                            width={64}
                            alt={otherUser.username}
                            src={otherUser.avatarUrl}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-xl">
                            {otherUser.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-base font-semibold text-white truncate">
                          {otherUser.username}
                        </p>
                        {timestamp && (
                          <span className="text-xs text-slate-500 shrink-0">
                            {timestamp}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 truncate">
                        {lastMessage ? (
                          <>
                            {isLastMessageFromMe && (
                              <span className="text-slate-500">You: </span>
                            )}
                            {lastMessage.content}
                          </>
                        ) : (
                          "No messages yet"
                        )}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
