import { AnalysisInput, AnalysisOutput, CATEGORIES, Category, CategoryAssessment, EvidenceEntry } from './types';
import { findContradictions } from './consistency';

const SCALE = [
  'Unknown',
  'Very Low',
  'Low',
  'Below Average',
  'Average',
  'Above Average',
  'High',
  'Very High',
  'Extreme'
] as const;

const boostKeywords: Record<Category, string[]> = {
  Tier: ['multiversal', 'universal', 'planetary', 'cosmic'],
  'Attack Potency': ['one-shot', 'destroyed', 'vaporized', 'annihilated'],
  Speed: ['faster than light', 'ftl', 'instant', 'blitzed'],
  'Lifting Strength': ['lifted', 'carried', 'overpowered', 'moved'],
  'Striking Strength': ['punched through', 'shattered', 'cracked', 'devastating blow'],
  Durability: ['tanked', 'survived', 'withstood', 'unharmed'],
  Intelligence: ['outsmarted', 'strategy', 'predicted', 'deduced'],
  Range: ['across', 'long range', 'sniped', 'global'],
  Stamina: ['fought for', 'endless', 'without tiring', 'prolonged']
};

const downKeywords = ['struggled', 'failed', 'injured by', 'exhausted', 'slower'];

function scoreEvidence(entry: EvidenceEntry, category: Category): number {
  const text = `${entry.claim} ${entry.source}`.toLowerCase();
  let score = Math.max(1, Math.min(5, Math.round(entry.reliability / 20)));

  if (boostKeywords[category].some((word) => text.includes(word))) score += 2;
  if (downKeywords.some((word) => text.includes(word))) score -= 1;

  return Math.max(0, Math.min(8, score));
}

function aggregateCategory(category: Category, evidence: EvidenceEntry[]): CategoryAssessment {
  const relevant = evidence.filter((entry) => entry.categoryTags.includes(category));

  if (!relevant.length) {
    return {
      category,
      rating: 'Unknown',
      confidence: 0,
      rationale: 'No evidence provided for this category.',
      evidenceReferences: [],
      unknowns: ['Missing direct feats or statements.']
    };
  }

  const scores = relevant.map((entry) => scoreEvidence(entry, category));
  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  const rating = SCALE[Math.round(average)] ?? 'Unknown';
  const confidence = Math.min(
    100,
    Math.round(relevant.reduce((sum, e) => sum + e.reliability, 0) / relevant.length)
  );

  const strongest = relevant
    .slice()
    .sort((a, b) => b.reliability - a.reliability)
    .slice(0, 3)
    .map((e) => e.id);

  return {
    category,
    rating,
    confidence,
    rationale: `Derived from ${relevant.length} evidence item(s) using deterministic keyword and reliability heuristics.`,
    evidenceReferences: strongest,
    unknowns: confidence < 50 ? ['Low-reliability evidence dominates this category.'] : []
  };
}

export function analyzeDeterministic(input: AnalysisInput): AnalysisOutput {
  const assessments = CATEGORIES.map((category) => aggregateCategory(category, input.evidence));
  const contradictions = findContradictions(input.evidence);

  return {
    character: input.character,
    generatedAt: new Date().toISOString(),
    assessments,
    contradictions
  };
}
