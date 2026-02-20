# powerscale-assistant

A Next.js 14 + TypeScript + Tailwind app for deterministic power-scaling analysis.

## Features

- Analyze only **user-provided evidence** (no scraping).
- Categories covered:
  - Tier
  - Attack Potency
  - Speed
  - Lifting Strength
  - Striking Strength
  - Durability
  - Intelligence
  - Range
  - Stamina
- Every category output includes:
  - rating
  - confidence (0-100)
  - rationale
  - evidence references
  - unknowns list
- Contradiction checker to flag conflicting claims.
- Export analysis as JSON and Markdown.
- Optional interface for adding an LLM provider later, with local deterministic fallback by default.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Vitest (unit tests)

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## UI Usage

1. Enter character details.
2. Paste evidence JSON array into the evidence field.
3. Click **Run analysis**.
4. Review category assessments + contradictions.
5. Export via **Export JSON** or **Export Markdown**.

### Evidence JSON shape

```json
[
  {
    "id": "E1",
    "source": "Chapter 21 panel 5",
    "claim": "Character blitzed three opponents in an instant.",
    "categoryTags": ["Speed", "Attack Potency"],
    "reliability": 85
  }
]
```

## API

### `POST /api/analyze`

Request body:

```json
{
  "character": {
    "name": "Character Name",
    "verse": "Verse Name",
    "notes": "Optional notes"
  },
  "evidence": []
}
```

Response body:

```json
{
  "character": {},
  "generatedAt": "ISO timestamp",
  "assessments": [],
  "contradictions": []
}
```

## Rules Engine Notes

- Uses deterministic keyword + reliability heuristics per category.
- Higher reliability and stronger feat keywords increase ratings.
- Negative indicators can reduce scoring.
- Contradiction checker flags categories that contain both positive and negative claims.

## Testing

```bash
npm test
```
