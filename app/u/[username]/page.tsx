
import { authOptions } from "@/auth/config";
import UploadAvatar from "@/components/avatar";
import ProfileCard from "@/components/profile-card";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export default async function UserProfile({
  params,
}: {
  params: { username: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized", status: 401 });
  }
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      avatarUrl: true,
    },
  });

  if (!user) {
    return (
      <div className="text-lg font-medium text-red-500">User not found</div>
    );
  }

  const isOwnProfile =
    session.user.id === user.id || session.user.username === username;

  if (!isOwnProfile) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="text-lg font-medium text-red-500">
          Access Denied: You can only view your own profile
        </div>
      </div>
    );
  }

  const posts = await prisma.post.findMany({
    where: { userId: user.id },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <ProfileCard user={user} postCount={posts.length} />
      <div className="border rounded-md p-4">
        <UploadAvatar />
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
