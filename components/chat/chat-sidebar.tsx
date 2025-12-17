//chat-sidebar.tsx
"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

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

export default function ChatSidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const activeId = pathname?.split("/").pop();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current user
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        setCurrentUserId(session?.user?.id);

        // Fetch conversations
        const convRes = await fetch("/api/chat/conversations");
        const data = await convRes.json();

        console.log("📦 Conversations from API:", data);
        console.log("📊 Number of conversations:", data.length);

        if (data.length > 0) {
          console.log("✅ First conversation:", data[0]);
          console.log("👥 Members:", data[0].members);
          console.log("💬 Messages:", data[0].messages);
        }

        // ✅ Set conversations in state (API already filters to only conversations with messages)
        setConversations(data);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
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

  // Format timestamp to show relative time (e.g., "2h", "Yesterday", "3d")
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

  const filtered = conversations.filter((conv) => {
    const otherUser = getOtherUser(conv);
    return otherUser.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-full flex flex-col bg-[#0f1115] p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Messages</h2>
        <button
          className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
          onClick={() => router.push("/users")}
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 animate-pulse"
              >
                <div className="w-12 h-12 rounded-full bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p className="text-sm">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </p>
            <p className="text-xs mt-2">
              {searchQuery
                ? "Try a different search"
                : "Start chatting with someone!"}
            </p>
          </div>
        ) : (
          filtered.map((conv) => {
            const otherUser = getOtherUser(conv);
            const lastMessage = conv.messages[0]; // messages are sorted by createdAt desc
            const isLastMessageFromMe = lastMessage?.senderId === currentUserId;
            const timestamp = lastMessage
              ? formatTimestamp(lastMessage.createdAt)
              : "";

            return (
              <button
                key={conv.id}
                onClick={() => router.push(`/chat/${conv.id}`)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  activeId === conv.id
                    ? "bg-white/10 border border-white/5"
                    : "hover:bg-white/5"
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center overflow-hidden">
                    {otherUser.avatarUrl ? (
                      <Image
                        height={56}
                        width={56}
                        alt={otherUser.username}
                        src={otherUser.avatarUrl}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {otherUser.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-white truncate">
                      {otherUser.username}
                    </p>
                    {timestamp && (
                      <span className="text-xs text-slate-500 shrink-0">
                        {timestamp}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate">
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
          })
        )}
      </div>
    </div>
  );
}
