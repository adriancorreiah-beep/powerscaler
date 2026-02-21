import { NextResponse } from 'next/server';
import { runAnalysis } from '@/lib/analyzer';
import { AnalysisInput, CATEGORIES, EvidenceEntry } from '@/lib/types';

function isEvidenceEntry(item: unknown): item is EvidenceEntry {
  if (!item || typeof item !== 'object') return false;
  const value = item as EvidenceEntry;
  return (
    typeof value.id === 'string' &&
    typeof value.source === 'string' &&
    typeof value.claim === 'string' &&
    Array.isArray(value.categoryTags) &&
    value.categoryTags.every((tag) => CATEGORIES.includes(tag)) &&
    typeof value.reliability === 'number'
  );
}

function isInput(body: unknown): body is AnalysisInput {
  if (!body || typeof body !== 'object') return false;
  const value = body as AnalysisInput;
  return (
    value.character !== undefined &&
    typeof value.character?.name === 'string' &&
    Array.isArray(value.evidence) &&
    value.evidence.every(isEvidenceEntry)
  );
}

export async function POST(request: Request) {
  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!isInput(requestBody)) {
    return NextResponse.json(
      { error: 'Invalid input. Provide character + evidence[] with category tags and reliability.' },
      { status: 400 }
    );
  }

  const output = await runAnalysis(requestBody);
  return NextResponse.json(output);
}
