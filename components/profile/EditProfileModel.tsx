"use client";

import { useState } from "react";

export default function EditProfileModel({
  initialName,
  initialBio,
  initialLocation,
  onClose,
}: {
  initialName: string;
  initialBio: string;
  initialLocation: string;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialName || "");
  const [bio, setBio] = useState(initialBio || "");
  const [location, setLocation] = useState(initialLocation || "");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);

    await fetch("/api/users/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bio, location }),
    });

    setLoading(false);
    onClose();
  }

  return (
    <div>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Edit Profile</h2>

          <input
            value={name}
            placeholder="name"
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white"
          />
          <input
            value={bio}
            placeholder="bio"
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white"
          />
          <input
            value={location}
            placeholder="location"
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="text-neutral-400">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-white text-black px-4 py-2 rounded-lg font-semibold"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
