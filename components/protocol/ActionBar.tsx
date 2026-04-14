"use client";
import { BrandButton } from "@/components/ui/brand-button";
import { ChatTeardropText, Download, PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";

type Props = {
  consultationId: string;
  onEmailClick: () => void;
};

export function ActionBar({ consultationId, onEmailClick }: Props) {
  return (
    <div className="sticky bottom-4 z-20 mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-3 rounded-full border border-bs-primary/10 bg-bs-surface/95 p-3 shadow-lg backdrop-blur-md">
      <BrandButton href={`/consultation/${consultationId}/refine`} variant="secondary" size="sm">
        <ChatTeardropText size={16} /> Affiner avec l'alimentation
      </BrandButton>
      <BrandButton href={`/api/export-pdf/${consultationId}`} variant="secondary" size="sm">
        <Download size={16} /> Télécharger PDF
      </BrandButton>
      <BrandButton onClick={onEmailClick} size="sm">
        <PaperPlaneTilt size={16} /> Envoyer par email
      </BrandButton>
    </div>
  );
}
