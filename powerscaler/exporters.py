from __future__ import annotations

from typing import Dict


def to_markdown(result: Dict) -> str:
    lines = [f"# PowerScaling Report: {result['character']}", ""]
    lines.append("## Category Ratings")
    lines.append("")

    for category, details in result["categories"].items():
        lines.append(f"### {category}")
        lines.append(f"- Score: **{details['score']}/10**")
        lines.append(f"- Confidence: **{details['confidence']}**")
        evidence = ", ".join(details["evidence_ids"]) if details["evidence_ids"] else "None"
        lines.append(f"- Evidence IDs: {evidence}")
        lines.append("- Reasoning:")
        for reason in details["reasoning"]:
            lines.append(f"  - {reason}")
        lines.append("")

    lines.append("## Reasoning Chain")
    for step in result["reasoning_chain"]:
        lines.append(f"- {step}")
    lines.append("")

    cc = result["consistency_check"]
    lines.append("## Consistency Check")
    lines.append("### Contradictions")
    if cc["contradictions"]:
        for item in cc["contradictions"]:
            lines.append(f"- {item}")
    else:
        lines.append("- None detected")

    lines.append("### Missing Information")
    if cc["missing_information"]:
        for item in cc["missing_information"]:
            lines.append(f"- {item}")
    else:
        lines.append("- None")

    lines.append("")
    return "\n".join(lines)
