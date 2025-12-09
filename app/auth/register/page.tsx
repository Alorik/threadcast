"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email || !username || !password) {
      setError("please filll the credentials");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Registration failed");
        setLoading(false);
        return;
      }
      setSuccess("Account created — signing you in...");

      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError("Unknown error during registration.");
    } finally {
      setLoading(false); // ← Always reset loading
    }
  }
  return (
    <div className="max-w-7xl flex items-center gap-4 p-4">
      <form
        className="w-full max-w-md border rounded p-6 space-y-4"
        onSubmit={handleRegister}
      >
        <h1 className="text-xl">Register User</h1>
        {error && <div className="text-red-500 text-lg">{error}</div>}
        {success && <div className="text-green-600 text-lg">{success}</div>}

        <div>
          <label className="text-sm block mb-1">Email</label>
          <input
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value.trim())}
            className="w-full border px-2 py-1 rounded"
            required
          />

          <label className="text-sm block mb-1">Username</label>
          <input
            value={username}
            type="username"
            onChange={(e) => setUsername(e.target.value.trim())}
            className="w-full border px-2 py-1 rounded"
            required
          />

          <label className="text-sm block mb-1">Password</label>
          <input
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-2 py-1 rounded"
            required
          />
        </div>

        <div className="flex gap-3 items-center">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            {loading ? "Creating...." : "Create Account"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="px-3 py-2 text-sm"
          >
            Already have an account?
          </button>
        </div>
      </form>
    </div>
  );
}
