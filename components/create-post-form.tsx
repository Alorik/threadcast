"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, X, Send, Loader2 } from "lucide-react";
import Image from "next/image";

export default function CreatePostForm() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() && !file) return;

    setLoading(true);

    try {
      let mediaUrl = null;

      // 1. Upload image if exists
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Upload failed");

        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          mediaUrl = uploadData.url;
        }
      }

      // 2. Create post
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          media: mediaUrl ? [{ url: mediaUrl, type: "IMAGE" }] : [],
        }),
      });

      if (!res.ok) throw new Error("Failed to create post");

      setContent("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative group bg-neutral-900/30 border border-neutral-800 rounded-2xl p-1 transition-all focus-within:bg-neutral-900/50 focus-within:border-neutral-700"
    >
      <div className="p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-transparent text-neutral-200 placeholder-neutral-500 resize-none outline-none text-base min-h-[80px]"
          placeholder="What's on your mind?"
          disabled={loading}
        />
        

        {/* Image Preview */}
        {file && (
          <div className="relative mt-3 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 inline-block max-w-full">
            <div className="relative h-48 w-full min-w-[200px]">
              <Image
                src={URL.createObjectURL(file)}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors backdrop-blur-sm"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between px-4 pb-4 pt-2 border-t border-white/5">
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full text-indigo-400 hover:bg-indigo-500/10 transition-colors group/icon"
            title="Add Image"
          >
            <ImageIcon
              size={20}
              className="group-hover/icon:scale-110 transition-transform"
            />
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || (!content.trim() && !file)}
          className={`
            flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300
            ${
              loading || (!content.trim() && !file)
                ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                : "bg-white text-neutral-950 hover:bg-neutral-200 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:scale-[1.02]"
            }
          `}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Posting</span>
            </>
          ) : (
            <>
              <span>Post</span>
              <Send
                size={14}
                className={content.trim() ? "translate-x-0.5" : ""}
              />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
