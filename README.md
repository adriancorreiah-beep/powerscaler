# PowerScaling Assistant

PowerScaling Assistant is an **evidence-in / analysis-out** tool.

Given a character and user-provided evidence snippets, it produces:

- Structured ratings per category with confidence
- A reasoning chain grounded in quoted/paraphrased evidence
- A consistency check (contradictions + missing info)
- Exports in both JSON and Markdown

## Quickstart

```bash
python -m powerscaler.cli analyze \
  --input examples/goku_input.json \
  --json-out output.json \
  --md-out output.md
```

## Input format

```json
{
  "character": "Character Name",
  "evidence": [
    {
      "id": "E1",
      "text": "Direct feat or statement.",
      "source": "Episode 10",
      "reliability": 0.9
    }
  ]
}
```

## Category model

Default categories:

- Attack Potency
- Durability
- Speed
- Stamina
- Hax / Special Abilities

Each category outputs:

- `score` (1-10)
- `confidence` (0-1)
- `evidence_ids`
- `reasoning`

## Notes

- This project intentionally avoids web scraping.
- It only uses evidence supplied by the user.
