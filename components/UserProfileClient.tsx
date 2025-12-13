// components/UserProfileClient.tsx ✅ ADD SAFETY CHECK
"use client";
import Image from "next/image";
import { useState } from "react";
import ProfileCard from "./profile-card";
import UploadAvatar from "./avatar";

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
      <div className="max-w-3xl mx-auto p-4">
        <div className="text-lg font-medium text-red-500">
          User data not available
        </div>
      </div>
    );
  }

  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");

  function handleAvatarClick() {
    document.getElementById("avatar-file-input")?.click();
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <UploadAvatar onUploaded={(url) => setAvatarUrl(url)} />

      <ProfileCard
        user={user}
        postCount={posts.length}
        isOwnProfile={isOwnProfile}
        avatarUrl={avatarUrl}
        onAvatarClick={handleAvatarClick}
        followerCount={user.followerCount}
        followingCount={user.followingCount}
      />

      <h2 className="text-lg font-semibold mt-6">Posts</h2>
      <div className="space-y-3">
        {posts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No posts yet</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="border p-3 rounded-md">
              <p>{post.content}</p>
              {post.mediaUrl && (
                <Image
                  height={400}
                  width={400}
                  src={post.mediaUrl}
                  className="mt-2 rounded"
                  alt="post"
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
