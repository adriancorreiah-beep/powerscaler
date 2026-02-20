import { analyzeDeterministic } from './rules-engine';
import { AnalysisInput, AnalysisOutput, LLMProvider } from './types';

export async function runAnalysis(input: AnalysisInput, llmProvider?: LLMProvider): Promise<AnalysisOutput> {
  if (llmProvider?.analyze) {
    try {
      return await llmProvider.analyze(input);
    } catch {
      return analyzeDeterministic(input);
    }
  }

  return analyzeDeterministic(input);
}
