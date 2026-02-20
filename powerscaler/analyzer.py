from __future__ import annotations

from collections import defaultdict
from dataclasses import asdict
from typing import Dict, Iterable, List

from .models import AnalysisResult, CategoryResult, ConsistencyReport, Evidence

CATEGORIES = {
    "Attack Potency": ["destroy", "planet", "mountain", "blast", "attack", "damage", "strike"],
    "Durability": ["survive", "tank", "endure", "durable", "resist", "damage"],
    "Speed": ["faster", "light", "speed", "blitz", "dodge", "reaction"],
    "Stamina": ["hours", "days", "stamina", "fatigue", "tire", "endurance"],
    "Hax / Special Abilities": ["teleport", "time", "reality", "hax", "mind", "ability", "special"],
}

NEGATION_WORDS = {"not", "never", "no", "cannot", "can't", "couldn't"}


def _normalize_reliability(value: float) -> float:
    return max(0.0, min(1.0, value))


def _evidence_strength(text: str, reliability: float) -> float:
    length_factor = min(len(text) / 160, 1.0)
    return (0.6 * _normalize_reliability(reliability)) + (0.4 * length_factor)


def _score_from_strength(strength: float) -> int:
    return max(1, min(10, round(strength * 10)))


def _find_contradictions(evidence: Iterable[Evidence]) -> List[str]:
    by_topic = defaultdict(list)
    for ev in evidence:
        text = ev.text.lower()
        for category, keywords in CATEGORIES.items():
            if any(k in text for k in keywords):
                has_negation = any(n in text.split() for n in NEGATION_WORDS)
                by_topic[category].append((ev.id, has_negation, ev.text))

    contradictions: List[str] = []
    for topic, entries in by_topic.items():
        has_positive = any(not neg for _, neg, _ in entries)
        has_negative = any(neg for _, neg, _ in entries)
        if has_positive and has_negative:
            ids = ", ".join(eid for eid, _, _ in entries)
            contradictions.append(f"Potential contradiction in {topic} across evidence: {ids}")
    return contradictions


def analyze_payload(payload: Dict) -> Dict:
    character = payload.get("character", "Unknown Character")
    evidence_list = [Evidence(**ev) for ev in payload.get("evidence", [])]

    categories: Dict[str, CategoryResult] = {}
    reasoning_chain: List[str] = []

    for category, keywords in CATEGORIES.items():
        matched = [ev for ev in evidence_list if any(k in ev.text.lower() for k in keywords)]

        if not matched:
            categories[category] = CategoryResult(
                score=1,
                confidence=0.2,
                evidence_ids=[],
                reasoning=[f"No direct evidence provided for {category}."],
            )
            continue

        strengths = [_evidence_strength(ev.text, ev.reliability) for ev in matched]
        avg_strength = sum(strengths) / len(strengths)
        score = _score_from_strength(avg_strength)
        confidence = round(min(0.95, 0.45 + (len(matched) * 0.12) + (avg_strength * 0.2)), 2)

        reasons = [f"[{ev.id}] {ev.text}" for ev in matched[:4]]
        categories[category] = CategoryResult(
            score=score,
            confidence=confidence,
            evidence_ids=[ev.id for ev in matched],
            reasoning=reasons,
        )

        reasoning_chain.append(
            f"{category}: rated {score}/10 with confidence {confidence} from evidence {', '.join(ev.id for ev in matched)}."
        )

    contradictions = _find_contradictions(evidence_list)
    missing = [
        category
        for category, result in categories.items()
        if not result.evidence_ids
    ]

    result = AnalysisResult(
        character=character,
        categories=categories,
        reasoning_chain=reasoning_chain,
        consistency_check=ConsistencyReport(
            contradictions=contradictions,
            missing_information=[f"Missing direct evidence for {c}" for c in missing],
        ),
    )

    as_dict = asdict(result)
    return as_dict
