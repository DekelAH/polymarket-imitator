"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { useAtomValue } from "jotai";
import { priceAtomFamily } from "@/state/atoms/prices";

type ProbabilityBarProps = {
  tokenId: string;
};

function ProbabilityBarImpl({ tokenId }: ProbabilityBarProps) {
  const price = useAtomValue(priceAtomFamily(tokenId));
  const pct = `${(price * 100).toFixed(1)}%`;
  const color = price >= 0.5 ? "#16a34a" : "#2563eb";

  return (
    <div className="relative h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ backgroundColor: color }}
        animate={{ width: pct }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </div>
  );
}

export const ProbabilityBar = memo(ProbabilityBarImpl);
