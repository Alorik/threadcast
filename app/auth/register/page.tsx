"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !username || !password) {
      setError("Please fill in all fields");
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

      setSuccess("Account created successfully!");

      // Redirect after a short delay so user sees success message
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 text-white selection:bg-white/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Enter your details below to get started
          </p>
        </div>
        <form onSubmit={handleRegister} className="space-y-5">
          {/* Username Input */}
          <div className="relative group">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <User className="h-5 w-5 text-zinc-500 transition-colors group-focus-within:text-white" />
            </div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
              className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 pl-10 pr-3 text-sm placeholder:text-zinc-600 focus:border-white/20 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
            />
          </div>
          {/* Email Input */}
          <div className="relative group">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-5 w-5 text-zinc-500 transition-colors group-focus-within:text-white" />
            </div>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 pl-10 pr-3 text-sm placeholder:text-zinc-600 focus:border-white/20 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
            />
          </div>
          <div className="relative group">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-5 w-5 text-zinc-500 transition-colors group-focus-within:text-white" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 pl-10 pr-10 text-sm placeholder:text-zinc-600 focus:border-white/20 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-white transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Feedback Messages (Error / Success) */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 text-center font-medium border border-red-500/20"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-400 font-medium border border-green-500/20"
              >
                <CheckCircle2 className="h-4 w-4" />
                {success}
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading || !!success}
            type="submit"
            className="group relative flex w-full items-center justify-center rounded-xl bg-white py-3 text-sm font-semibold text-black transition-all hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                Create Account
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </motion.button>
        </form>
        <div className="text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/auth/login")}
            className="font-medium text-white hover:underline transition-all"
          >
            Log in
          </button>
        </div>
      </motion.div>
    </div>
  );
}