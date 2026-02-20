import { describe, expect, it } from 'vitest';
import { analyzeDeterministic } from '@/lib/rules-engine';
import { AnalysisInput } from '@/lib/types';

describe('rules engine', () => {
  it('returns unknown for categories without evidence', () => {
    const input: AnalysisInput = {
      character: { name: 'Test' },
      evidence: []
    };

    const out = analyzeDeterministic(input);
    expect(out.assessments.every((a) => a.rating === 'Unknown')).toBe(true);
    expect(out.assessments.every((a) => a.confidence === 0)).toBe(true);
  });

  it('scores categories from tagged evidence and sets confidence', () => {
    const input: AnalysisInput = {
      character: { name: 'Runner' },
      evidence: [
        {
          id: 'E1',
          source: 'Issue #1',
          claim: 'Runner moved faster than light and blitzed enemies.',
          categoryTags: ['Speed'],
          reliability: 90
        }
      ]
    };

    const speed = analyzeDeterministic(input).assessments.find((a) => a.category === 'Speed');
    expect(speed?.rating).not.toBe('Unknown');
    expect(speed?.confidence).toBe(90);
    expect(speed?.evidenceReferences).toContain('E1');
  });

  it('flags contradiction when positive and negative claims coexist', () => {
    const input: AnalysisInput = {
      character: { name: 'Fighter' },
      evidence: [
        {
          id: 'E1',
          source: 'Log A',
          claim: 'Fighter is stronger than all rivals.',
          categoryTags: ['Attack Potency'],
          reliability: 80
        },
        {
          id: 'E2',
          source: 'Log B',
          claim: 'Fighter is weaker and failed to break armor.',
          categoryTags: ['Attack Potency'],
          reliability: 75
        }
      ]
    };

    const out = analyzeDeterministic(input);
    expect(out.contradictions.length).toBe(1);
    expect(out.contradictions[0].category).toBe('Attack Potency');
  });
});
