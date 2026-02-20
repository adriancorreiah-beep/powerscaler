export const CATEGORIES = [
  'Tier',
  'Attack Potency',
  'Speed',
  'Lifting Strength',
  'Striking Strength',
  'Durability',
  'Intelligence',
  'Range',
  'Stamina'
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface CharacterInfo {
  name: string;
  verse?: string;
  notes?: string;
}

export interface EvidenceEntry {
  id: string;
  source: string;
  claim: string;
  categoryTags: Category[];
  reliability: number;
}

export interface AnalysisInput {
  character: CharacterInfo;
  evidence: EvidenceEntry[];
}

export interface CategoryAssessment {
  category: Category;
  rating: string;
  confidence: number;
  rationale: string;
  evidenceReferences: string[];
  unknowns: string[];
}

export interface ContradictionFlag {
  category: Category;
  message: string;
  evidenceReferences: string[];
}

export interface AnalysisOutput {
  character: CharacterInfo;
  generatedAt: string;
  assessments: CategoryAssessment[];
  contradictions: ContradictionFlag[];
}

export interface LLMProvider {
  analyze?(input: AnalysisInput): Promise<AnalysisOutput>;
}
