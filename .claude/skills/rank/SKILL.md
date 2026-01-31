---
name: rank
description: Display ranked candidate results in a formatted table by verdict tier.
---

# /rank — View Ranked Results

Display the screening results as a ranked table.

## Process

1. **Read `data/index.json`**. If it doesn't exist or is empty:
   - "평가 결과가 없습니다. `/screen`을 먼저 실행해주세요." → Stop.

2. **Group by verdict** (strong, maybe, pass) and sort each group by score descending.

3. **Display results** in this format:

```
## 🟢 Strong — 강력 추천 (N명)
| # | 이름 | 점수 | 요약 |
|---|------|------|------|
| 1 | 김서연 | 94 | Claude Code 전문가, AI 팀 리드 경험 |
| 2 | 이준호 | 91 | 풀스택, 스타트업 CTO 출신 |
...

## 🟡 Maybe — 검토 필요 (N명)
[Show top 15, then "... 외 N명"]

## 🔴 Pass — 불합격 (N명)
[Show count only]
```

4. **Show tips**:
   - "특정 지원자 상세 보기: `/explore` 또는 '김서연에 대해 알려줘'"
   - "리포트 생성: `/report`"

## Options

If the user asks for specific filters after seeing ranks:
- "strong만 보여줘" → show only strong tier
- "80점 이상" → filter by score
- "상위 10명" → show top 10 regardless of tier
