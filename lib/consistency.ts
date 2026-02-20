import { CATEGORIES, Category, ContradictionFlag, EvidenceEntry } from './types';

const positiveIndicators = ['faster', 'stronger', 'survived', 'won', 'dominated', 'tanked'];
const negativeIndicators = ['slower', 'weaker', 'lost', 'failed', 'injured', 'exhausted'];

function getSignal(text: string): 'positive' | 'negative' | 'neutral' {
  const normalized = text.toLowerCase();
  const positive = positiveIndicators.some((w) => normalized.includes(w));
  const negative = negativeIndicators.some((w) => normalized.includes(w));
  if (positive && !negative) return 'positive';
  if (negative && !positive) return 'negative';
  return 'neutral';
}

function categoryConflicts(category: Category, evidence: EvidenceEntry[]): ContradictionFlag[] {
  const relevant = evidence.filter((e) => e.categoryTags.includes(category));
  const positive = relevant.filter((e) => getSignal(e.claim) === 'positive');
  const negative = relevant.filter((e) => getSignal(e.claim) === 'negative');

  if (!positive.length || !negative.length) return [];

  return [
    {
      category,
      message: `Conflicting claims detected: ${positive.length} positive vs ${negative.length} negative statements.`,
      evidenceReferences: [...positive.slice(0, 2), ...negative.slice(0, 2)].map((e) => e.id)
    }
  ];
}

export function findContradictions(evidence: EvidenceEntry[]): ContradictionFlag[] {
  return CATEGORIES.flatMap((category) => categoryConflicts(category, evidence));
}
