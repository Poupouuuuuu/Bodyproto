"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { BrandButton } from "@/components/ui/brand-button";
import { STEPS } from "@/lib/wizard/steps";
import { clientProfileSchema, type ClientProfile } from "@/lib/schemas/clientProfile";
import { StepProgress } from "./StepProgress";
import { Section0Client } from "./Section0Client";
import { Section1Basics } from "./Section1Basics";
import { Section2Goals } from "./Section2Goals";
import { Section3Lifestyle } from "./Section3Lifestyle";
import { Section4Nutrition } from "./Section4Nutrition";
import { Section5Health } from "./Section5Health";
import { Section6Supplements } from "./Section6Supplements";
import { SectionReview } from "./SectionReview";
import { ScannerOverlay } from "@/components/scanner/ScannerOverlay";

const sectionFieldGroups: Record<number, FieldPath<ClientProfile>[]> = {
  0: ["client"],
  1: ["basics"],
  2: ["goals"],
  3: ["lifestyle"],
  4: ["nutrition"],
  5: ["health"],
  6: ["supplements"],
};

export function WizardShell() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ClientProfile>({
    resolver: zodResolver(clientProfileSchema),
    mode: "onBlur",
    defaultValues: {
      client: {
        firstName: "",
        lastName: "",
        email: "",
        phone: null,
        consultationDate: new Date().toISOString().slice(0, 10),
        consentGiven: false,
      },
      basics: { age: 30, sex: "male", weightKg: 70, heightCm: 175, country: "France" },
      goals: { priorities: [] },
      lifestyle: {
        activityLevel: "moderate",
        sportTypes: [],
        sleepQuality: 7,
        sleepHours: 7,
        stressLevel: 5,
        sunExposureMinutes: 15,
      },
      nutrition: { diet: "omnivore", frequentFoods: [], alcoholPerWeek: 0, caffeinePerDay: 1 },
      health: { conditions: "", medications: "", bloodwork: "", allergies: "", pregnancy: false },
      supplements: { current: "", pastBadExperiences: "", budgetTier: "30-60" },
    },
  });

  async function next() {
    const fields = sectionFieldGroups[step];
    if (fields) {
      const ok = await form.trigger(fields);
      if (!ok) return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function submit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/generate-protocol", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form.getValues()),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      const { consultationId } = await res.json();
      toast.success("Protocole généré");
      router.push(`/consultation/${consultationId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormProvider {...form}>
      <div className="mx-auto max-w-2xl">
        <StepProgress currentIndex={step} />
        <div className="rounded-3xl border border-bs-primary/10 bg-bs-surface p-8 md:p-10">
          {step === 0 && <Section0Client />}
          {step === 1 && <Section1Basics />}
          {step === 2 && <Section2Goals />}
          {step === 3 && <Section3Lifestyle />}
          {step === 4 && <Section4Nutrition />}
          {step === 5 && <Section5Health />}
          {step === 6 && <Section6Supplements />}
          {step === 7 && <SectionReview />}
        </div>
        <div className="mt-6 flex items-center justify-between">
          <BrandButton
            variant="ghost"
            disabled={step === 0 || submitting}
            onClick={() => setStep((s) => s - 1)}
            size="sm"
          >
            ← Précédent
          </BrandButton>
          {step < STEPS.length - 1 ? (
            <BrandButton onClick={next} size="md">Suivant →</BrandButton>
          ) : (
            <BrandButton onClick={submit} disabled={submitting} size="lg">
              {submitting ? "Lancer l'analyse…" : "Générer le protocole"}
            </BrandButton>
          )}
        </div>
      </div>
      <ScannerOverlay open={submitting} />
    </FormProvider>
  );
}
