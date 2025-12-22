"use client";

import Image from "next/image";
import { useState } from "react";

export default function ImageMessage({ src, alt }) {
  const [loaded, setloaded] = useState(false);

  return (
    <div className="relative w-full max-w-[280px]">
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
          loaded ? "opacity-100" : "opacity: 0"
        }`}
      />
    </div>
  );
}
