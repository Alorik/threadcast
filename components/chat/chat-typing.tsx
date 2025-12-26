"use client";

import { useState, useRef, useEffect } from "react";
import { Smile, Paperclip, Send, X } from "lucide-react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import Image from "next/image";

interface ChatInputProps {
  conversationId: string;
}

export default function ChatInput({ conversationId }: ChatInputProps) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleTyping() {
    fetch("/api/chat/typing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, type: "start" }),
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      fetch("/api/chat/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, type: "stop" }),
      });
    }, 1500);
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (isSending) return;
    if (!text.trim() && !imageFile) return;

    setIsSending(true);

    try {
      let payload: {
        conversationId: string;
        type: string;
        content?: string;
        mediaUrl?: string;
      } = {
        conversationId,
        type: "TEXT",
        content: text.trim(),
      };

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Image upload failed");

        const { url } = await uploadRes.json();

        payload = {
          conversationId,
          type: "IMAGE",
          mediaUrl: url,
        };
      }

      const res = await fetch(
        `/api/chat/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Message send failed");

      setText("");
      removeImage();
      setShowEmojiPicker(false);
    } catch (err) {
      console.error(err);
      alert("Failed to send message");
    } finally {
      setIsSending(false);
    }
  }

  const onEmojiClick = (emoji: EmojiClickData) => {
    setText((prev) => prev + emoji.emoji);
  };

  return (
    <div className="bg-[#0f1115] p-4">
      {imagePreview && (
        <div className="mb-3 relative w-32">
          <Image
            src={imagePreview}
            height={350}
            width={350}
            className="rounded-xl object-cover"
            alt="preview"
          />
          <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-black/70 rounded-full p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <form
        onSubmit={sendMessage}
        className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleImageSelect}
        />

        <Paperclip
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer text-slate-400 hover:text-white"
        />

        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
          className="flex-1 bg-transparent outline-none text-sm text-white"
        />

        <div ref={emojiPickerRef} className="relative">
          <Smile
            onClick={() => setShowEmojiPicker((p) => !p)}
            className="cursor-pointer text-slate-400 hover:text-white"
          />
          {showEmojiPicker && (
            <div className="absolute bottom-12 right-0 z-50">
              <EmojiPicker theme={Theme.DARK} onEmojiClick={onEmojiClick} />
            </div>
          )}
        </div>

        <button
          disabled={isSending}
          className="bg-cyan-500 hover:bg-cyan-400 p-2 rounded-xl disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
