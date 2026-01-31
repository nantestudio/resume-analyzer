---
name: ingest
description: Parse Tally.so CSV export and download/extract PDF resumes into candidate JSON files.
---

# /ingest — Tally Data Ingestion

You are helping ingest job application data from a Tally.so CSV export.

## Process

1. **Ask for the CSV file path**:
   "Tally에서 내보낸 CSV 파일 경로를 알려주세요. (예: ./applications.csv)"

   Use the AskUserQuestion tool with a text input.

2. **Verify the file exists** by reading the first few lines. Show the detected column headers.

3. **Run the ingestion script**:
   ```
   npx tsx src/ingest.ts --csv <path>
   ```

4. **Report results** in Korean:
   - How many candidates were ingested
   - How many were skipped (duplicates, missing data)
   - How many PDFs failed to download/parse
   - Total candidates now in the system

5. **Suggest next step**: "이제 `/screen`으로 전체 지원자를 평가할 수 있습니다."

## Edge Cases

- If the CSV path doesn't exist, ask again
- If the script fails, show the error and suggest fixes
- If there are encoding issues (common with Korean CSVs), suggest: "CSV가 UTF-8 인코딩인지 확인해주세요"
- If PDFs fail to download, the candidates are still ingested (just without resume text)

## Important

- Always run from the project root directory
- The script handles deduplication by email automatically
- PDF files are cached in data/pdfs/ so re-running won't re-download
