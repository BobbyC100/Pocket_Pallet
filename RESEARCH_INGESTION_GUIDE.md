# 📚 Research Ingestion Guide

## How to Add 20+ Research Papers to Banyan

You have **3 options** for ingesting research at scale:

---

## 🚀 Option 1: Bulk Folder Ingestion (Recommended)

**Best for:** Adding many papers at once

### How it works:
1. Drop all your research files (PDF or TXT) into `research-papers/to-ingest/`
2. Run: `npm run ingest-research`
3. Script processes all files automatically
4. Moves processed files to `research-papers/ingested/`

### Setup:

```bash
# 1. Create folders
mkdir -p research-papers/to-ingest
mkdir -p research-papers/ingested

# 2. Add your papers
# Copy all PDFs/TXT files to research-papers/to-ingest/

# 3. Run ingestion
npm run ingest-research

# That's it!
```

### File naming convention:
```
Author_Year_ShortTitle.txt
Examples:
  Nishii_2016_StrategicAlignment.txt
  Dalain_2023_GoalCongruence.txt
  Tosti_2000_OrganizationalAlignment.txt
```

### What you'll see:
```
📚 Bulk Research Ingestion
Found 20 files to ingest

Processing 1/20: Nishii_2016_StrategicAlignment.txt
  ✅ 12 chunks created
  ✅ 0 facts extracted
  ✅ Moved to ingested/

Processing 2/20: Dalain_2023_GoalCongruence.txt
  ✅ 8 chunks created
  ...

🎉 Complete! 20 papers ingested, 187 total chunks
```

---

## 🌐 Option 2: Web UI Upload

**Best for:** Adding papers one-by-one with preview

### Features:
- Drag-and-drop upload
- Preview before ingesting
- Edit metadata (author, year, title)
- Progress bar
- View ingested papers

### Access:
```
http://localhost:3000/admin/research
```

### What it looks like:
```
┌─────────────────────────────────────────┐
│  📚 Research Management                 │
│                                         │
│  Drag & Drop PDFs or TXT files here    │
│  or click to browse                    │
│                                         │
│  [Browse Files]                         │
└─────────────────────────────────────────┘

Recent Uploads:
┌──────────────────────────────────────────┐
│ ✓ Nishii (2016) - 12 chunks             │
│ ✓ Dalain (2023) - 8 chunks              │
│ ✓ Tosti (2000) - 15 chunks              │
└──────────────────────────────────────────┘
```

---

## 📡 Option 3: API Endpoint

**Best for:** Automation or integration with other tools

### Endpoint:
```
POST /api/rgrs/ingest
Content-Type: multipart/form-data
```

### Request:
```bash
curl -X POST http://localhost:3000/api/rgrs/ingest \
  -F "file=@paper.txt" \
  -F "title=Strategic Alignment" \
  -F "authors=Nishii,Khattab" \
  -F "year=2016" \
  -F "type=paper"
```

### Response:
```json
{
  "status": "success",
  "sourceId": "abc-123",
  "chunksCreated": 12,
  "factsExtracted": 0
}
```

---

## 📝 File Format Requirements

### Supported Formats:
- ✅ `.txt` - Plain text (best for now)
- ⏳ `.pdf` - Coming soon (need PDF parser)
- ⏳ `.docx` - Coming soon
- ⏳ `.md` - Markdown

### For PDFs (temporary workaround):
1. **Copy text from PDF** (Cmd+A, Cmd+C)
2. **Paste into text file**
3. **Save as `.txt`**
4. **Upload**

Or use online tool: https://pdftotext.com

---

## 🎯 Best Practices

### File Naming:
```
Author_Year_ShortTitle.txt

Good:
  Nishii_2016_StrategicAlignment.txt
  Grant_2021_TeamCollaboration.txt

Bad:
  paper1.txt
  download.txt
  Screen Shot 2024.txt
```

### Content Quality:
- ✅ Keep full text (don't summarize)
- ✅ Include abstract, introduction, findings, discussion
- ✅ Keep section headers (# Introduction, ## Methods)
- ❌ Don't include references section (too noisy)
- ❌ Don't include tables of contents
- ❌ Remove page numbers, headers, footers

### Metadata:
Fill out when uploading:
- **Title**: Full paper title
- **Authors**: Author names (comma-separated)
- **Year**: Publication year
- **Type**: paper, article, book, report, thesis
- **Journal**: Where it was published (optional)
- **DOI/URL**: Link to original (optional)

---

## 🔧 Which Option Should You Use?

| Scenario | Recommendation |
|----------|----------------|
| Adding 20 papers now | **Option 1: Bulk Script** |
| Adding papers regularly | **Option 2: Web UI** |
| Automating ingestion | **Option 3: API** |
| Just testing | **Option 1 or 2** |

---

## 🚀 Quick Start (Option 1)

**For your 20 papers:**

```bash
# 1. Create the folder
mkdir -p research-papers/to-ingest

# 2. Copy your 20 papers there
# (as .txt files for now)

# 3. Run ingestion (I'll create this script)
npm run ingest-research

# 4. Done! Check your app - citations from all 20 papers
```

---

## 💡 What Happens During Ingestion?

For each paper:
1. ✅ **Hash check** - Skip if already ingested
2. ✅ **Chunking** - Split into ~1k token chunks
3. ✅ **Embeddings** - Generate 1536-dim vectors (OpenAI)
4. ✅ **Store** - Save to PostgreSQL with pgvector
5. ⏳ **Facts** - Extract triples (optional, slow)
6. ✅ **Move** - Archive file to ingested/

**Time:** ~30-60 seconds per paper (without fact extraction)

**Cost:** ~$0.02 per paper (embeddings)

For 20 papers: ~10-20 minutes, ~$0.40

---

## 📊 After Ingestion

### Check what's in your corpus:
```bash
npm run rgrs-stats
```

**Output:**
```
📚 RGRS Corpus Statistics

Papers: 23
Chunks: 187
Facts: 0 (fact extraction disabled)
Total tokens: ~187,000

Top topics:
  - Strategic alignment (12 papers)
  - Goal congruence (8 papers)
  - Employee engagement (15 papers)
  - Culture (7 papers)
  - Performance (11 papers)
```

### Test retrieval:
```bash
npm run rgrs-test-query "How does culture affect strategy execution?"
```

**Output:**
```
Found 8 relevant chunks:

[1] Nishii (2016) - Similarity: 0.82
    "Culture shapes how employees interpret strategy..."

[2] Tosti (2000) - Similarity: 0.78
    "Cultural alignment is as important as strategic clarity..."
```

---

## 🎯 Next Steps

**I'll build you whichever option you want!**

**For bulk ingestion (Option 1), I need to:**
1. Create `bulk-ingest.ts` script
2. Add `npm run ingest-research` command
3. Set up folder structure
4. Add progress logging

**For web UI (Option 2), I need to:**
1. Create `/admin/research` page
2. Build file upload component
3. Add drag-and-drop
4. Create ingestion API endpoint

**For API (Option 3), I need to:**
1. Create `/api/rgrs/ingest` endpoint
2. Add file upload handling
3. Add metadata validation

---

## 🤔 Which Do You Want?

**Tell me and I'll build it now!** Or I can build all 3 (takes ~30 min).

**My recommendation:** Start with **Option 1** (bulk script) for your 20 papers, then add **Option 2** (web UI) for ongoing maintenance.

