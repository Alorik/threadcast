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
        className="relative w-full max-w-[280px]"
        onClick={() => setOpen(true)}
      >
        {!loaded && (
          <div className="absolute inset-0 rounded-xl bg-white/10 animate-pulse" />
        )}

        <Image
          src={src}
          alt={alt}
          height={280}
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
