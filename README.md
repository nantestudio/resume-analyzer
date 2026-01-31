# Resume Analyzer

**Claude Code로 구동되는 이력서 스크리닝 도구**

Tally.so 지원서 100-300건을 Claude Code만으로 평가합니다. 외부 API 키 불필요, 설정 제로.

---

## 시작하기

```bash
git clone https://github.com/nantestudio/resume-analyzer.git
cd resume-analyzer
npm install
```

끝. 이제 Claude Code를 열면 됩니다.

```bash
claude
```

## 사용법

### 1단계: 평가 기준 설정

```
> /setup
```

포지션에 맞는 평가 기준을 대화형으로 만들어줍니다.
기본 템플릿(`criteria.example.md`)이 AX Engineer 포지션용으로 준비되어 있습니다.

### 2단계: 지원서 불러오기

Tally.so에서 CSV를 내보낸 후:

```
> /ingest
→ "Tally CSV 파일 경로를 알려주세요"
→ ./applications.csv
→ "284명의 지원자를 불러왔습니다."
```

이력서 PDF도 자동으로 다운로드하고 텍스트를 추출합니다.

### 3단계: 전체 평가

```
> /screen
→ "284명의 지원자를 평가합니다..."
→ [서브에이전트가 15명씩 병렬 평가]
→ "완료. Strong 22명 / Maybe 108명 / Pass 154명"
```

### 4단계: 결과 확인

```
> /rank                    # 순위표 보기
> /explore                 # 특정 지원자 상세 보기
> "김서연에 대해 알려줘"     # 자연어로 탐색
> "상위 5명 비교"           # 비교 분석
> /report                  # 리포트 생성
```

## 명령어 요약

| 명령어 | 설명 |
|--------|------|
| `/setup` | 평가 기준 설정 (대화형) |
| `/ingest` | Tally CSV 파일 불러오기 |
| `/screen` | 전체 지원자 일괄 평가 |
| `/rank` | 점수별 순위표 |
| `/explore` | 지원자 상세 탐색 |
| `/report` | 종합 리포트 생성 |

## 작동 원리

```
Tally CSV + PDF → /ingest → JSON 파일 → /screen (서브에이전트) → /rank, /explore, /report
```

### 300명 문제 해결

300명 × 3K 토큰 = 900K 토큰 — 하나의 컨텍스트에 안 들어갑니다.

**해결:** `/screen`이 지원자를 15명씩 나눠서 Claude Code 서브에이전트를 병렬로 실행합니다.
각 서브에이전트는 평가 기준 + 15명의 프로필을 받아 독립적으로 평가합니다.

### 데이터 구조

```
data/
├── candidates/{id}.json    # 지원자별 원본 데이터
├── evaluations/{id}.json   # 지원자별 평가 결과
├── pdfs/                   # 다운로드된 이력서 PDF
└── index.json              # 전체 순위 인덱스
```

모든 데이터는 로컬 JSON 파일로 저장됩니다. DB 불필요.

## 요구사항

- Node.js 18+
- [Claude Code](https://claude.ai/claude-code) CLI

## 라이선스

MIT

---

*Made with Claude Code by [Nante Studio](https://nantestudio.com)*
