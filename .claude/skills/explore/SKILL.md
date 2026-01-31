---
name: explore
description: Deep-dive into specific candidates or search candidates by criteria.
---

# /explore — Candidate Deep-Dive

Explore individual candidates or search across the candidate pool.

## Two Modes

### Mode 1: Specific Candidate

When the user names a candidate or provides an ID:

1. Search `data/index.json` for matching name or ID
2. Read the full `data/candidates/{id}.json`
3. Read the full `data/evaluations/{id}.json`
4. Present a detailed profile:

```
## 김서연 (c_V1StGXR8) — 94점 🟢 Strong

### 평가 요약
[fitSummary]

### 상세 점수
| 항목 | 점수 | 평가 |
|------|------|------|
| Claude Code 활용 | 9/10 | Claude Code로 멀티에이전트 시스템 구축 경험 |
| 빠른 프로토타이핑 | 8/10 | 3개 PoC 프로젝트, 스타트업 경험 |
...

### 강점
- ...

### 약점
- ...

### 지원 답변
**Q: 왜 함께 일하고 싶나요?**
[full answer]

**Q: 어떤 업무와 일과로 하루를 보낼 것 같으신가요?**
[full answer]

### 이력서 (요약)
[first 1000 chars of resumeText]

### 링크
- 이력서: [resumeUrl]
- 소셜: [socialMedia]
```

### Mode 2: Search Query

When the user asks a question about candidates:
- "스타트업 경험이 있는 사람?" → scan index summaries + read matching candidate files
- "Supabase 경험자?" → search resumeText across candidates
- "동기 점수가 높은 사람?" → filter evaluations by criteria score
- "김서연과 이준호 비교" → load both profiles, present side-by-side

For search queries:
1. First scan `data/index.json` for quick matches
2. If needed, read individual candidate/evaluation files for deeper search
3. Present results as a compact list with option to deep-dive

## Important

- Always use Korean for output
- When comparing candidates, use a side-by-side table format
- For resume text, show relevant excerpts, not the full text
- If no match found: "해당하는 지원자를 찾지 못했습니다."
- If the user just types `/explore` without a query, ask: "어떤 지원자를 살펴볼까요? 이름, ID, 또는 검색어를 입력해주세요."
