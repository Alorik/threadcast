"use client";
import Image from "next/image";
import { useState } from "react";

import ProfileCard from "./profile-card";
import UploadAvatar from "../avatar";

export default function UserProfileClient({
  user,
  posts,
  isOwnProfile,
}: {
  user: {
    id: string;
    username: string;
    name?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    followerCount: number;
    followingCount: number;
  };
  posts: any[];
  isOwnProfile: boolean;
  }) {
  
  
  const galleryPosts = posts.filter(
    (post) => post.media && post.media.length > 0
  );

  const threadPosts = posts.filter(
    (post) => !post.media || post.media.length === 0
  );
  // ✅ SAFETY CHECK
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center space-y-2">
          <p className="text-neutral-400 font-medium tracking-wide">
            Profile unavailable
          </p>
          <p className="text-xs text-neutral-600">
            The user could not be found.
          </p>
        </div>
      </div>
    );
  }

  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [activeTab, setActiveTab] = useState<"gallery" | "threads">("gallery"); // For future extensibility
  

  function handleAvatarClick() {
    document.getElementById("avatar-file-input")?.click();
  }

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 font-sans selection:bg-neutral-800 pb-20">
      {/* Background Texture for "Calm" feel */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-12 space-y-16">
        {/* Hidden Upload Input */}
        <div className="hidden">
          <UploadAvatar onUploaded={(url) => setAvatarUrl(url)} />
        </div>

        {/* Profile Card */}
        <section>
          <ProfileCard
            user={user}
            postCount={posts.length}
            isOwnProfile={isOwnProfile}
            avatarUrl={avatarUrl}
            onAvatarClick={handleAvatarClick}
            followerCount={user.followerCount}
            followingCount={user.followingCount}
          />
        </section>

        {/* Content Section */}
        <section className="space-y-8">
          {/* Aesthetic Tab Switcher */}
          <div className="flex items-center justify-center gap-12 border-t border-neutral-900 pt-8">
            <button
              onClick={() => setActiveTab("gallery")}
              className={`group flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase transition-all duration-500 ${
                activeTab === "gallery"
                  ? "text-white"
                  : "text-neutral-600 hover:text-neutral-400"
              }`}
            >
              <span
                className={`w-1 h-1 rounded-full bg-white transition-opacity duration-300 ${
                  activeTab === "gallery"
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-50"
                }`}
              />
              Gallery
            </button>

            <button
              onClick={() => setActiveTab("threads")}
              className={`group flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase transition-all duration-500 ${
                activeTab === "threads"
                  ? "text-white"
                  : "text-neutral-600 hover:text-neutral-400"
              }`}
            >
              <span
                className={`w-1 h-1 rounded-full bg-white transition-opacity duration-300 ${
                  activeTab === "threads"
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-50"
                }`}
              />
              Threads
            </button>
          </div>

          {/* Gallery Grid */}
          {activeTab === "gallery" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {galleryPosts.length === 0 ? (
                <EmptyState text="No gallery posts yet" />
              ) : (
                galleryPosts.map((post) => (
                  <div
                    key={post.id}
                    className="group relative aspect-[4/5] bg-neutral-900/30 rounded-xl overflow-hidden"
                  >
                    <Image
                      fill
                      src={post.media[0].url}
                      alt="post"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <span className="text-xs text-white/70">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "threads" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              {threadPosts.length === 0 ? (
                <EmptyState text="No threads yet" />
              ) : (
                threadPosts.map((post) => (
                  <div
                    key={post.id}
                    className="border border-neutral-800 rounded-xl p-6 bg-neutral-900/40"
                  >
                    <p className="text-neutral-300 leading-relaxed">
                      {post.content}
                    </p>

                    <div className="flex items-center justify-between mt-4 text-xs text-neutral-500">
                      <span>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>

                      <div className="flex gap-4">
                        <span>❤️ {post._count?.likes || 0}</span>
                        <span>💬 {post._count?.comments || 0}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-32 text-center text-neutral-600 italic">{text}</div>
  );
}