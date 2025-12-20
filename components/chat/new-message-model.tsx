"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Portal from "../ui/portal";

type User = {
  id: string;
  username: string;
  avatarUrl: string | null;
};

export default function NewMessageModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    fetch("/api/users/following")
      .then((res) => res.json())
      .then(setUsers);
  }, [open]);

  if (!open) return null;

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  async function startChat(userId: string) {
    const res = await fetch("/api/chat/conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: userId }),
    });

    const conversation = await res.json();
    onClose();
    router.push(`/chat/${conversation.id}`);
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-md bg-[#1c1f26] rounded-2xl shadow-xl overflow-hidden flex flex-col h-[500px]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
            <h3 className="text-white font-semibold">New message</h3>
            <button
              onClick={onClose}
              className="hover:bg-white/10 rounded-full p-1 transition"
            >
              <X className="text-slate-400 hover:text-white" size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="px-4 py-3 border-b border-white/10 flex-shrink-0">
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-white outline-none text-sm placeholder:text-slate-500"
            />
          </div>

          {/* Users List - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="p-4 text-slate-500 text-sm">No users found</p>
            ) : (
              filtered.map((user) => (
                <button
                  key={user.id}
                  onClick={() => startChat(user.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt={user.username}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-white font-bold">
                        {user.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>

                  <span className="text-white text-sm font-medium">
                    {user.username}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 flex-shrink-0">
            <button
              disabled
              className="w-full py-2 rounded-xl bg-indigo-600/40 text-white text-sm cursor-not-allowed"
            >
              Chat
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
