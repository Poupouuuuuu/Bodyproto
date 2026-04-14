"use client";
import { ScanParticles, type Particle } from "./ScanParticles";

export type OrganId = "brain" | "thyroid" | "heart" | "liver" | "gut" | "shoulders" | "knees";

type SilhouetteProps = {
  /** Y coordinate (0-100) où la ligne de scan se trouve ; si undefined, pas de scan */
  scanY?: number;
  /** Organes qui ont déjà été "scannés" — pulsent et laissent des particules */
  scannedOrgans?: OrganId[];
  particles?: Particle[];
};

// Coordonnées anatomiques approximatives (dans un viewBox 200x400)
export const ORGANS: Record<OrganId, { cx: number; cy: number; r: number; label: string }> = {
  brain:     { cx: 100, cy: 30,  r: 18, label: "Cerveau" },
  thyroid:   { cx: 100, cy: 75,  r: 6,  label: "Thyroïde" },
  heart:     { cx: 92,  cy: 120, r: 10, label: "Cœur" },
  liver:     { cx: 115, cy: 150, r: 14, label: "Foie" },
  gut:       { cx: 100, cy: 195, r: 16, label: "Intestin" },
  shoulders: { cx: 100, cy: 90,  r: 4,  label: "Épaules" },
  knees:     { cx: 100, cy: 310, r: 6,  label: "Genoux" },
};

export function AnatomicalSilhouette({ scanY, scannedOrgans = [], particles = [] }: SilhouetteProps) {
  return (
    <svg
      viewBox="0 0 200 400"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      aria-hidden
    >
      {/* Contour corps stylisé — tête + torse + bras + jambes */}
      <g stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.85">
        {/* Tête */}
        <ellipse cx="100" cy="30" rx="22" ry="26" />
        {/* Cou */}
        <path d="M 88 55 L 88 68 Q 100 72 112 68 L 112 55" />
        {/* Torse */}
        <path d="M 65 70 Q 70 95 65 175 Q 80 185 100 185 Q 120 185 135 175 Q 130 95 135 70 Q 118 65 100 65 Q 82 65 65 70 Z" />
        {/* Bras gauche */}
        <path d="M 65 75 Q 45 110 42 160 Q 40 180 45 200" />
        {/* Bras droit */}
        <path d="M 135 75 Q 155 110 158 160 Q 160 180 155 200" />
        {/* Jambes */}
        <path d="M 80 185 Q 75 240 80 310 Q 82 350 85 390" />
        <path d="M 120 185 Q 125 240 120 310 Q 118 350 115 390" />
      </g>

      {/* Organes (glyphes translucides) */}
      <g>
        {Object.entries(ORGANS).map(([id, { cx, cy, r }]) => {
          const scanned = scannedOrgans.includes(id as OrganId);
          return (
            <circle
              key={id}
              cx={cx}
              cy={cy}
              r={r}
              fill="currentColor"
              opacity={scanned ? 0.55 : 0.15}
              className="transition-opacity duration-300"
            />
          );
        })}
      </g>

      {/* Ligne de scan */}
      {scanY !== undefined && (
        <g>
          <line
            x1={30}
            x2={170}
            y1={(scanY / 100) * 400}
            y2={(scanY / 100) * 400}
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.9"
            style={{ filter: "drop-shadow(0 0 8px currentColor)" }}
          />
          <rect
            x={30}
            y={(scanY / 100) * 400 - 1}
            width={140}
            height={2}
            fill="url(#scan-gradient)"
          />
          <defs>
            <linearGradient id="scan-gradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
              <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
        </g>
      )}

      <ScanParticles particles={particles} />
    </svg>
  );
}
