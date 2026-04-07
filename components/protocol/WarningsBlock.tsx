export function WarningsBlock({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
      <h3 className="mb-2 font-semibold">⚠️ Avertissements</h3>
      <ul className="list-disc space-y-1 pl-5 text-sm text-amber-900">
        {warnings.map((w, i) => (
          <li key={i}>{w}</li>
        ))}
      </ul>
    </div>
  );
}
