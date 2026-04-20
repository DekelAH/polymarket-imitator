"use client";

import { memo } from "react";
import { useAtomValue } from "jotai";
import { motion } from "framer-motion";
import { priceAtomFamily, priceMetaAtomFamily } from "@/state/atoms/prices";
import { cn } from "@/lib/utils";

type Side = "yes" | "no";

type YesNoButtonProps = {
  side: Side;
  tokenId: string;
};

function formatCents(price: number) {
  return `${Math.round(price * 100)}¢`;
}

function YesNoButtonImpl({ side, tokenId }: YesNoButtonProps) {
  const price = useAtomValue(priceAtomFamily(tokenId));
  const meta = useAtomValue(priceMetaAtomFamily(tokenId));

  const isYes = side === "yes";
  const label = isYes ? "Buy Yes" : "Buy No";

  return (
    <button
      type="button"
      data-side={side}
      data-token-id={tokenId}
      className={cn(
        "group relative flex-1 flex items-center justify-center gap-1.5",
        "h-10 rounded-lg px-3 text-sm font-semibold",
        "transition-colors outline-none",
        "focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        isYes
          ? "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500 hover:text-white focus-visible:ring-emerald-500"
          : "bg-rose-500/15 text-rose-500 hover:bg-rose-500 hover:text-white focus-visible:ring-rose-500"
      )}
    >
      <span>{label}</span>
      <motion.span
        key={meta.ts}
        animate={{
          backgroundColor: [
            meta.direction === "up"
              ? "rgba(22,163,74,0.35)"
              : meta.direction === "down"
              ? "rgba(220,38,38,0.35)"
              : "rgba(0,0,0,0)",
            "rgba(0,0,0,0)",
          ],
        }}
        transition={{ duration: 0.6 }}
        className="rounded px-1 tabular-nums"
      >
        {formatCents(price)}
      </motion.span>
    </button>
  );
}

const YesNoButton = memo(YesNoButtonImpl);

type YesNoButtonsProps = {
  yesTokenId: string;
  noTokenId: string;
};

function YesNoButtonsImpl({ yesTokenId, noTokenId }: YesNoButtonsProps) {
  return (
    <div className="flex items-stretch gap-2">
      <YesNoButton side="yes" tokenId={yesTokenId} />
      <YesNoButton side="no" tokenId={noTokenId} />
    </div>
  );
}

export const YesNoButtons = memo(YesNoButtonsImpl);
