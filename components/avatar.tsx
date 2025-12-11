"use client";

import { useState } from "react";

export default function UploadAvatar() {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const form = new FormData();
    form.append("file", file);

    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    const { url } = await uploadRes.json();
    setAvatar(url);

    await fetch("/api/me/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: url }),
    });

    setUploading(false);
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm">Upload Avatar</label>
        <input
          type="file"
          accept="image/*"
          className="mt-1"
          onChange={handleFileUpload}
        />
      </div>

      {uploading && <p className="text-gray-500 text-sm">Uploading...</p>}

      {avatar && (
        <img
          src={avatar}
          alt="avatar preview"
          className="w-24 h-24 rounded-full border"
        />
      )}
    </div>
  );
}
