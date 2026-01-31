# Resume Analyzer

## Overview

Claude Code-powered resume screening tool for Tally.so job applications.
Evaluates 100-300 candidates using Claude Code subagents — no external APIs needed.

## How It Works

```
Tally CSV + PDFs → /ingest → JSON files → /screen (subagents) → /rank, /explore, /report
```

## Commands

```bash
npm install       # Install dependencies
npm run ingest    # Run ingestion script directly (prefer /ingest skill)
```

## Skills (Slash Commands)

| Command    | Purpose                              |
|------------|--------------------------------------|
| `/setup`   | Guided criteria definition           |
| `/ingest`  | Parse Tally CSV + download PDFs      |
| `/screen`  | Batch evaluate ALL candidates        |
| `/rank`    | View ranked results table            |
| `/explore` | Deep-dive specific candidates        |
| `/report`  | Generate summary markdown report     |

## Data Directory

```
data/
├── candidates/{id}.json    # One file per parsed candidate
├── evaluations/{id}.json   # One file per evaluation result
├── pdfs/                   # Downloaded PDF resumes
└── index.json              # Lightweight index (name, score, verdict, summary)
```

All data is gitignored (contains PII).

## Architecture: Subagent Screening

The `/screen` skill handles the 300-candidate problem:
- 300 candidates x ~3K tokens = 900K tokens (too much for one context)
- Solution: split into batches of ~15, spawn parallel subagents
- Each subagent gets criteria + 15 profiles, returns evaluations
- 20 batches x 15 candidates, ~3 parallel subagents at a time

## Key Files

- `criteria.md` — Evaluation criteria (created by `/setup`, gitignored)
- `criteria.example.md` — Template with example job description
- `src/ingest.ts` — CSV parsing + PDF text extraction
- `src/utils.ts` — Shared helpers

## Candidate JSON Schema

```json
{
  "id": "c_V1StGXR8",
  "name": "김서연",
  "email": "seoyeon@example.com",
  "phone": "010-1234-5678",
  "resumeUrl": "https://tally.so/...",
  "resumeText": "extracted PDF text...",
  "answers": [
    { "question": "질문", "answer": "답변" }
  ],
  "socialMedia": "https://...",
  "ingestedAt": "2025-02-01T14:30:00Z"
}
```

## Evaluation JSON Schema

```json
{
  "candidateId": "c_V1StGXR8",
  "overallScore": 82,
  "verdict": "strong|maybe|pass",
  "criteria": {
    "criteriaName": { "score": 9, "reason": "..." }
  },
  "pros": ["..."],
  "cons": ["..."],
  "fitSummary": "One-line summary",
  "evaluatedAt": "2025-02-01T14:35:00Z"
}
```

## Index JSON Schema

```json
[
  { "id": "c_V1StGXR8", "name": "김서연", "score": 82, "verdict": "strong", "summary": "..." }
]
```
