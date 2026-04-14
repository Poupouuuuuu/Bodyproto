"use client";
import { useEffect, useReducer, useRef } from "react";
import { motion } from "framer-motion";
import { AnatomicalSilhouette, ORGANS, type OrganId } from "./AnatomicalSilhouette";
import type { Particle } from "./ScanParticles";

const STATUS_MESSAGES = [
  "Analyse du profil…",
  "Identification des carences…",
  "Calibration du protocole…",
  "Finalisation…",
];

const SCAN_PERIOD_MS = 2200;
const ORGAN_ORDER: OrganId[] = ["brain", "shoulders", "thyroid", "heart", "liver", "gut", "knees"];

type State = {
  scanYPct: number;
  scannedOrgans: OrganId[];
  particles: Particle[];
  statusIndex: number;
  reducedMotion: boolean;
};

type Action =
  | { type: "tick"; scanYPct: number }
  | { type: "organ"; id: OrganId; particles: Particle[] }
  | { type: "status"; index: number }
  | { type: "reducedMotion"; value: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "tick":
      return { ...state, scanYPct: action.scanYPct };
    case "organ":
      return {
        ...state,
        scannedOrgans: state.scannedOrgans.includes(action.id)
          ? state.scannedOrgans
          : [...state.scannedOrgans, action.id],
        particles: [...state.particles, ...action.particles].slice(-40),
      };
    case "status":
      return { ...state, statusIndex: action.index };
    case "reducedMotion":
      return { ...state, reducedMotion: action.value };
  }
}

export function ScannerOverlay({ open }: { open: boolean }) {
  const [state, dispatch] = useReducer(reducer, {
    scanYPct: 0,
    scannedOrgans: [],
    particles: [],
    statusIndex: 0,
    reducedMotion: false,
  });

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const lastOrganTriggeredY = useRef<number>(-1);

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => dispatch({ type: "reducedMotion", value: mq.matches });
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Status text cycle
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => {
      dispatch({ type: "status", index: Math.min(state.statusIndex + 1, STATUS_MESSAGES.length - 1) });
    }, 2000);
    return () => clearInterval(id);
  }, [open, state.statusIndex]);

  // Main scan animation (RAF)
  useEffect(() => {
    if (!open || state.reducedMotion) return;
    startRef.current = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - startRef.current) % SCAN_PERIOD_MS;
      const progress = elapsed / SCAN_PERIOD_MS; // 0 → 1
      const y = progress * 100;

      // Trigger organ pulse when scan line crosses an organ
      for (const id of ORGAN_ORDER) {
        const organ = ORGANS[id];
        const organYPct = (organ.cy / 400) * 100;
        if (y > organYPct && lastOrganTriggeredY.current < organYPct) {
          lastOrganTriggeredY.current = organYPct;
          const particles: Particle[] = Array.from({ length: 4 }).map((_, i) => ({
            id: `${id}-${Date.now()}-${i}`,
            x: organ.cx + (Math.random() * 20 - 10),
            y: organ.cy + (Math.random() * 20 - 10),
          }));
          dispatch({ type: "organ", id, particles });
        }
      }
      if (y < lastOrganTriggeredY.current) lastOrganTriggeredY.current = -1;

      dispatch({ type: "tick", scanYPct: y });
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [open, state.reducedMotion]);

  if (!open) return null;

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bs-dark-bg"
    >
      {/* Grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "3px 3px",
        }}
      />

      <div className="relative h-[70vh] w-[40vh] max-w-[320px] text-bs-scan-line">
        {state.reducedMotion ? (
          <AnatomicalSilhouette />
        ) : (
          <AnatomicalSilhouette
            scanY={state.scanYPct}
            scannedOrgans={state.scannedOrgans}
            particles={state.particles}
          />
        )}
      </div>

      <p className="mt-8 text-lg font-semibold uppercase tracking-[0.3em] text-bs-scan-line">
        {STATUS_MESSAGES[state.statusIndex]}
      </p>

      {state.reducedMotion && (
        <p className="mt-3 max-w-xs text-center text-sm text-bs-scan-line/70">
          Analyse en cours. Merci de patienter.
        </p>
      )}
    </motion.div>
  );
}
