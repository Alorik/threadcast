// components/avatar.tsx
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

    try {
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

      // Return new avatar URL to parent
      onUploaded(url);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  }

  function triggerFileInput() {
    document.getElementById("avatar-file-input")?.click();
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

      <button
        onClick={triggerFileInput}
        disabled={uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {uploading ? "Uploading..." : "Choose Avatar"}
      </button>

      {uploading && <p className="text-gray-500 text-sm">Uploading...</p>}
    </div>
  );
}
