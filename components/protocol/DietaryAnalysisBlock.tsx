import ReactMarkdown from "react-markdown";

type Analysis = {
  description?: string;
  narrative?: string;
};

export function DietaryAnalysisBlock({ analysis, analysedAt }: { analysis: Analysis | null; analysedAt?: number }) {
  if (!analysis || (!analysis.narrative && !analysis.description)) return null;
  return (
    <section className="rounded-3xl border border-bs-accent/30 bg-bs-accent/5 p-8">
      <header className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-2xl font-black uppercase tracking-tight text-bs-primary">
          Analyse alimentaire
        </h2>
        {analysedAt && (
          <span className="rounded-full border border-bs-accent/40 px-3 py-1 text-xs font-medium text-bs-primary">
            Analysé le {new Date(analysedAt * 1000).toLocaleDateString("fr-FR")}
          </span>
        )}
      </header>
      <div className="prose prose-sm max-w-none text-bs-text">
        {analysis.narrative && <ReactMarkdown>{analysis.narrative}</ReactMarkdown>}
      </div>
    </section>
  );
}
