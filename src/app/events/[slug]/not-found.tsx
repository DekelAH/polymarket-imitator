import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
      <p className="text-4xl font-bold text-muted-foreground">404</p>
      <p className="text-sm text-muted-foreground">This event doesn&apos;t exist or has been removed.</p>
      <Link href="/" className="text-sm text-primary hover:underline">
        ← Back to markets
      </Link>
    </div>
  );
}
