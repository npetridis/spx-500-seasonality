"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="error-message">
        <h2 className="text-xl font-bold mb-2">Something went wrong!</h2>
        <p className="mb-4">{error.message}</p>
        <button
          onClick={() => reset()}
          className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
