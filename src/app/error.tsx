"use client";

import Link from "next/link";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
      <p className="text-sm text-muted-foreground">Something went wrong loading this page.</p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="text-sm px-4 py-1.5 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
        <Link href="/" className="text-sm px-4 py-1.5 rounded-full border border-border hover:bg-muted transition-colors">
          Go home
        </Link>
      </div>
    </div>
  );
}
