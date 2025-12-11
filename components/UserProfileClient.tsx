"use client"
import { useState } from "react";
import ProfileCard from "./profile-card";
import UploadAvatar from "./avatar";

export default function UserProfileClient({
  user,
  posts,
  isOwnProfile,
}: {
  user: any;
  posts: any[];
  isOwnProfile: boolean;
  }) {

  
  const [avatarUrl, setAvatarurl] = useState(user.avatarUrl);
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <ProfileCard
        user={user}
        postCount={posts.length}
        isOwnProfile={isOwnProfile}
        avatarUrl={avatarUrl} // 👈 Send updated avatar
      />
      <div className="border rounded-md p-4">
        <UploadAvatar onUploaded={(url) => setAvatarurl(url)} />
      </div>

      <h2 className="text-lg font-semibold mt-6">Posts</h2>
      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.id} className="border p-3 rounded-md">
            <p>{post.content}</p>
            {post.mediaUrl && (
              <img src={post.mediaUrl} className="mt-2 rounded" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
