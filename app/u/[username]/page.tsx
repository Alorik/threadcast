// app/u/[username]/page.tsx ✅ FIX THIS
import { authOptions } from "@/auth/config";
import FollowButton from "@/components/follow-button";
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

  // ❌ THESE EARLY RETURNS WERE THE PROBLEM - they should stay in the server component
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="text-lg font-medium text-red-500">User not found</div>
      </div>
    );
  }

  const isOwnProfile =
    session.user.id === user.id || session.user.username === username;

  const posts = await prisma.post.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const isFollowing = await prisma.follow.findFirst({
    where: {
      followerId: session.user.id,
      followingId: user.id,
    },
  });

  const followerCount = await prisma.follow.count({
    where: {
      followingId: user.id,
    },
  });

  const followingCount = await prisma.follow.count({
    where: {
      followerId: user.id,
    },
  });

  const userWithCounts = {
    ...user,
    followerCount,
    followingCount,
  };

  // ✅ Only render UserProfileClient after all checks pass
  return (
    <div>
      <UserProfileClient
        user={userWithCounts}
        posts={posts}
        isOwnProfile={isOwnProfile}
      />
      {!isOwnProfile && (
        <FollowButton
          targetUserId={user.id}
          isFollowingInitial={!!isFollowing}
        />
      )}
    </div>
  );
}
