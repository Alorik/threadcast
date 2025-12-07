"use client"
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function handleLogin() {
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    window.location.href = "/onboarding";
  }
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Login Page</h1>
      <p>NextAuth is trying to redirect you here.</p>

      <div className="flex flex-col">
        <input
          className="border p-2 w-full"
          placeholder="Email"
          value={email}
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border p-2 w-full"
          placeholder="password"
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="border px-4 py-2 w-full mt-2" onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
}
