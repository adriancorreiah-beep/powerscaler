from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List


@dataclass
class Evidence:
    id: str
    text: str
    source: str = ""
    reliability: float = 0.7


@dataclass
class CategoryResult:
    score: int
    confidence: float
    evidence_ids: List[str] = field(default_factory=list)
    reasoning: List[str] = field(default_factory=list)


@dataclass
class ConsistencyReport:
    contradictions: List[str] = field(default_factory=list)
    missing_information: List[str] = field(default_factory=list)


@dataclass
class AnalysisResult:
    character: str
    categories: Dict[str, CategoryResult]
    reasoning_chain: List[str]
    consistency_check: ConsistencyReport
