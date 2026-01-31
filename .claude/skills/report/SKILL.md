---
name: report
description: Generate a comprehensive markdown screening report.
---

# /report — Generate Screening Report

Create a comprehensive markdown report of the screening results.

## Process

1. **Read data**: Load `data/index.json` and `criteria.md`

2. **Generate report** as a markdown file:

```markdown
# 채용 스크리닝 리포트

**생성일:** YYYY-MM-DD
**포지션:** [from criteria.md]
**총 지원자:** N명

## 개요

| 구분 | 인원 | 비율 |
|------|------|------|
| 🟢 Strong | X명 | X% |
| 🟡 Maybe | Y명 | Y% |
| 🔴 Pass | Z명 | Z% |

**평균 점수:** XX점
**점수 분포:** 최고 XX점 ~ 최저 XX점

## 평가 기준 요약

[Brief summary of criteria used, from criteria.md]

## 🟢 Top 20 후보자 상세

[For each of the top 20 candidates by score:]

### #1. 김서연 — 94점

| 항목 | 점수 |
|------|------|
| Claude Code 활용 | 9/10 |
| 빠른 프로토타이핑 | 8/10 |
| ... | ... |

**강점:** ...
**약점:** ...
**종합:** [fitSummary]

---

## 🟡 Maybe 그룹 주요 후보

[Top 10 from maybe tier, brief format]

## 인사이트

- [Pattern observations: common strengths, common gaps]
- [Surprising findings]
- [Recommendations for next steps]

## 다음 단계 제안

1. Strong 후보 X명 면접 일정 잡기
2. Maybe 상위 Y명 추가 검토
3. [Other actionable suggestions]
```

3. **Write report** to `data/report-YYYY-MM-DD.md`

4. **Confirm**: "리포트를 생성했습니다: data/report-YYYY-MM-DD.md"

## Important

- All content in Korean
- Read individual evaluation files for the top 20 candidates (need full criteria scores)
- For the "인사이트" section, look for patterns across all evaluations
- Include actual numbers and percentages
- Date format: YYYY-MM-DD (Korean standard)
