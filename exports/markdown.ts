import { AnalysisOutput } from '../lib/types';

export function toMarkdown(output: AnalysisOutput): string {
  const lines = [`# PowerScale Analysis: ${output.character.name}`, '', `Generated: ${output.generatedAt}`, ''];

  for (const item of output.assessments) {
    lines.push(`## ${item.category}`);
    lines.push(`- Rating: ${item.rating}`);
    lines.push(`- Confidence: ${item.confidence}`);
    lines.push(`- Rationale: ${item.rationale}`);
    lines.push(`- Evidence references: ${item.evidenceReferences.join(', ') || 'None'}`);
    lines.push(`- Unknowns: ${item.unknowns.join('; ') || 'None'}`);
    lines.push('');
  }

  lines.push('## Contradictions');
  if (!output.contradictions.length) {
    lines.push('- None detected.');
  } else {
    output.contradictions.forEach((flag) => {
      lines.push(`- ${flag.category}: ${flag.message} [${flag.evidenceReferences.join(', ')}]`);
    });
  }

  return lines.join('\n');
}
