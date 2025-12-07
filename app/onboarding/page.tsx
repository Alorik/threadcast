"use client";

import { useState } from "react";

export default function OnboardingPage() {
  const [username, setUsername] = useState<string>("");
  const [bio, setBio] = useState<string>("");

  async function submit() {
    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, bio }),
    });
    console.log(await res.json());
  }

  return (
    <div className="mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Complete your profile</h1>
      <input
        className="border p-2 w-full mb-3"
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <textarea
        className="border p-2 w-full mb-3"
        placeholder="bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />
      <button onClick={submit}>Save</button>
    </div>
  );
}
