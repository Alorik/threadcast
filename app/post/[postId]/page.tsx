import { prisma } from "@/lib/prisma";
import Image from "next/image";

export default async function PostPage({
  params,
}: {
  params: { postId: string };
  }) {
  
  const post = await prisma.post.findUnique({
    where: { id: params.postId },
    include: {
      user: true,
      media: true,
      _count: { select: { likes: true } },
    },
  });

  if (!post) return null;

  return (
    <div className="min-h-screen bg-black text-white flex justify-center">
      <div className="max-w-xl w-full">
        {post.media[0] && (
          <Image
            src={post.media[0].url}
            alt="post"
            width={600}
            height={600}
            className="rounded-xl"
          />
        )}
        <h2 className="mt-4 font-bold">@{post.user.username}</h2>
        <p className="text-slate-300">{post.content}</p>
      </div>
    </div>
  );
}
