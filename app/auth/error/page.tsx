"use client";

import { useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const params = useSearchParams();
  const error = params.get("error");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-red-600">Auth Error</h1>
      <p>{error ?? "Something went wrong"}</p>
    </div>
  );
}
