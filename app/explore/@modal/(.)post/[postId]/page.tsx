"use client"

import { X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";


export default function ExplorePostModal({ post }: { post: any }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.back()}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0f1115] rounded-2xl max-w-5xl w-full h-[80vh] flex overflow-hidden"
      >
        <div className="flex-1 bg-black relative">
          <Image
            src={post.media[0].url}
            alt="post"
            fill
            className="object-contain"
          />
        </div>

        <div className="w-[400px] p-6 border-l border-white/10 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="font-bold">@{post.user.username}</span>
            <button onClick={() => router.back()}>
              <X />
            </button>
          </div>
          <p className="mt-4 text-slate-300">{post.content}</p>
          <div className="mt-auto text-sm text-slate-500">
            ❤️ {post._count.likes} likes
          </div>
        </div>
      </div>
    </div>
  );
}