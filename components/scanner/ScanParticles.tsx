"use client";
import { AnimatePresence, motion } from "framer-motion";

export type Particle = { id: string; x: number; y: number };

export function ScanParticles({ particles }: { particles: Particle[] }) {
  return (
    <AnimatePresence>
      {particles.map((p) => (
        <motion.circle
          key={p.id}
          cx={p.x}
          cy={p.y}
          r={1.5}
          fill="currentColor"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.85, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
        />
      ))}
    </AnimatePresence>
  );
}
