"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ImagePreviewModel from "./image-preview-model";
import { Download, Trash2 } from "lucide-react";

interface ImageMessageProps {
  src: string;
  isOwn?: boolean;
  alt: string;
  messageId?: string;
}

export default function ImageMessage({
  src,
  alt = "sent image",
  isOwn,
  messageId,
}: ImageMessageProps) {
  const [loaded, setLoaded] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  };

  //mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    longPressTimer.current = setTimeout(() => {
      setMenuPos({ x: touch.clientX, y: touch.clientY });
      setMenuOpen(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleDownload = () => {
    window.open(src, "_blank");
    setMenuOpen(false);
  };

  const handleDelete = async () => {
    if (!messageId) {
      console.error("No messageId provided");
      setMenuOpen(false);
      return;
    }

    console.log("🗑️ Deleting message with ID:", messageId);
    setMenuOpen(false);

    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Delete failed with status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Delete API response:", result);
    } catch (error) {
      console.error("❌ Error deleting image:", error);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  return (
    <>
      <div
        className="relative w-full max-w-[280px] aspect-auto cursor-zoom-in group"
        onClick={() => setPreviewOpen(true)}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {!loaded && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse" />
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition rounded-xl" />

        <Image
          src={src}
          alt={alt}
          height={280}
          blurDataURL="/image-blur.png"
          width={280}
          onLoad={() => setLoaded(true)}
          className={`w-full rounded-xl object-cover transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      {/* Context Menu */}
      {menuOpen && menuPos && (
        <div
          ref={menuRef}
          style={{ top: menuPos.y, left: menuPos.x }}
          className="fixed z-[1000] bg-[#1f2230] border border-white/10 rounded-xl shadow-xl w-44 overflow-hidden"
        >
          <button
            onClick={handleDownload}
            className="w-full px-4 py-3 text-left text-sm hover:bg-white/10 flex items-center gap-3 text-white transition-colors"
          >
            <Download size={16} />
            <span>Download</span>
          </button>
          {isOwn && (
            <button
              onClick={handleDelete}
              className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          )}
        </div>
      )}

      {/* Fullscreen Preview */}
      {previewOpen && (
        <ImagePreviewModel src={src} onClose={() => setPreviewOpen(false)} />
      )}
    </>
  );
}
