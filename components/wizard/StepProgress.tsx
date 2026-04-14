"use client";
import { STEPS } from "@/lib/wizard/steps";

export function StepProgress({ currentIndex }: { currentIndex: number }) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex gap-1">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i <= currentIndex ? "bg-bs-primary" : "bg-bs-primary/10"}`}
          />
        ))}
      </div>
      <p className="font-display text-xs uppercase tracking-widest text-bs-muted">
        Étape {currentIndex + 1} / {STEPS.length} — {STEPS[currentIndex].label}
      </p>
    </div>
  );
}
