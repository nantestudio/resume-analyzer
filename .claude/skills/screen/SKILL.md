---
name: screen
description: Batch evaluate ALL candidates using parallel Claude Code subagents. The core screening engine.
---

# /screen — Batch Candidate Screening

You are the screening orchestrator. You evaluate all candidates against the criteria using parallel subagents.

## Process

### Step 1: Load Criteria

Read `criteria.md` from the project root. If it doesn't exist:
- Say: "criteria.md가 없습니다. `/setup`을 먼저 실행해주세요."
- Stop.

### Step 2: Load Candidates

Read all JSON files from `data/candidates/`. Count them.
- If no candidates: "지원자가 없습니다. `/ingest`를 먼저 실행해주세요." → Stop.
- Report: "N명의 지원자를 평가합니다..."

Check which candidates already have evaluations in `data/evaluations/`. Skip those.
- If all are already evaluated: "모든 지원자가 이미 평가되었습니다. `/rank`로 결과를 확인하세요." → Stop.

### Step 3: Prepare Batches

Split unevaluated candidates into batches of **15**.

For each candidate in a batch, create a compact profile:
```
### [Name] (ID: [id])
**이메일:** [email]
**이력서 요약:** [first 500 chars of resumeText, or "이력서 없음"]
**답변:**
- Q: [question1] → A: [answer1]
- Q: [question2] → A: [answer2]
**소셜:** [socialMedia or "없음"]
```

### Step 4: Spawn Subagents

For each batch, use the **Task tool** to spawn a subagent with this prompt:

```
You are a resume screening assistant evaluating job candidates.

## Evaluation Criteria
[paste full criteria.md content]

## Candidates to Evaluate
[paste 15 candidate profiles]

## Instructions
Evaluate each candidate against the criteria. For EACH candidate, produce a JSON object:

{
  "candidateId": "[id]",
  "overallScore": [0-100 weighted score],
  "verdict": "strong|maybe|pass",
  "criteria": {
    "[criterionKey]": { "score": [1-10], "reason": "[1-2 sentence Korean explanation]" }
  },
  "pros": ["[strength 1]", "[strength 2]"],
  "cons": ["[weakness 1]", "[weakness 2]"],
  "fitSummary": "[1-line Korean summary of fit]"
}

Apply the weighted scoring formula from the criteria.
Use the verdict thresholds: strong (≥80), maybe (55-79), pass (<55).

Return ONLY a JSON array of evaluation objects. No other text.
```

**Parallelism:** Launch up to 3 subagents at a time using multiple Task tool calls in a single message. Wait for them to complete, then launch the next batch of 3.

Use `subagent_type: "general-purpose"` for each Task.

### Step 5: Collect Results

For each subagent result:
1. Parse the JSON array from the response
2. Add `"evaluatedAt": "[current ISO timestamp]"` to each evaluation
3. Write each evaluation to `data/evaluations/{candidateId}.json`

If a subagent returns malformed JSON:
- Log the error
- Add those candidates to a retry list
- After all batches, retry failed candidates in a single batch

### Step 6: Build Index

After all evaluations are written, rebuild `data/index.json`:

Read each candidate JSON and its matching evaluation JSON. Create index entries:
```json
{ "id": "...", "name": "...", "email": "...", "score": 82, "verdict": "strong", "summary": "fitSummary from evaluation" }
```

Sort by score descending.
Write to `data/index.json`.

### Step 7: Report

Show summary in Korean:
```
✓ 스크리닝 완료

총 평가: N명
- 🟢 Strong (강력 추천): X명
- 🟡 Maybe (검토 필요): Y명
- 🔴 Pass (불합격): Z명

`/rank`로 순위를 확인하세요.
```

## Important

- NEVER load all 300 candidate files into your own context — use subagents
- Each subagent gets at most 15 candidates to stay within context limits
- Resume text is truncated to 500 chars per candidate in subagent prompts (full text in JSON files)
- Preserve Korean text in all evaluations — do not translate names or answers
- If criteria.md has custom criteria keys, use those exact keys in evaluations
- The weighted score calculation must match criteria.md weights exactly
