import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { CategoryNav } from "@/components/nav/CategoryNav";
import { Logo } from "@/components/nav/Logo";
import Link from "next/link";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Polymarket",
  description: "Prediction market — trade on the outcome of real-world events.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <Providers>
          <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border">
            <div className="max-w-screen-2xl mx-auto">
              <div className="flex items-center gap-3 pt-3 pr-6 pb-2 pl-6">
                <Link
                  href="/"
                  aria-label="Polymarket"
                  className="inline-flex items-center justify-center w-[160px] h-[40px] text-white hover:opacity-80 transition-opacity"
                >
                  <Logo className="w-[160px] h-[26px]" />
                </Link>
              </div>
              <CategoryNav />
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
