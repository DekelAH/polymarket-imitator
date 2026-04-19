"use client";

import { priceAtomFamily, priceMetaAtomFamily } from "@/state/atoms/prices";
import { motion } from "framer-motion";
import { useAtomValue } from "jotai";
import { memo } from "react";

type PriceCellProps = {
  tokenId: string;
  format?: "percent" | "cents";
};

function PriceCellImpl({ tokenId, format = "percent" }: PriceCellProps) {

  const price = useAtomValue(priceAtomFamily(tokenId))
  const meta = useAtomValue(priceMetaAtomFamily(tokenId))

  return <span data-token-id={tokenId} data-format={format}>
    <motion.span key={meta.ts}
      animate={{
        backgroundColor: [meta.direction === 'up' ? '#16a34a' : meta.direction === 'down' ? '#dc2626' : 'rgba(0,0,0,0)', 'rgba(0,0,0,0)']
      }}
      className="inline-block px-1.5 py-0.5 rounded-md"
      transition={{ duration: 0.6 }}>
      {Math.round(price * 100)}{format === 'percent' ? '%' : '¢'}
    </motion.span>
  </span>;
}

export const PriceCell = memo(PriceCellImpl);
