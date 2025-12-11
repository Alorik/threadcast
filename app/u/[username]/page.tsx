// app/u/[username]/page.tsx (SERVER COMPONENT - NO "use client")
import { authOptions } from "@/auth/config";
import UserProfileClient from "@/components/UserProfileClient";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";


export default async function UserProfile({
  params,
}: {
  params: { username: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

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
    orderBy: { createdAt: "desc" },
  });

  // 👇 Instead of rendering ProfileCard + UploadAvatar directly,
  // we now send all data to a CLIENT COMPONENT that handles state.
  return (
    <UserProfileClient user={user} posts={posts} isOwnProfile={isOwnProfile} />
  );
}
