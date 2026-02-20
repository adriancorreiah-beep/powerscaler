'use client';

import { useMemo, useState } from 'react';
import { toMarkdown } from '@/exports/markdown';
import { AnalysisOutput, CATEGORIES, Category, EvidenceEntry } from '@/lib/types';

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const sampleEvidence: EvidenceEntry[] = [
  {
    id: 'E1',
    source: 'Chapter 21 panel 5',
    claim: 'Character blitzed three opponents in an instant.',
    categoryTags: ['Speed', 'Attack Potency'],
    reliability: 85
  },
  {
    id: 'E2',
    source: 'Episode 12',
    claim: 'Character fought for 8 hours without tiring.',
    categoryTags: ['Stamina'],
    reliability: 80
  }
];

export default function AnalyzerUI() {
  const [name, setName] = useState('');
  const [verse, setVerse] = useState('');
  const [notes, setNotes] = useState('');
  const [evidenceText, setEvidenceText] = useState(JSON.stringify(sampleEvidence, null, 2));
  const [result, setResult] = useState<AnalysisOutput | null>(null);
  const [error, setError] = useState('');

  const canExport = useMemo(() => Boolean(result), [result]);

  async function run() {
    setError('');
    try {
      const evidence = JSON.parse(evidenceText) as EvidenceEntry[];
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character: { name, verse, notes }, evidence })
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? 'Analysis failed');
        return;
      }
      setResult(data);
    } catch {
      setError('Invalid evidence JSON.');
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl p-8">
      <h1 className="text-3xl font-bold">PowerScale Assistant</h1>
      <p className="mt-2 text-sm text-slate-300">
        Uses only user-provided evidence. No web scraping. Deterministic local analysis.
      </p>

      <section className="mt-6 grid gap-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4 md:grid-cols-2">
        <input
          className="rounded bg-slate-800 p-2"
          placeholder="Character name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="rounded bg-slate-800 p-2"
          placeholder="Verse"
          value={verse}
          onChange={(e) => setVerse(e.target.value)}
        />
        <textarea
          className="rounded bg-slate-800 p-2 md:col-span-2"
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="md:col-span-2">
          <p className="mb-2 text-sm">Evidence JSON (array of entries)</p>
          <textarea
            className="h-56 w-full rounded bg-slate-800 p-2 font-mono text-sm"
            value={evidenceText}
            onChange={(e) => setEvidenceText(e.target.value)}
          />
        </div>
        <button className="rounded bg-indigo-500 px-4 py-2 font-semibold" onClick={run}>
          Run analysis
        </button>
        {error && <p className="self-center text-red-400">{error}</p>}
      </section>

      {result && (
        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              className="rounded bg-emerald-600 px-3 py-2 text-sm"
              onClick={() => downloadFile('analysis.json', JSON.stringify(result, null, 2), 'application/json')}
              disabled={!canExport}
            >
              Export JSON
            </button>
            <button
              className="rounded bg-teal-600 px-3 py-2 text-sm"
              onClick={() => downloadFile('analysis.md', toMarkdown(result), 'text/markdown')}
              disabled={!canExport}
            >
              Export Markdown
            </button>
          </div>

          <h2 className="text-xl font-semibold">Results</h2>
          <p className="text-sm text-slate-300">Categories: {CATEGORIES.join(', ')}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {result.assessments.map((item) => (
              <article key={item.category} className="rounded border border-slate-700 p-3">
                <h3 className="font-semibold">{item.category}</h3>
                <p>Rating: {item.rating}</p>
                <p>Confidence: {item.confidence}</p>
                <p className="text-sm text-slate-300">Rationale: {item.rationale}</p>
                <p className="text-xs">Evidence: {item.evidenceReferences.join(', ') || 'None'}</p>
                <p className="text-xs">Unknowns: {item.unknowns.join('; ') || 'None'}</p>
              </article>
            ))}
          </div>

          <h3 className="mt-6 font-semibold">Contradictions</h3>
          {!result.contradictions.length ? (
            <p className="text-sm">None detected.</p>
          ) : (
            <ul className="list-disc pl-6 text-sm">
              {result.contradictions.map((c, index) => (
                <li key={`${c.category}-${index}`}>
                  {c.category}: {c.message} [{c.evidenceReferences.join(', ')}]
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}
