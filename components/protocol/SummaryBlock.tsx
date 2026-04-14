import ReactMarkdown from "react-markdown";

export function SummaryBlock({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-bs-primary/10 bg-bs-bg p-8 text-bs-text">
      <div className="prose prose-sm max-w-none prose-headings:font-display prose-headings:uppercase prose-headings:tracking-tight prose-a:text-bs-primary">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    </div>
  );
}
