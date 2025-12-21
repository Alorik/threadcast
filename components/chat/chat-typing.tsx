"use client";

import { useState, useRef, useEffect } from "react";
import { Smile, Paperclip, Send } from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { pusherClient } from "@/lib/pusher-client";

interface ChatInputProps {
  conversationId: string;
}

export default function ChatInput({ conversationId }: ChatInputProps) {
  console.log("🔑 ChatInput conversationId:", conversationId);
  const [inputValue, setInputValue] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleTyping() {
    fetch("/api/chat/typing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        type: "start",
      }),
    });
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      fetch("/api/chat/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          type: "stop",
        }),
      });
    }, 1500);
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    setIsSending(true);
    const messageContent = inputValue;
    setInputValue("");

    console.log("📤 Sending message:", {
      conversationId,
      content: messageContent,
    }); // ✅ Debug log

    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          content: messageContent,
        }),
      });

      console.log("📥 Response status:", response.status); // ✅ Debug log

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Error response:", errorData); // ✅ Debug log
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      console.log("✅ Success:", data); // ✅ Debug log

      setShowEmojiPicker(false);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      pusherClient.send_event(
        "typing:stop",
        {},
        `private-conversation-${conversationId}`
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      setInputValue(messageContent);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setInputValue((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="flex w-full bg-[#0f1115] p-4 md:p-6 font-sans text-slate-200 items-center justify-center">
      <div className="w-full max-w-2xl">
        <form
          onSubmit={sendMessage}
          className="flex items-end gap-2 bg-white/5 border border-white/10
          rounded-2xl p-2 pl-4 focus-within:border-cyan-500/50
          focus-within:bg-slate-900/60 transition-all shadow-2xl
          backdrop-blur-md"
        >
          <Paperclip className="text-slate-400 hover:text-white mb-1 cursor-pointer" />
          <input
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              handleTyping();
            }}
            type="text"
            placeholder="Type a message..."
            disabled={isSending}
            className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder-slate-500 h-10 py-2.5 text-sm disabled:opacity-50"
          />
          <div className="flex items-center justify-center gap-2">
            <div className="relative" ref={emojiPickerRef}>
              <Smile
                className="text-slate-400 hover:text-white cursor-pointer mb-1"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              />
              {showEmojiPicker && (
                <div className="absolute bottom-12 right-0 z-50">
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    theme="dark"
                    searchDisabled
                    skinTonePickerLocation="PREVIEW"
                    height={400}
                    width={350}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!inputValue.trim() || isSending}
              className="p-2.5 rounded-xl bg-cyan-500 text-white hover:bg-cyan-400 disabled:opacity-50 disabled:hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-500/20"
            >
              {isSending ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send
                  size={14}
                  fill="currentColor"
                  className="items-center flex"
                />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
