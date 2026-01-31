import { nanoid } from 'nanoid';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// ── ID Generation ──────────────────────────────────────────────

export function candidateId(): string {
	return `c_${nanoid(8)}`;
}

// ── Column Auto-Detection ──────────────────────────────────────

export interface ColumnMap {
	name: number;
	email: number;
	phone: number | null;
	resumeUrl: number | null;
	socialMedia: number | null;
	answerColumns: { index: number; question: string }[];
}

const EMAIL_PATTERNS = ['email', '이메일', 'e-mail'];
const NAME_PATTERNS = ['name', '이름', '성명', '성함'];
const PHONE_PATTERNS = ['phone', '전화', '연락처', '핸드폰', '휴대폰', '휴대전화'];
const RESUME_PATTERNS = ['resume', 'cv', '이력서', '포트폴리오', 'portfolio', 'file', '파일', '첨부'];
const SOCIAL_PATTERNS = ['linkedin', 'github', 'sns', '소셜', 'social', 'blog', '블로그', 'portfolio url'];

function matchesAny(header: string, patterns: string[]): boolean {
	const lower = header.toLowerCase();
	return patterns.some(p => lower.includes(p));
}

export function detectColumns(headers: string[]): ColumnMap {
	let name = -1;
	let email = -1;
	let phone: number | null = null;
	let resumeUrl: number | null = null;
	let socialMedia: number | null = null;
	const answerColumns: { index: number; question: string }[] = [];

	for (let i = 0; i < headers.length; i++) {
		const h = headers[i].trim();
		if (name === -1 && matchesAny(h, NAME_PATTERNS)) {
			name = i;
		} else if (email === -1 && matchesAny(h, EMAIL_PATTERNS)) {
			email = i;
		} else if (phone === null && matchesAny(h, PHONE_PATTERNS)) {
			phone = i;
		} else if (resumeUrl === null && matchesAny(h, RESUME_PATTERNS)) {
			resumeUrl = i;
		} else if (socialMedia === null && matchesAny(h, SOCIAL_PATTERNS)) {
			socialMedia = i;
		} else {
			// Skip Tally metadata columns
			const skip = ['id', 'submitted at', 'respondent id', 'submission', 'timestamp', '제출'];
			if (!skip.some(s => h.toLowerCase().includes(s)) && h.length > 0) {
				answerColumns.push({ index: i, question: h });
			}
		}
	}

	if (name === -1) throw new Error('Could not detect name column. Headers: ' + headers.join(', '));
	if (email === -1) throw new Error('Could not detect email column. Headers: ' + headers.join(', '));

	return { name, email, phone, resumeUrl, socialMedia, answerColumns };
}

// ── PDF Text Cleanup ───────────────────────────────────────────

export function cleanPdfText(raw: string): string {
	return raw
		.replace(/\r\n/g, '\n')
		.replace(/\n{3,}/g, '\n\n')          // Collapse excessive newlines
		.replace(/^\s+$/gm, '')               // Remove whitespace-only lines
		.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // Strip control chars
		.trim();
}

// ── File I/O Helpers ───────────────────────────────────────────

const DATA_DIR = join(process.cwd(), 'data');

export function ensureDataDirs(): void {
	for (const sub of ['candidates', 'evaluations', 'pdfs']) {
		const dir = join(DATA_DIR, sub);
		if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
	}
}

export function writeCandidateJson(id: string, data: Record<string, unknown>): void {
	writeFileSync(join(DATA_DIR, 'candidates', `${id}.json`), JSON.stringify(data, null, 2));
}

export function writeEvaluationJson(id: string, data: Record<string, unknown>): void {
	writeFileSync(join(DATA_DIR, 'evaluations', `${id}.json`), JSON.stringify(data, null, 2));
}

export function writeIndex(entries: Record<string, unknown>[]): void {
	writeFileSync(join(DATA_DIR, 'index.json'), JSON.stringify(entries, null, 2));
}

export function readIndex(): Record<string, unknown>[] {
	const path = join(DATA_DIR, 'index.json');
	if (!existsSync(path)) return [];
	return JSON.parse(readFileSync(path, 'utf-8'));
}

export function readCandidateJson(id: string): Record<string, unknown> | null {
	const path = join(DATA_DIR, 'candidates', `${id}.json`);
	if (!existsSync(path)) return null;
	return JSON.parse(readFileSync(path, 'utf-8'));
}

export function readEvaluationJson(id: string): Record<string, unknown> | null {
	const path = join(DATA_DIR, 'evaluations', `${id}.json`);
	if (!existsSync(path)) return null;
	return JSON.parse(readFileSync(path, 'utf-8'));
}

export function listCandidateFiles(): string[] {
	const dir = join(DATA_DIR, 'candidates');
	if (!existsSync(dir)) return [];
	const { readdirSync } = require('fs');
	return (readdirSync(dir) as string[])
		.filter((f: string) => f.endsWith('.json'))
		.map((f: string) => f.replace('.json', ''));
}
