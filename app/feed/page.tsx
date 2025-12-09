import CreatePostForm from "@/components/create-post-form";
import LikeButton from "@/components/like-button";
import { prisma } from "@/lib/prisma";

export default async function FedPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
      _count: {
        select: {likes: true}
      }
    },
  });

  return (
    <div>
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold mb-2">Feed</h1>
        <CreatePostForm />
        <div className="mt-4 space-y-3">
          {posts.length === 0 && (
            <p className="text-sm text-gray-500">No posts yet. Be the first!</p>
          )}

          {posts.map((post) => (
            <article key={post.id} className="border rounded-md p-3 space-y-1">
              {" "}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">
                  {post.user?.username ?? "Unknown"}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(post.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm">{post.content}</p>
              <div className="flex items-center gap-2 text-xstext-gray-700">
                <span>❤️ {post._count.likes} likes</span>
                <LikeButton postId={post.id} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
