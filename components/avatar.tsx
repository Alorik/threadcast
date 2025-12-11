"use client";

import { useState } from "react";

export default function UploadAvatar({
  onUploaded,
}: {
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    // Upload to Cloudinary
    const form = new FormData();
    form.append("file", file);

    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    const { url } = await uploadRes.json();

    // Save URL to DB
    await fetch("/api/me/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: url }),
    });

    // 🔥 RETURN new avatar URL to parent
    onUploaded(url);

    setUploading(false);
  }

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        id="avatar-file-input"
      />

      {uploading && <p className="text-gray-500 text-sm">Uploading...</p>}
    </div>
  );
}
