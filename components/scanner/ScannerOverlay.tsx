"use client";
import { useEffect, useReducer, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AnatomicalSilhouette, ORGANS, type OrganId } from "./AnatomicalSilhouette";
import type { Particle } from "./ScanParticles";

const STATUS_MESSAGES = [
  "Analyse du profil…",
  "Identification des carences…",
  "Calcul des dosages personnalisés…",
  "Comparaison des formes moléculaires…",
  "Calibration du protocole…",
  "Génération des recommandations…",
  "Organisation du planning journée…",
  "Finalisation…",
];

const SCAN_PERIOD_MS = 2400;
const ORGAN_ORDER: OrganId[] = ["brain", "shoulders", "thyroid", "heart", "liver", "gut", "knees"];
const ESTIMATED_SECONDS = 55;

type State = {
  scannedOrgans: OrganId[];
  particles: Particle[];
  statusIndex: number;
  reducedMotion: boolean;
};

type Action =
  | { type: "organ"; id: OrganId; particles: Particle[] }
  | { type: "statusNext" }
  | { type: "reducedMotion"; value: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "organ":
      return {
        ...state,
        scannedOrgans: state.scannedOrgans.includes(action.id)
          ? state.scannedOrgans
          : [...state.scannedOrgans, action.id],
        particles: [...state.particles, ...action.particles].slice(-30),
      };
    case "statusNext":
      return {
        ...state,
        statusIndex: Math.min(state.statusIndex + 1, STATUS_MESSAGES.length - 1),
      };
    case "reducedMotion":
      return { ...state, reducedMotion: action.value };
  }
}

/** Progress curve calibrated for ~55s generation. Reaches 95% around 50s. */
function fakeProgress(elapsedSec: number): number {
  return Math.min(0.95, 1 - Math.exp(-elapsedSec / 18));
}

export function ScannerOverlay({ open }: { open: boolean }) {
  const [state, dispatch] = useReducer(reducer, {
    scannedOrgans: [],
    particles: [],
    statusIndex: 0,
    reducedMotion: false,
  });

  const [elapsedSec, setElapsedSec] = useState(0);
  const startRef = useRef<number>(0);
  const lastOrganIdx = useRef<number>(-1);

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => dispatch({ type: "reducedMotion", value: mq.matches });
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Elapsed time counter (1s interval — minimal re-renders)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on close
    if (!open) { setElapsedSec(0); return; }
    startRef.current = Date.now();
    const id = setInterval(() => {
       
      setElapsedSec(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [open]);

  // Status text cycle (2s interval)
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => dispatch({ type: "statusNext" }), 6000);
    return () => clearInterval(id);
  }, [open]);

  // Organ triggers based on timing (200ms interval, lightweight)
  useEffect(() => {
    if (!open || state.reducedMotion) return;
    const animStart = performance.now();
    lastOrganIdx.current = -1;

    const id = setInterval(() => {
      const elapsed = (performance.now() - animStart) % SCAN_PERIOD_MS;
      const scanYPct = elapsed / SCAN_PERIOD_MS; // 0 → 1
      const scanYCoord = scanYPct * 440; // viewBox height

      // Find organs the scan line has passed
      for (let i = 0; i < ORGAN_ORDER.length; i++) {
        const organId = ORGAN_ORDER[i];
        const organ = ORGANS[organId];
        if (scanYCoord > organ.cy && i > lastOrganIdx.current) {
          lastOrganIdx.current = i;
          const particles: Particle[] = Array.from({ length: 3 }).map((_, j) => ({
            id: `${organId}-${Date.now()}-${j}`,
            x: organ.cx + (Math.random() * 16 - 8),
            y: organ.cy + (Math.random() * 16 - 8),
          }));
          dispatch({ type: "organ", id: organId, particles });
        }
      }
      // Reset when scan restarts
      if (scanYCoord < 20) lastOrganIdx.current = -1;
    }, 200);

    return () => clearInterval(id);
  }, [open, state.reducedMotion]);

  if (!open) return null;

  const progress = fakeProgress(elapsedSec);
  const remaining = Math.max(0, ESTIMATED_SECONDS - elapsedSec);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bs-dark-bg"
    >
      {/* Grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "3px 3px",
        }}
      />

      {/* Body silhouette — memoized, CSS-animated scan line, no per-frame re-render */}
      <div className="relative h-[55vh] w-[30vh] max-w-[280px] text-bs-scan-line">
        <AnatomicalSilhouette
          scanning={!state.reducedMotion}
          scannedOrgans={state.scannedOrgans}
          particles={state.particles}
        />
      </div>

      {/* Status text */}
      <p className="mt-6 text-base font-semibold uppercase tracking-[0.25em] text-bs-scan-line md:text-lg">
        {STATUS_MESSAGES[state.statusIndex]}
      </p>

      {/* Time info */}
      <p className="mt-2 font-mono text-xs text-bs-scan-line/50">
        {remaining > 0
          ? `~${remaining}s restantes`
          : "Presque terminé…"}
      </p>

      {/* Progress bar */}
      <div className="mt-6 w-64 md:w-80">
        <div className="h-1.5 overflow-hidden rounded-full bg-bs-scan-line/10">
          <div
            className="h-full rounded-full bg-bs-scan-line/60 transition-all duration-1000 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {state.reducedMotion && (
        <p className="mt-4 max-w-xs text-center text-sm text-bs-scan-line/70">
          Analyse en cours. Merci de patienter.
        </p>
      )}
    </motion.div>
  );
}
