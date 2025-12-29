"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ErrorContent() {
  const params = useSearchParams();
  const error = params.get("error");
  console.log(error);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-red-600">Auth Error</h1>
      <p>{error ?? "Something went wrong"}</p>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <h1 className="text-2xl font-bold text-red-600">Auth Error</h1>
          <p>Loading...</p>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
