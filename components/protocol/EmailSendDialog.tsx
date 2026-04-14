"use client";
import { useState } from "react";
import { toast } from "sonner";
import { BrandButton } from "@/components/ui/brand-button";
import { X } from "@phosphor-icons/react/dist/ssr";

type Props = {
  open: boolean;
  onClose: () => void;
  consultationId: string;
  defaultEmail: string;
  emailSentAt: Date | null;
};

export function EmailSendDialog({ open, onClose, consultationId, defaultEmail, emailSentAt }: Props) {
  const [email, setEmail] = useState(defaultEmail);
  const [sending, setSending] = useState(false);

  if (!open) return null;

  async function submit() {
    if (!email) return;
    setSending(true);
    try {
      const res = await fetch(`/api/send-protocol-email/${consultationId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ toEmail: email }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      toast.success("Email envoyé");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Envoi échoué");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-center justify-center bg-bs-primary/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-bs-primary/10 bg-bs-surface p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-bs-accent">
              Envoi email
            </p>
            <h2 className="font-display text-2xl font-black uppercase tracking-tight text-bs-primary">
              Envoyer le protocole
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-bs-muted hover:bg-bs-primary/5"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <label className="mb-6 block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-bs-muted">
            Email du client
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="prenom@exemple.fr"
            className="w-full rounded-full border border-bs-primary/15 bg-bs-bg px-5 py-3 text-bs-text focus:border-bs-accent focus:outline-none focus:ring-2 focus:ring-bs-accent/40"
          />
        </label>

        <p className="mb-6 text-sm text-bs-muted">
          Le protocole sera envoyé avec le PDF en pièce jointe et un lien durable vers la version en ligne.
        </p>

        {emailSentAt && (
          <p className="mb-4 rounded-full bg-bs-accent/15 px-4 py-2 text-xs text-bs-primary">
            Déjà envoyé le {emailSentAt.toLocaleDateString("fr-FR")}
          </p>
        )}

        <div className="flex gap-3">
          <BrandButton variant="ghost" onClick={onClose} size="sm">
            Annuler
          </BrandButton>
          <BrandButton onClick={submit} disabled={sending || !email} size="sm">
            {sending ? "Envoi…" : "Envoyer"}
          </BrandButton>
        </div>
      </div>
    </div>
  );
}
