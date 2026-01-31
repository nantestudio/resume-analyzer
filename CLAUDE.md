# CLAUDE.md — Resume Analyzer

## 이 프로젝트가 뭔가요?

Tally.so 지원서(CSV)를 받아서 Claude Code 서브에이전트로 자동 평가하는 도구입니다.
외부 API 키 없음, DB 없음, 설정 없음. Claude Code만 있으면 됩니다.

## 빠른 시작 (조쉬님 여기부터)

```bash
git clone https://github.com/nantestudio/resume-analyzer.git
cd resume-analyzer
npm install
```

그 다음 Claude Code를 열고 슬래시 명령어를 순서대로 실행하세요:

```
/setup     →  평가 기준 설정 (처음 1회만)
/ingest    →  Tally CSV 불러오기
/screen    →  전체 지원자 일괄 평가 (서브에이전트 병렬 실행)
/rank      →  점수 순위표 보기
/explore   →  특정 지원자 상세 보기 (예: "김서연에 대해 알려줘")
/report    →  종합 리포트 마크다운 생성
```

**팁:** `/screen` 완료 후에는 자연어로도 탐색 가능합니다:
- "상위 10명 보여줘"
- "Supabase 경험 있는 사람 누구야?"
- "1등이랑 2등 비교해줘"

## 파이프라인

```
Tally CSV + PDF → /ingest → data/candidates/*.json
                          → /screen (15명씩 배치 → 서브에이전트 병렬 평가)
                          → data/evaluations/*.json + data/index.json
                          → /rank, /explore, /report
```

## 슬래시 명령어 (Skills)

| 명령어 | 역할 | 언제 쓰나 |
|--------|------|-----------|
| `/setup` | `criteria.md` 생성 (대화형) | 처음 1회, 또는 기준 변경 시 |
| `/ingest` | Tally CSV 파싱 + PDF 텍스트 추출 | CSV 파일 받을 때마다 |
| `/screen` | 전체 지원자 배치 평가 | ingest 후 |
| `/rank` | 점수별 정렬 테이블 출력 | screen 후 |
| `/explore` | 특정 지원자 상세 분석 | 궁금한 사람 있을 때 |
| `/report` | `data/report-YYYY-MM-DD.md` 생성 | 최종 정리할 때 |

## 데이터 구조

```
data/
├── candidates/{id}.json    # 지원자 원본 (이름, 이메일, 이력서 텍스트, 답변)
├── evaluations/{id}.json   # 평가 결과 (점수, verdict, 장단점, 요약)
├── pdfs/                   # 다운로드된 PDF 이력서
└── index.json              # 전체 순위 인덱스 (경량, ~30 토큰/명)
```

**전부 gitignore 됨** — 개인정보(PII) 보호. 로컬에만 존재합니다.

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `criteria.md` | 평가 기준 (gitignored, `/setup`으로 생성) |
| `criteria.example.md` | 기준 템플릿 (AX Engineer 예시 포함) |
| `src/ingest.ts` | CSV 파싱 + PDF 다운로드/텍스트 추출 |
| `src/utils.ts` | 컬럼 자동 감지, ID 생성, 파일 I/O 헬퍼 |
| `.claude/skills/*/SKILL.md` | 슬래시 명령어 정의 |

## 300명+ 문제 해결: 서브에이전트 배칭

300명 × ~3K 토큰 = 900K 토큰 → 하나의 컨텍스트에 안 들어감.

**해결 방식:**
1. `/screen`이 지원자를 15명씩 배치로 분할
2. 각 배치를 Claude Code 서브에이전트(Task tool)에 할당
3. 서브에이전트는 `criteria.md` + 15명 프로필을 받아 독립 평가
4. 결과를 `data/evaluations/{id}.json`에 각각 저장 (파일 단위 → 충돌 없음)
5. 완료 후 `data/index.json` 빌드

500명까지 테스트 완료. 배치 수만 늘어날 뿐 같은 패턴.

## 평가 스키마

### Candidate (`data/candidates/{id}.json`)

```json
{
  "id": "c_V1StGXR8",
  "name": "김서연",
  "email": "seoyeon@example.com",
  "phone": "010-1234-5678",
  "resumeUrl": "https://tally.so/...",
  "resumeText": "추출된 PDF 텍스트...",
  "answers": [
    { "question": "왜 함께 일하고 싶나요?", "answer": "..." },
    { "question": "어떤 업무와 일과로 하루를 보낼 것 같으신가요?", "answer": "..." }
  ],
  "socialMedia": "https://github.com/...",
  "ingestedAt": "2025-02-01T14:30:00Z"
}
```

### Evaluation (`data/evaluations/{id}.json`)

```json
{
  "candidateId": "c_V1StGXR8",
  "overallScore": 82,
  "verdict": "strong|maybe|pass",
  "criteria": {
    "criteriaName": { "score": 9, "reason": "평가 근거" }
  },
  "pros": ["장점1", "장점2"],
  "cons": ["단점1"],
  "fitSummary": "한 줄 요약",
  "evaluatedAt": "2025-02-01T14:35:00Z"
}
```

### Index (`data/index.json`)

```json
[
  { "id": "c_V1StGXR8", "name": "김서연", "email": "seoyeon@example.com", "score": 82, "verdict": "strong", "summary": "한 줄 요약" }
]
```

~30 토큰/명 × 500명 = ~15K 토큰. 컨텍스트에 충분히 들어감.

## Tally CSV 컬럼 감지

`src/utils.ts`의 `detectColumns()`가 Tally 한국어 헤더를 자동 감지합니다:

- 이름 → `name`
- 이메일 → `email`
- 전화 → `phone`
- 이력서/업로드 → `resume` (URL 또는 인라인 텍스트 모두 처리)
- 함께 일하고 싶 → Q1 (지원 동기)
- 업무/일과/하루 → Q2 (일과 비전)
- 소셜/SNS/github/linkedin → `socialMedia`

Tally 헤더가 긴 문장("이름을 기입해주세요.")이어도 패턴 매칭으로 처리됨.

## 커스터마이징

### 다른 포지션에 쓰고 싶을 때

1. `/setup` 다시 실행 → 새로운 `criteria.md` 생성
2. `/ingest` → 새 CSV
3. `/screen` → 새 기준으로 재평가

### 평가 기준 항목 바꾸고 싶을 때

`criteria.md`를 직접 수정하면 됩니다. `/screen`은 이 파일을 읽어서 서브에이전트에 전달합니다.
항목 이름, 가중치, 점수 기준, 보너스 포인트 전부 수정 가능.

## 의존성

- `csv-parse` — CSV 파싱
- `pdf-parse` — PDF 텍스트 추출 (순수 JS, 네이티브 의존성 없음)
- `nanoid` — 지원자 ID 생성
- `tsx` + `typescript` — 개발용

**외부 API 없음. `.env` 없음. DB 없음.**

## 요구사항

- Node.js 18+
- Claude Code CLI (`claude`)
