"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import Image from "next/image";

interface ImagePreviewModalProps {
  src: string;
  onClose: () => void;
}

export default function ImagePreviewModel({
  src,
  onClose,
}: ImagePreviewModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
      >
        <X className="text-white" />
      </button>

      <Image
        src={src}
        alt="previe"
        height={280}
        width={280}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain animate-zoomIn"
      />
    </div>
  );
}
