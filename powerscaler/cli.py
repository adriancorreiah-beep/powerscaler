from __future__ import annotations

import argparse
import json
from pathlib import Path

from .analyzer import analyze_payload
from .exporters import to_markdown


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="PowerScaling Assistant CLI")
    sub = parser.add_subparsers(dest="command", required=True)

    analyze = sub.add_parser("analyze", help="Analyze character evidence")
    analyze.add_argument("--input", required=True, help="Path to input JSON")
    analyze.add_argument("--json-out", required=True, help="Path to output JSON")
    analyze.add_argument("--md-out", required=True, help="Path to output Markdown")

    return parser.parse_args()


def main() -> None:
    args = _parse_args()

    if args.command == "analyze":
        payload = json.loads(Path(args.input).read_text())
        result = analyze_payload(payload)

        Path(args.json_out).write_text(json.dumps(result, indent=2))
        Path(args.md_out).write_text(to_markdown(result))


if __name__ == "__main__":
    main()
