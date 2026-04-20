"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const CATEGORIES = [
  { label: "All",      href: "/" },
  { label: "Politics", href: "/politics" },
  { label: "Sports",   href: "/sports" },
  { label: "Crypto",   href: "/crypto" },
] as const;

export function CategoryNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 py-3 overflow-x-auto">
      {CATEGORIES.map(({ label, href }) => {
        const active = pathname === href;
        return (
          <Link
            key={label}
            href={href}
            className={[
              "px-4 py-1.5 text-sm font-medium transition-colors outline-none",
              active
                ? "text-foreground"
                : "text-[#7B8996] hover:text-foreground",
            ].join(" ")}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
