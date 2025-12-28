"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      // Check session for username to determine redirection
      const response = await fetch("/api/auth/session");
      const session = await response.json();

      if (session?.user?.username) {
        router.push("/feed");
      } else {
        router.push("/onboarding");
      }
    } catch (err) {
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
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Sign in to your account to continue
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            {/* Email Input */}
            <div className="relative group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-zinc-500 transition-colors group-focus-within:text-white" />
              </div>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 pl-10 pr-3 text-sm placeholder:text-zinc-600 focus:border-white/20 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-zinc-500 transition-colors group-focus-within:text-white" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
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
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-red-400 text-center font-medium"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="group relative flex w-full items-center justify-center rounded-xl bg-white py-3 text-sm font-semibold text-black transition-all hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                Sign in
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </motion.button>
        </form>

        <div className="text-center text-sm text-zinc-500">
          Don&apos;t have an account?{" "}
          <button
onClick={()=>router.push("/auth/register")}
            className="font-medium text-white hover:underline"
          >
            Create one
          </button>
        </div>
      </motion.div>
    </div>
  );
}
