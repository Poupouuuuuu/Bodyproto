"use client";
import React from "react";
import { ScanParticles, type Particle } from "./ScanParticles";

export type OrganId = "brain" | "thyroid" | "heart" | "liver" | "gut" | "shoulders" | "knees";

type SilhouetteProps = {
  /** Show the animated scan line (CSS-driven, no React state) */
  scanning?: boolean;
  /** Organs that have been "scanned" — pulse brighter */
  scannedOrgans?: OrganId[];
  particles?: Particle[];
};

// Anatomical coordinates (viewBox 200×440)
export const ORGANS: Record<OrganId, { cx: number; cy: number; r: number; label: string }> = {
  brain:     { cx: 100, cy: 35,  r: 16, label: "Cerveau" },
  thyroid:   { cx: 100, cy: 82,  r: 5,  label: "Thyroïde" },
  heart:     { cx: 90,  cy: 125, r: 10, label: "Cœur" },
  liver:     { cx: 118, cy: 155, r: 12, label: "Foie" },
  gut:       { cx: 100, cy: 200, r: 14, label: "Intestin" },
  shoulders: { cx: 100, cy: 95,  r: 4,  label: "Épaules" },
  knees:     { cx: 100, cy: 330, r: 6,  label: "Genoux" },
};

function SilhouetteInner({ scanning = false, scannedOrgans = [], particles = [] }: SilhouetteProps) {
  return (
    <svg
      viewBox="0 0 200 440"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="scan-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="30%" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="70%" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        <filter id="scan-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="organ-glow">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Improved body outline */}
      <g stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.7" strokeLinecap="round" strokeLinejoin="round">
        {/* Head */}
        <ellipse cx="100" cy="35" rx="20" ry="24" />
        {/* Neck */}
        <path d="M 90 58 L 90 72 Q 100 76 110 72 L 110 58" />
        {/* Shoulders */}
        <path d="M 90 76 Q 80 78 62 80" />
        <path d="M 110 76 Q 120 78 138 80" />
        {/* Torso */}
        <path d="M 62 80 Q 60 100 62 130 Q 63 160 68 180 Q 78 198 100 200 Q 122 198 132 180 Q 137 160 138 130 Q 140 100 138 80" />
        {/* Ribcage hints */}
        <path d="M 72 105 Q 85 112 100 113 Q 115 112 128 105" opacity="0.3" />
        <path d="M 70 120 Q 84 128 100 129 Q 116 128 130 120" opacity="0.25" />
        {/* Center line (sternum) */}
        <line x1="100" y1="78" x2="100" y2="195" opacity="0.15" />
        {/* Pelvis */}
        <path d="M 72 195 Q 80 210 100 212 Q 120 210 128 195" opacity="0.4" />
        {/* Left arm */}
        <path d="M 62 82 Q 48 110 44 150 Q 42 175 44 200 Q 45 210 48 218" />
        {/* Left hand */}
        <path d="M 48 218 Q 46 224 44 228" opacity="0.5" />
        {/* Right arm */}
        <path d="M 138 82 Q 152 110 156 150 Q 158 175 156 200 Q 155 210 152 218" />
        {/* Right hand */}
        <path d="M 152 218 Q 154 224 156 228" opacity="0.5" />
        {/* Left leg */}
        <path d="M 82 200 Q 78 250 80 310 Q 82 355 84 400 Q 85 420 86 432" />
        {/* Left foot */}
        <path d="M 86 432 Q 82 436 78 436" opacity="0.5" />
        {/* Right leg */}
        <path d="M 118 200 Q 122 250 120 310 Q 118 355 116 400 Q 115 420 114 432" />
        {/* Right foot */}
        <path d="M 114 432 Q 118 436 122 436" opacity="0.5" />
      </g>

      {/* Organ glyphs */}
      <g>
        {Object.entries(ORGANS).map(([id, { cx, cy, r }]) => {
          const scanned = scannedOrgans.includes(id as OrganId);
          return (
            <React.Fragment key={id}>
              {/* Outer glow when scanned */}
              {scanned && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={r + 4}
                  fill="currentColor"
                  opacity="0.12"
                  filter="url(#organ-glow)"
                />
              )}
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="currentColor"
                opacity={scanned ? 0.5 : 0.12}
                className="transition-opacity duration-500"
              />
            </React.Fragment>
          );
        })}
      </g>

      {/* Scan line — pure CSS animation, no React state */}
      {scanning && (
        <g
          className="scan-line-anim"
          style={{ willChange: "transform" }}
          filter="url(#scan-glow)"
        >
          <rect
            x={20}
            y={-1}
            width={160}
            height={2}
            fill="url(#scan-grad)"
          />
          <line
            x1={20}
            x2={180}
            y1={0}
            y2={0}
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.7"
          />
        </g>
      )}

      <ScanParticles particles={particles} />

      <style>{`
        .scan-line-anim {
          animation: scan-sweep 2.4s ease-in-out infinite;
        }
        @keyframes scan-sweep {
          0% { transform: translateY(0px); }
          100% { transform: translateY(440px); }
        }
      `}</style>
    </svg>
  );
}

export const AnatomicalSilhouette = React.memo(SilhouetteInner);
