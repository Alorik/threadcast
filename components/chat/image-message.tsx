"use client";

import Image from "next/image";
import { useState } from "react";
import ImagePreviewModel from "./image-preview-model";

export default function ImageMessage({ src, alt = "sent image" }) {
  const [loaded, setloaded] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="relative w-full max-w-[280px] aspect-auto cursor-zoom-in group"
        onClick={() => setOpen(true)}
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
          onLoad={() => setloaded(true)}
          className={`w-full rounded-xl object-cover transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      {open && <ImagePreviewModel src={src} onClose={() => setOpen(false)} />}
    </>
  );
}
