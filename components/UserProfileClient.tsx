"use client";
import Image from "next/image";
import { useState } from "react";
import ProfileCard from "./profile-card";
import UploadAvatar from "./avatar";
import { Grid, Heart, MessageCircle, Camera, Layers } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("posts"); // For future extensibility

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
              onClick={() => setActiveTab("posts")}
              className={`group flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase transition-all duration-500 ${
                activeTab === "posts"
                  ? "text-white"
                  : "text-neutral-600 hover:text-neutral-400"
              }`}
            >
              <span
                className={`w-1 h-1 rounded-full bg-white transition-opacity duration-300 ${
                  activeTab === "posts"
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-50"
                }`}
              />
              Gallery
            </button>

            <button
              onClick={() => setActiveTab("saved")}
              className={`group flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase transition-all duration-500 ${
                activeTab === "saved"
                  ? "text-white"
                  : "text-neutral-600 hover:text-neutral-400"
              }`}
            >
              <span
                className={`w-1 h-1 rounded-full bg-white transition-opacity duration-300 ${
                  activeTab === "saved"
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-50"
                }`}
              />
              Journal
            </button>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {posts.length === 0 ? (
              <div className="col-span-full py-32 flex flex-col items-center justify-center text-center opacity-0 animate-in fade-in duration-1000">
                <div className="w-px h-16 bg-gradient-to-b from-transparent via-neutral-800 to-transparent mb-6" />
                <p className="text-neutral-500 font-serif italic text-lg">
                  "Silence is a canvas."
                </p>
                <p className="text-neutral-700 text-xs mt-2 tracking-widest uppercase">
                  No posts yet
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="group relative aspect-[4/5] bg-neutral-900/30 rounded-xl overflow-hidden transition-all duration-700 hover:shadow-2xl hover:shadow-neutral-900/50"
                >
                  {/* Content */}
                  {post.mediaUrl ? (
                    <Image
                      fill
                      src={post.mediaUrl}
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
                      alt="post"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-8 text-center bg-neutral-900/50 group-hover:bg-neutral-900/80 transition-colors duration-500">
                      <p className="text-sm text-neutral-400 font-serif leading-relaxed line-clamp-6 opacity-70 group-hover:opacity-100 transition-opacity duration-500">
                        {post.content}
                      </p>
                    </div>
                  )}

                  {/* Aesthetic Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                    <div className="flex items-center justify-between translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                      <div className="flex gap-4 text-white/90">
                        <div className="flex items-center gap-2">
                          <Heart
                            size={16}
                            className="text-white fill-white/20"
                          />
                          <span className="text-xs font-medium">
                            {post._count?.likes || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageCircle size={16} className="text-white" />
                          <span className="text-xs font-medium">
                            {post._count?.comments || 0}
                          </span>
                        </div>
                      </div>

                      {/* Optional Date or Icon */}
                      <div className="text-[10px] text-white/50 font-mono">
                        {new Date(
                          post.createdAt || Date.now()
                        ).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Subtle Border */}
                  <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none" />
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
