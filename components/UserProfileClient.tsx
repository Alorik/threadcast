// components/UserProfileClient.tsx
"use client";
import Image from "next/image";
import { useState } from "react";
import ProfileCard from "./profile-card";
import UploadAvatar from "./avatar";
import { Grid, Heart, MessageCircle, Camera } from "lucide-react";

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
  // ✅ ADD SAFETY CHECK - prevent crashes if user is undefined
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="text-center space-y-3 p-8 border border-neutral-800 rounded-2xl bg-neutral-900/50">
          <p className="text-lg font-medium text-red-400">
            User data unavailable
          </p>
          <p className="text-sm text-neutral-500">
            Please verify the user ID or try again later.
          </p>
        </div>
      </div>
    );
  }

  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");

  function handleAvatarClick() {
    document.getElementById("avatar-file-input")?.click();
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-neutral-800">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-12">
        {/* Hidden Upload Input Wrapper */}
        <div className="hidden">
          <UploadAvatar onUploaded={(url) => setAvatarUrl(url)} />
        </div>

        {/* Profile Card Section */}
        <section className="relative">
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

        {/* Posts Grid Section */}
        <section>
          {/* Tab Divider */}
          <div className="flex items-center justify-center border-t border-neutral-800 mb-8">
            <div className="flex items-center gap-2 px-6 py-4 border-t border-neutral-200 -mt-px text-neutral-100 text-xs font-bold tracking-widest uppercase cursor-pointer">
              <Grid size={14} />
              <span>Posts</span>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 sm:gap-4">
            {posts.length === 0 ? (
              <div className="col-span-full py-24 text-center border border-dashed border-neutral-800 rounded-xl bg-neutral-900/20">
                <div className="mx-auto w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center mb-4 text-neutral-700">
                  <Camera size={24} />
                </div>
                <p className="text-neutral-400 font-medium">No posts yet</p>
                <p className="text-neutral-600 text-sm mt-1">
                  Capture the moment and share it with the world.
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="group relative aspect-square bg-neutral-900 border border-neutral-800 overflow-hidden cursor-pointer"
                >
                  {/* Image or Text Content */}
                  {post.mediaUrl ? (
                    <Image
                      fill
                      src={post.mediaUrl}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      alt="post"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-6 text-center bg-neutral-900 group-hover:bg-neutral-800 transition-colors">
                      <p className="text-sm text-neutral-400 line-clamp-5 leading-relaxed font-serif italic">
                        "{post.content}"
                      </p>
                    </div>
                  )}

                  {/* Hover Overlay (Instagram Style) */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-8 text-white font-bold">
                    <div className="flex items-center gap-2">
                      <Heart className="fill-white" size={20} />
                      <span>{post._count?.likes || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="fill-white" size={20} />
                      <span>{post._count?.comments || 0}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
