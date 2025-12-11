"use client";
import { useState, useEffect } from "react";
import UploadAvatar from "@/components/avatar";
import ProfileCard from "@/components/profile-card";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function UserProfile({
  params,
}: {
  params: { username: string };
}) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchUserProfile() {
      if (status === "loading") return;

      if (!session) {
        setError("Unauthorized");
        setLoading(false);
        return;
      }

      try {
        const username = (await params).username;
        const response = await fetch(`/api/users/${username}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "User not found");
          setLoading(false);
          return;
        }

        // Check if own profile
        const isOwn =
          session.user.id === data.user.id ||
          session.user.username === username;

        if (!isOwn) {
          setError("Access Denied: You can only view your own profile");
          setLoading(false);
          return;
        }

        setUser(data.user);
        setPosts(data.posts);
        setAvatar(data.user.avatarUrl || "");
        setLoading(false);
      } catch (err) {
        setError("Failed to load profile");
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [session, status, params]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="text-lg font-medium text-red-500">{error}</div>
      </div>
    );
  }

  if (!user) return null;

  const isOwnProfile = session?.user.id === user.id;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="space-y-6">
        <ProfileCard
          user={{ ...user, avatarUrl: avatar }}
          postCount={posts.length}
          avatarUrl={avatar}
          isOwnProfile={isOwnProfile}
          onAvatarClick={() => {
            document.getElementById("avatar-file-input")?.click();
          }}
        />

        {isOwnProfile && (
          <div className="border rounded-md p-4">
            <UploadAvatar
              onUploaded={(newUrl) => {
                setAvatar(newUrl);
                router.refresh();
              }}
            />
          </div>
        )}
      </div>

      <h2 className="text-lg font-semibold mt-6">Posts</h2>
      <div className="space-y-3">
        {posts.length === 0 ? (
          <div className="text-gray-500">No posts yet</div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="border p-3 rounded-md">
              <p>{post.content}</p>
              {post.mediaUrl && (
                <img
                  src={post.mediaUrl}
                  alt="Post media"
                  className="mt-2 rounded max-w-full"
                />
              )}
              <div className="text-sm text-gray-500 mt-2">
                {new Date(post.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
