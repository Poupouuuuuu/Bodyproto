import ReactMarkdown from "react-markdown";

export function SummaryBlock({ text }: { text: string }) {
  return (
    <div className="prose prose-slate max-w-none rounded-lg border bg-white p-6">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}
