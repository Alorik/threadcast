"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Send,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import Image from "next/image";

// Types based on your previous Prisma schema
interface Thread {
  id: string;
  content: string;
  createdAt: string;
  user?: {
    username: string;
    avatarUrl?: string | null;
  };
  _count?: {
    likes: number;
    comments: number;
  };
}

export default function ThreadsFeed() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts/threads")
      .then((res) => res.json())
      .then((data) => {
        // Ensure data is an array
        setThreads(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch threads", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/5" />
              <div className="w-0.5 h-full bg-white/5 rounded-full" />
            </div>
            <div className="flex-1 space-y-3 py-2">
              <div className="h-4 w-32 bg-white/5 rounded" />
              <div className="h-3 w-3/4 bg-white/5 rounded" />
              <div className="h-3 w-1/2 bg-white/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="py-20 text-center text-slate-500">
        <p>No threads yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto pb-20">
      <AnimatePresence initial={false}>
        {threads.map((thread, index) => (
          <ThreadItem
            key={thread.id}
            thread={thread}
            isLast={index === threads.length - 1}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

const ThreadItem = ({
  thread,
  isLast,
}: {
  thread: Thread;
  isLast: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex gap-4 p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
    >
      {/* LEFT COLUMN: Avatar + Line */}
      <div className="flex flex-col items-center gap-2 shrink-0">
        <div className="relative w-10 h-10">
          {thread.user?.avatarUrl ? (
            <Image
              src={thread.user.avatarUrl}
              alt={thread.user.username}
              fill
              className="rounded-full object-cover ring-2 ring-[#0f1115]"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white ring-2 ring-[#0f1115]">
              {thread.user?.username?.[0]?.toUpperCase() ?? "U"}
            </div>
          )}
        </div>

        {/* Connection Line */}
        {!isLast && (
          <div className="w-0.5 grow bg-white/10 rounded-full my-1 group-hover:bg-white/20 transition-colors" />
        )}
      </div>

      {/* RIGHT COLUMN: Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-100 text-sm hover:underline decoration-white/30">
              {thread.user?.username ?? "Unknown"}
            </span>
            <span className="text-xs text-slate-500">
              {new Date(thread.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <button className="text-slate-500 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
            <MoreHorizontal size={16} />
          </button>
        </div>

        {/* Text Body */}
        <p className="text-[15px] text-slate-300 leading-relaxed font-light whitespace-pre-wrap mb-3">
          {thread.content}
        </p>

        {/* Action Bar */}
        <div className="flex items-center gap-1 -ml-2">
          <ActionButton icon={Heart} label={thread._count?.likes || 0} />
          <ActionButton
            icon={MessageCircle}
            label={thread._count?.comments || 0}
          />
          <ActionButton icon={Repeat2} />
          <ActionButton icon={Send} />
        </div>
      </div>
    </motion.div>
  );
};

// Helper for Icons
const ActionButton = ({ icon: Icon, label }: { icon: any; label?: number }) => (
  <button className="flex items-center gap-1.5 p-2 rounded-full text-slate-500 hover:text-white hover:bg-white/5 transition-all group/btn">
    <Icon
      size={18}
      className="group-hover/btn:scale-110 transition-transform"
    />
    {label !== undefined && label > 0 && (
      <span className="text-xs font-medium">{label}</span>
    )}
  </button>
);
