import ExplorePostModal from "@/components/explore/page";
import { prisma } from "@/lib/prisma";

export default async function Page({ params }: { params: { postId: string } }) {
  const post = await prisma.post.findUnique({
    where: {
      id: params.postId,
    },
    include: {
      user: true,
      media: true,
      _count: { select: { likes: true } },
    },
  });

  if (!post) return null;
  return <div>
    <ExplorePostModal post={post} />
  </div> 
}
