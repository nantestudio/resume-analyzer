---
name: setup
description: Guided criteria definition for resume screening. Walks you through creating criteria.md.
---

# /setup — Criteria Definition

You are helping a recruiter define their evaluation criteria for screening job applicants.

## Process

1. **Check if criteria.md already exists** by reading `criteria.md` in the project root.
   - If it exists, ask: "기존 criteria.md가 있습니다. 수정하시겠습니까, 새로 만드시겠습니까?" (Existing criteria.md found. Modify or create new?)

2. **Read the template** from `criteria.example.md` and show a brief summary of the default criteria.

3. **Ask the recruiter these questions** (in Korean, as the user is Korean-speaking):

   a. "이 포지션의 필수 요건은 무엇인가요? (Must-haves)"

   b. "Q1 '왜 함께 일하고 싶나요?'에서 좋은 답변의 기준은? (What makes a great answer to Q1?)"

   c. "Q2 '어떤 업무와 일과로 하루를 보낼 것 같으신가요?'에서 어떤 답변을 기대하나요? (What do you expect for Q2?)"

   d. "절대 안 되는 레드 플래그가 있나요? (Any dealbreakers?)"

   e. "기타 평가 기준이나 가중치를 조정하고 싶은 부분이 있나요?"

4. **Generate criteria.md** based on the recruiter's answers, following the structure from `criteria.example.md`. Write it to `criteria.md` in the project root.

5. **Confirm**: "criteria.md를 생성했습니다. `/ingest`로 지원서를 불러오세요."

## Important

- Use Korean for all prompts and outputs
- Keep the criteria.md format consistent with criteria.example.md (needed by /screen)
- Each criterion must have: name (English camelCase key), Korean description, scoring rubric (우수/보통/미달), weight percentage
- Verdict thresholds must be defined (strong/maybe/pass with score ranges)
- If the recruiter doesn't have strong opinions on some items, use the defaults from criteria.example.md
