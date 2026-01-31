#!/usr/bin/env tsx

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { parse } from 'csv-parse/sync';
import pdfParse from 'pdf-parse';
import {
	candidateId,
	detectColumns,
	cleanPdfText,
	ensureDataDirs,
	writeCandidateJson,
	writeIndex,
	readIndex,
} from './utils.js';

// ── Config ─────────────────────────────────────────────────────

const args = process.argv.slice(2);
const csvFlagIdx = args.indexOf('--csv');
const csvPath = csvFlagIdx !== -1 ? args[csvFlagIdx + 1] : args[0];

if (!csvPath) {
	console.error('Usage: npx tsx src/ingest.ts --csv <path-to-tally-csv>');
	process.exit(1);
}

const resolvedCsv = resolve(csvPath);
if (!existsSync(resolvedCsv)) {
	console.error(`File not found: ${resolvedCsv}`);
	process.exit(1);
}

// ── Parse CSV ──────────────────────────────────────────────────

console.log(`\nParsing CSV: ${resolvedCsv}`);

const csvContent = readFileSync(resolvedCsv, 'utf-8');
const records: string[][] = parse(csvContent, {
	skip_empty_lines: true,
	relax_column_count: true,
});

if (records.length < 2) {
	console.error('CSV has no data rows');
	process.exit(1);
}

const headers = records[0];
const rows = records.slice(1);
const columnMap = detectColumns(headers);

console.log(`Detected columns:`);
console.log(`  Name: "${headers[columnMap.name]}"`);
console.log(`  Email: "${headers[columnMap.email]}"`);
if (columnMap.phone !== null) console.log(`  Phone: "${headers[columnMap.phone]}"`);
if (columnMap.resumeUrl !== null) console.log(`  Resume: "${headers[columnMap.resumeUrl]}"`);
if (columnMap.socialMedia !== null) console.log(`  Social: "${headers[columnMap.socialMedia]}"`);
console.log(`  Answer columns: ${columnMap.answerColumns.length}`);
for (const ac of columnMap.answerColumns) {
	console.log(`    - "${ac.question}"`);
}

console.log(`\nProcessing ${rows.length} candidates...`);

// ── Track seen emails for dedup ────────────────────────────────

const seenEmails = new Set<string>();
const existingIndex = readIndex();
for (const entry of existingIndex) {
	// Don't re-ingest existing candidates
	if (typeof entry === 'object' && entry !== null && 'email' in entry) {
		seenEmails.add((entry as { email: string }).email.toLowerCase());
	}
}

// ── Process Rows ───────────────────────────────────────────────

ensureDataDirs();

let ingested = 0;
let skipped = 0;
let failed = 0;
const indexEntries: Record<string, unknown>[] = [...existingIndex];

for (let i = 0; i < rows.length; i++) {
	const row = rows[i];
	const name = row[columnMap.name]?.trim() || '';
	const email = row[columnMap.email]?.trim().toLowerCase() || '';

	if (!name || !email) {
		console.log(`  [${i + 1}] Skipped: missing name or email`);
		skipped++;
		continue;
	}

	if (seenEmails.has(email)) {
		console.log(`  [${i + 1}] Skipped: duplicate email ${email}`);
		skipped++;
		continue;
	}
	seenEmails.add(email);

	const id = candidateId();
	const phone = columnMap.phone !== null ? row[columnMap.phone]?.trim() || '' : '';
	const resumeUrl = columnMap.resumeUrl !== null ? row[columnMap.resumeUrl]?.trim() || '' : '';
	const socialMedia = columnMap.socialMedia !== null ? row[columnMap.socialMedia]?.trim() || '' : '';

	const answers = columnMap.answerColumns.map(ac => ({
		question: ac.question,
		answer: row[ac.index]?.trim() || '',
	}));

	// ── Download + Parse PDF ─────────────────────────────────

	let resumeText = '';
	if (resumeUrl && (resumeUrl.startsWith('http://') || resumeUrl.startsWith('https://'))) {
		try {
			const response = await fetch(resumeUrl);
			if (response.ok) {
				const buffer = Buffer.from(await response.arrayBuffer());
				const pdfPath = join(process.cwd(), 'data', 'pdfs', `${id}.pdf`);
				writeFileSync(pdfPath, buffer);

				const pdfData = await pdfParse(buffer);
				resumeText = cleanPdfText(pdfData.text);
				console.log(`  [${i + 1}] ${name} — PDF parsed (${resumeText.length} chars)`);
			} else {
				console.log(`  [${i + 1}] ${name} — PDF download failed: ${response.status}`);
				failed++;
			}
		} catch (err) {
			console.log(`  [${i + 1}] ${name} — PDF error: ${(err as Error).message}`);
			failed++;
		}
	} else {
		console.log(`  [${i + 1}] ${name} — No PDF URL`);
	}

	const candidate = {
		id,
		name,
		email,
		phone,
		resumeUrl,
		resumeText,
		answers,
		socialMedia,
		ingestedAt: new Date().toISOString(),
	};

	writeCandidateJson(id, candidate);
	indexEntries.push({
		id,
		name,
		email,
		score: null,
		verdict: null,
		summary: null,
	});
	ingested++;
}

writeIndex(indexEntries);

// ── Summary ────────────────────────────────────────────────────

console.log(`\n✓ Ingestion complete`);
console.log(`  Ingested: ${ingested}`);
console.log(`  Skipped: ${skipped}`);
if (failed > 0) console.log(`  Failed PDFs: ${failed}`);
console.log(`  Total in index: ${indexEntries.length}`);
