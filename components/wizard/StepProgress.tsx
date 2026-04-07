"use client";
import { STEPS } from "@/lib/wizard/steps";

export function StepProgress({ currentIndex }: { currentIndex: number }) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex gap-1">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i <= currentIndex ? "bg-emerald-600" : "bg-slate-200"}`}
          />
        ))}
      </div>
      <p className="text-xs uppercase tracking-wide text-slate-500">
        Étape {currentIndex + 1} / {STEPS.length} — {STEPS[currentIndex].label}
      </p>
    </div>
  );
}
