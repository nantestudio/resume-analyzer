#!/usr/bin/env tsx

/**
 * Generates a realistic 200-candidate Tally.so CSV export for testing.
 * Candidates have varying quality levels to test the screening pipeline.
 *
 * Usage: npx tsx test-data/generate.ts
 * Output: test-data/tally-export-200.csv
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

// ── Korean Name Generator ──────────────────────────────────────

const LAST_NAMES = [
	'김', '이', '박', '최', '정', '강', '조', '윤', '장', '임',
	'한', '오', '서', '신', '권', '황', '안', '송', '류', '홍',
	'전', '고', '문', '양', '손', '배', '백', '허', '유', '남',
	'심', '노', '하', '곽', '성', '차', '주', '우', '구', '민',
];

const FIRST_NAMES = [
	'서연', '민준', '지우', '하은', '도윤', '수아', '예준', '서윤',
	'시우', '지아', '준서', '하린', '지호', '소율', '현우', '다은',
	'주원', '예은', '건우', '수빈', '우진', '채원', '민서', '지윤',
	'유준', '서아', '도현', '윤서', '승우', '지민', '태윤', '나은',
	'시윤', '가은', '준혁', '민아', '재원', '소윤', '지환', '다인',
	'은우', '하율', '성민', '유나', '동현', '시은', '재윤', '보은',
	'상현', '소현', '태민', '아린', '민혁', '연우', '정우', '하영',
	'승민', '세아', '현서', '보람', '진우', '예린', '세준', '은서',
];

function randomName(): string {
	const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
	const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
	return `${last}${first}`;
}

// ── Email Generator ────────────────────────────────────────────

const EMAIL_DOMAINS = [
	'gmail.com', 'naver.com', 'kakao.com', 'daum.net', 'hanmail.net',
	'outlook.com', 'icloud.com', 'yahoo.com',
];

function randomEmail(name: string, index: number): string {
	const domain = EMAIL_DOMAINS[Math.floor(Math.random() * EMAIL_DOMAINS.length)];
	const romanized = `applicant${index}`;
	return `${romanized}@${domain}`;
}

// ── Phone Generator ────────────────────────────────────────────

function randomPhone(): string {
	const mid = String(Math.floor(1000 + Math.random() * 9000));
	const end = String(Math.floor(1000 + Math.random() * 9000));
	return `010-${mid}-${end}`;
}

// ── Date Generator ─────────────────────────────────────────────

function randomDate(): string {
	const start = new Date('2025-01-10');
	const end = new Date('2025-01-31');
	const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
	return d.toISOString().split('T')[0];
}

// ── Social Link Generator ──────────────────────────────────────

function randomSocial(index: number): string {
	const r = Math.random();
	if (r < 0.35) return '';
	if (r < 0.50) return `https://github.com/dev-${index}`;
	if (r < 0.65) return `https://linkedin.com/in/user-${index}`;
	if (r < 0.75) return `https://www.threads.net/@user${index}`;
	if (r < 0.85) return `https://instagram.com/dev_user${index}`;
	return `https://dev-${index}.tistory.com`;
}

// ── Answer Templates by Quality Tier ───────────────────────────

type Tier = 'strong' | 'maybe' | 'pass';

// Q1: 왜 함께 일하고 싶나요? 지원 배경을 알려주세요.
const Q1_STRONG = [
	'조쉬님의 유튜브를 1년 넘게 구독하며 AX라는 개념에 확신을 갖게 되었습니다. 현재 회사에서 Claude Code로 멀티에이전트 시스템을 구축했고, 이를 통해 개발 생산성을 3배 향상시켰습니다. SK 등 대기업의 AX 니즈를 직접 해결하는 FDE로 성장하고 싶습니다. 특히 클라이언트 미팅 후 3일 내 PoC를 시연하는 방식에 깊이 공감합니다.',
	'AI 도구를 활용한 빠른 프로토타이핑이 제 핵심 역량입니다. 스타트업에서 CTO로 3년간 일하면서 주 단위 PoC 사이클을 운영했고, Claude Code와 Cursor를 적극 활용하여 개발 속도를 획기적으로 높였습니다. 조쉬님의 "Done is better than perfect" 철학과 완전히 일치하는 방식으로 일해왔습니다. AX 컨설팅이라는 새로운 분야에서 기술과 비즈니스를 연결하는 일에 큰 매력을 느낍니다.',
	'Claude Code로 실제 프로덕션 서비스를 구축한 경험이 있습니다. Supabase + PostgreSQL 기반으로 AI SaaS를 혼자 만들었고, Claude Code의 Task 도구를 활용한 자동화 파이프라인도 설계했습니다. 조쉬님 뉴스레터에서 읽은 FDE 개념에 매료되었고, 실제로 기업 현장에서 AI로 문제를 풀어보고 싶습니다.',
	'조쉬님의 링크드인과 스레드를 팔로우하고 있습니다. AI-native 개발 방식에 대한 확신이 있어서 지원합니다. 기존 개발 프로세스를 AI 도구로 전환하는 프로젝트를 주도한 경험이 있으며, 팀 생산성 200% 향상이라는 성과를 냈습니다. Claude Code 커스텀 스킬을 만들어 팀 전체가 활용하게 한 경험도 있습니다. Lean하게 일하며 매일 성과를 내는 환경에서 성장하고 싶습니다.',
	'풀스택 개발과 AI 도구 활용 능력을 결합해 빠른 가치 전달에 자신 있습니다. 최근 Claude Code를 활용해 3일 만에 MVP를 만들어 고객에게 시연한 경험이 있습니다. Joshua의 Supanova 프로젝트를 보며 글로벌 SaaS에 대한 꿈을 키웠습니다. 기술적 깊이와 비즈니스 이해를 모두 갖춘 AX Engineer가 되고 싶습니다.',
	'데이터 엔지니어링과 AI 개발의 교차점에서 일해왔습니다. LLM 파이프라인 구축, 프롬프트 엔지니어링, Claude API 활용 경험이 풍부합니다. 조쉬님의 "바이브코딩" 콘텐츠를 보고 이 방향이 미래라고 확신했습니다. 기업 데이터를 AI와 결합해 인사이트를 도출하는 전문성으로 AX 컨설팅에 직접 기여할 수 있습니다.',
	'개발 경력 6년차이지만, 솔직히 최근 1년간 클로드 코드를 쓰면서 그 전 5년보다 더 많이 만든 것 같습니다. 조쉬님이 "당일 개발을 구현하여 프로젝트를 수주한다"는 이야기에 깊이 공감합니다. 저도 실제로 하루 만에 PoC를 만들어 내부 승인을 받은 경험이 여러 번 있습니다. 이런 속도감 있는 환경에서 간절히 일하고 싶습니다.',
	'창업을 2번 했고, 둘 다 기술적으로는 성공했지만 시장에서는 실패했습니다. 그 경험을 통해 "빠르게 만들고 빠르게 검증하는" 것의 중요성을 뼈저리게 배웠습니다. Claude Code와 Supabase로 주 1개 PoC를 만드는 것이 제 루틴입니다. 조쉬님 팀에서 이 능력을 기업 고객에게 직접 가치로 전환하고 싶습니다.',
];

const Q1_MAYBE = [
	'AI 분야에 관심이 많아 지원했습니다. 현재 백엔드 개발자로 일하고 있으며, AI 도구를 활용한 개발 경험을 쌓고 싶습니다. Claude Code는 아직 사용해보지 않았지만 Copilot과 ChatGPT를 업무에 활용하고 있습니다. 빠르게 배울 자신이 있습니다.',
	'프론트엔드 개발 3년차입니다. React와 Next.js를 주로 사용하며, AI를 활용한 UI 개발에 관심이 생겼습니다. Cursor를 주로 사용하고 있고, Claude Code도 최근 시작했습니다. AX라는 분야가 새롭고 흥미롭습니다.',
	'스타트업에서 풀스택 개발자로 일하고 있습니다. AI가 개발 방식을 바꾸고 있다는 것을 체감하며, 이 흐름에 합류하고 싶습니다. Cursor를 사용해본 경험이 있고, 바이브코딩이라는 개념에 관심이 많습니다.',
	'DevOps 엔지니어로 인프라 관리와 CI/CD 파이프라인 구축을 담당하고 있습니다. AI를 활용한 자동화에 관심이 있으며, 개발도 함께 하는 포지션으로 전환하고 싶습니다.',
	'모바일 앱 개발(Flutter)이 주 분야이지만 웹 개발도 가능합니다. AI 시대에 맞는 새로운 커리어 방향을 찾고 있으며, 조쉬님의 유튜브를 보고 AX라는 개념을 처음 알게 되었습니다.',
	'데이터 분석가로 3년 경험이 있습니다. Python과 SQL을 주로 사용하며, LLM을 활용한 데이터 분석 자동화에 관심이 있습니다. 개발 역량을 키우면서 AI 활용 능력도 강화하고 싶습니다.',
	'SI 회사에서 Java 개발 4년차입니다. 새로운 기술 스택과 AI 도구를 배우고 싶어 지원했습니다. 워터폴 방식에 지쳐서 빠르게 결과물을 만드는 환경을 원합니다. 빠른 학습 능력이 강점입니다.',
	'대학원에서 NLP를 연구했고 현재 ML 엔지니어로 일하고 있습니다. 연구보다는 실제 프로덕트를 만드는 일에 관심이 생겼습니다. Supabase와 웹 개발은 아직 익숙하지 않지만 학습 중입니다.',
	'중소기업에서 PHP + MySQL로 웹 개발을 하고 있습니다. 모던 스택으로 전환하고 싶고, AI 도구를 배워서 더 빠르게 개발하고 싶습니다. 자기 주도적으로 학습하는 편입니다.',
	'게임 개발자 출신인데, 최근 웹/AI 쪽으로 전향하고 싶어졌습니다. Unity/C# 경험 5년. 프로토타이핑은 자신 있고, 새로운 도구를 빨리 익히는 편입니다.',
];

const Q1_PASS = [
	'지원합니다.',
	'AI에 관심이 있습니다. 함께 성장하고 싶습니다.',
	'좋은 기회라고 생각합니다.',
	'연봉 조건이 좋아서 지원했습니다.',
	'친구 추천으로 지원합니다.',
	'현재 구직 중이며 다양한 곳에 지원하고 있습니다.',
	'채용 공고를 보고 지원했습니다.',
	'AI가 미래라고 생각합니다.',
	'',  // Empty — some people skip optional fields
	'',
	'새로운 환경에서 일해보고 싶습니다.',
	'성장하고 싶습니다.',
];

// Q2: 채용이 되신다면, 어떤 업무와 일과로 하루를 보낼 것 같으신가요?
const Q2_STRONG = [
	'10시 출근 후 데일리 스크럼으로 어제 성과와 오늘 목표를 공유합니다. 오전에는 진행 중인 AX 프로젝트의 클라이언트 피드백을 확인하고, 필요한 수정사항을 Claude Code로 빠르게 반영합니다. 오후에는 신규 PoC 개발에 집중하며, 고객 미팅 후 3일 내 시연 가능한 프로토타입을 목표로 합니다. 7시 퇴근 전 작업 로그를 기록하고 내일 우선순위를 정합니다.',
	'주 단위 PoC 사이클로 운영할 것 같습니다. 월요일에 클라이언트 요구사항을 분석하고 기술 스펙을 정의합니다. 화-목에는 Claude Code와 멀티에이전트를 활용해 집중 개발하며, Supabase/PostgreSQL 백엔드를 빠르게 구축합니다. 금요일에는 클라이언트 데모를 진행하고 피드백을 수집합니다. 매일 30분씩 새로운 AI 도구와 기술을 탐구하며 팀에 공유합니다.',
	'오전 데일리 스크럼 후 당일 KPI를 설정합니다. 클라이언트 프로젝트의 기술적 과제를 분석하고 Claude Code로 솔루션을 구현합니다. 점심 후에는 기존 프로젝트 안정화와 버그 수정을 진행합니다. 주 2회 클라이언트 대면 미팅에서 프로그레스 리포트와 라이브 데모를 제공합니다. Lean하게 "Done is better than perfect"을 실천하며 빠르게 배포합니다.',
	'아침 스크럼에서 팀과 방향을 맞추고, 오전에는 고객 요구사항 분석과 아키텍처 설계를 합니다. 오후에는 Claude Code와 Supabase를 활용한 구현에 딥워크로 집중합니다. 대고객 커뮤니케이션도 적극적으로 담당하고 싶습니다. 매주 금요일에는 이번 주 회고와 다음 주 계획을 세우며, 마케팅 실적도 함께 리뷰합니다.',
	'출근 후 슬랙으로 클라이언트 커뮤니케이션을 처리합니다. 10시 데일리 스크럼 후 핵심 개발 시간에 돌입합니다. Claude Code를 활용한 PoC 빌드에 3-4시간 집중 투자합니다. 오후에는 기존 프로젝트의 안정화 작업과 성능 튜닝을 하고, 필요시 클라이언트 콜을 진행합니다. Self-motivated하게 스스로 업무 범위를 설정하고 실행합니다.',
	'FDE답게 고객 현장에 밀착하는 하루를 보내고 싶습니다. 오전에는 고객사 담당자와 소통하며 니즈를 파악하고, 오후에는 Claude Code와 멀티에이전트로 빠르게 프로토타입을 만듭니다. AI/LLM API 연동과 에이전트 워크플로우 설계가 저의 강점이라 이 부분에서 팀에 기여하고 싶습니다. Supanova 등 글로벌 프로젝트에도 참여하고 싶습니다.',
];

const Q2_MAYBE = [
	'개발 업무에 집중하며, AI 도구를 활용해 효율적으로 코딩합니다. 팀 미팅에 참여하고 코드 리뷰를 합니다. 새로운 기술을 배우는 시간도 확보하고 싶습니다.',
	'오전에 개발하고 오후에 미팅하는 패턴을 선호합니다. AI 도구 학습에도 시간을 투자하고 싶습니다. Claude Code를 빨리 익혀서 PoC 개발에 기여하겠습니다.',
	'주어진 태스크에 집중해서 개발합니다. 필요하면 야근도 합니다. 빠른 결과물 도출을 중시합니다. 데일리 스크럼에 적극 참여하겠습니다.',
	'클라이언트 요구사항에 맞춰 개발합니다. 테스트 작성과 코드 품질 관리에 신경 씁니다. Jira나 노션으로 태스크 관리를 합니다.',
	'하루 8시간 중 6시간은 코딩, 1시간은 미팅, 1시간은 학습에 투자하겠습니다. 스스로 업무를 찾아서 하는 편입니다.',
	'프로젝트 매니저와 협업하여 스프린트 계획에 따라 업무를 진행합니다. 2주 단위 스프린트로 결과물을 전달합니다. Lean한 방식에 빨리 적응하겠습니다.',
	'백엔드 API 개발과 데이터베이스 설계를 주로 담당하고 싶습니다. Supabase는 아직 안 써봤지만 PostgreSQL 경험이 있어서 빨리 배울 수 있습니다.',
	'아침에 출근해서 팀원들과 소통하고, 할당된 개발 태스크를 진행합니다. AI 도구를 적극 활용해서 개발 속도를 높이겠습니다.',
];

const Q2_PASS = [
	'개발을 합니다.',
	'열심히 일하겠습니다.',
	'주어진 업무를 성실히 수행합니다.',
	'아직 잘 모르겠습니다. 배우면서 파악하겠습니다.',
	'코딩합니다.',
	'상사가 시키는 일을 합니다.',
	'',  // Empty
	'',
	'회사에서 원하는 대로 하겠습니다.',
];

// ── Resume Excerpts ────────────────────────────────────────────
// (These simulate extracted PDF text — varying quality)

const RESUME_STRONG = [
	'경력 요약: AI/ML 엔지니어 4년차. Claude Code, Cursor, Copilot 활용 경험. Supabase + SvelteKit 기반 SaaS 2개 런칭. 멀티에이전트 시스템 설계 경험. TypeScript, Python 능숙. 스타트업 CTO 경험 (팀 5명 리드).',
	'풀스택 개발자 5년차. Claude Code를 활용한 개발 자동화 전문. Next.js + Supabase로 B2B SaaS 구축. 3일 만에 MVP 프로토타이핑 가능. 클라이언트 대면 경험 다수.',
	'시니어 프론트엔드 개발자. React/Next.js/SvelteKit 전문. AI 기반 컴포넌트 자동 생성 도구 개발. Claude Code 커스텀 스킬 제작 경험. 디자인 시스템 구축 리드.',
	'데이터 엔지니어 → AI 개발자 전환. LLM 파이프라인, RAG 시스템 구축 경험. Claude API + Supabase Vector 활용. Python, TypeScript 모두 가능. 기술 블로그 운영 (월 1만 방문자).',
	'창업 경험 2회. AI 기반 프로덕트 기획부터 개발, 런칭까지 전과정 경험. Claude Code로 주 1개 PoC 제작. Cloudflare Workers + Supabase 아키텍처 설계. 투자 유치 경험.',
];

const RESUME_MAYBE = [
	'백엔드 개발자 3년차. Java Spring Boot, PostgreSQL 경험. AWS 인프라 관리. 최근 TypeScript와 AI 도구에 관심.',
	'프론트엔드 개발자 2년차. React, TypeScript 사용. 간단한 프로젝트에 ChatGPT 활용 경험. 스타트업 근무.',
	'DevOps 엔지니어 4년차. Kubernetes, Docker, CI/CD 파이프라인. AWS, GCP 경험. Python 스크립팅.',
	'모바일 개발자 (Flutter) 3년차. Firebase 경험 풍부. 웹 개발은 기본 수준. AI 도구 학습 중.',
	'풀스택 개발자 2년차. Node.js + React. 소규모 프리랜서 프로젝트 다수. 빠른 개발 가능하나 규모 있는 프로젝트 경험 부족.',
	'ML 엔지니어 2년차. PyTorch, TensorFlow 경험. 모델 학습 및 배포. 웹 개발 경험은 제한적.',
	'SI 개발자 4년차. Java, Oracle DB 경험. 대규모 시스템 유지보수. 모던 웹 기술 전환 희망.',
];

const RESUME_PASS = [
	'신입 개발자. 부트캠프 수료. HTML/CSS/JavaScript 기초.',
	'디자이너 출신. Figma 전문. 코딩은 기초 수준.',
	'경영학 전공. 기획 업무 2년. 개발 경험 없음.',
	'인턴 경험 1회. Python 기초. 졸업 예정.',
	'마케팅 담당자 3년. 데이터 분석에 관심. Excel, SQL 기초.',
];

// ── Generator ──────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function generateCandidate(index: number): {
	date: string;
	name: string;
	email: string;
	phone: string;
	resume: string;
	q1: string;
	q2: string;
	social: string;
} {
	// Distribution: ~10% strong, ~40% maybe, ~50% pass
	const roll = Math.random();
	let tier: Tier;
	if (roll < 0.10) tier = 'strong';
	else if (roll < 0.50) tier = 'maybe';
	else tier = 'pass';

	const name = randomName();
	const email = randomEmail(name, index);
	const phone = randomPhone();
	const date = randomDate();
	const social = randomSocial(index);

	let q1: string, q2: string, resume: string;

	switch (tier) {
		case 'strong':
			q1 = pick(Q1_STRONG);
			q2 = pick(Q2_STRONG);
			resume = pick(RESUME_STRONG);
			break;
		case 'maybe':
			q1 = pick(Q1_MAYBE);
			q2 = pick(Q2_MAYBE);
			resume = pick(RESUME_MAYBE);
			break;
		case 'pass':
			q1 = pick(Q1_PASS);
			q2 = pick(Q2_PASS);
			resume = pick(RESUME_PASS);
			break;
	}

	// Add some noise: maybe-tier candidates sometimes have strong answers for one question
	if (tier === 'maybe' && Math.random() < 0.2) {
		if (Math.random() < 0.5) q1 = pick(Q1_STRONG);
		else q2 = pick(Q2_STRONG);
	}

	// Some pass-tier give one decent answer
	if (tier === 'pass' && Math.random() < 0.15) {
		q1 = pick(Q1_MAYBE);
	}

	return { date, name, email, phone, resume, q1, q2, social };
}

// ── CSV Generation ─────────────────────────────────────────────

function escapeCSV(value: string): string {
	if (value.includes(',') || value.includes('"') || value.includes('\n')) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}

// Headers match the actual Tally form from Joshua's job posting
const HEADER = [
	'Submitted at',
	'이름을 기입해주세요.',
	'이메일을 기입해주세요.',
	'전화번호를 기입해주세요.',
	'이력서를 업로드해주세요. (포트폴리오는 선택)',
	'왜 함께 일하고 싶나요? 지원 배경을 알려주세요.',
	'채용이 되신다면, 어떤 업무와 일과로 하루를 보낼 것 같으신가요? 내가 해야 할 업무와 목표에 대해 이야기해주세요.',
	'소셜미디어 주소 (스레드, 링크드인, 인스타그램 등 모두 가능, 선택)',
].map(escapeCSV).join(',');

const COUNT = 200;
const rows: string[] = [HEADER];
const usedEmails = new Set<string>();

for (let i = 1; i <= COUNT; i++) {
	let candidate = generateCandidate(i);

	// Ensure unique emails
	while (usedEmails.has(candidate.email)) {
		candidate = generateCandidate(i + Math.floor(Math.random() * 10000));
	}
	usedEmails.add(candidate.email);

	const row = [
		candidate.date,
		candidate.name,
		candidate.email,
		candidate.phone,
		candidate.resume, // In real Tally this would be a URL, but we put text here for testing
		candidate.q1,
		candidate.q2,
		candidate.social,
	].map(escapeCSV).join(',');

	rows.push(row);
}

const output = rows.join('\n');
const outputPath = join(import.meta.dirname, 'tally-export-200.csv');
writeFileSync(outputPath, output, 'utf-8');

console.log(`✓ Generated ${COUNT} candidates → ${outputPath}`);

// Show tier distribution
let strong = 0, maybe = 0, pass = 0;
for (let i = 1; i < rows.length; i++) {
	const q1 = rows[i];
	if (Q1_STRONG.some(s => q1.includes(s.slice(0, 30)))) strong++;
	else if (Q1_MAYBE.some(s => q1.includes(s.slice(0, 30)))) maybe++;
	else pass++;
}
console.log(`  Approximate distribution: ~${strong} strong / ~${maybe} maybe / ~${pass} pass`);
