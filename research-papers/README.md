# 📚 Research Papers - Bulk Ingestion

## Quick Start

### 1. Add Your Papers

Drop your research papers (as `.pdf` or `.txt` files) into the `to-ingest/` folder:

```
research-papers/
  └── to-ingest/
      ├── Nishii_2016_StrategicAlignment.pdf  ✅ PDFs work!
      ├── Dalain_2023_GoalCongruence.pdf
      ├── Grant_2021_TeamDynamics.txt         ✅ TXT files too!
      └── ... (add all 20 here)
```

### 2. Run Ingestion

```bash
npm run ingest-research
```

That's it! The script will:
- ✅ Process all files in `to-ingest/`
- ✅ Extract metadata (title, authors, year)
- ✅ Create embeddings
- ✅ Store in database
- ✅ Move files to `ingested/` folder

### 3. Test in Your App

Generate a framework and see citations from your new papers!

---

## File Naming Convention

**Format:** `Author_Year_Title.txt`

**Examples:**
```
Nishii_2016_StrategicAlignment.txt
Dalain_2023_GoalCongruence.txt
TostiJackson_2000_OrganizationalAlignment.txt
Grant_2021_TeamCollaboration.txt
```

**The script will:**
- Extract author from first part
- Extract year from second part
- Extract title from remaining parts
- Auto-detect if format doesn't match

---

## File Format Support

✅ **PDF** - Automatically extracts text (no conversion needed!)  
✅ **TXT** - Plain text files  

**Just drop PDFs directly!** The script auto-extracts text from PDFs using `pdf-parse`.

### Optional: Converting PDFs to Text (for cleaner results)

If you want more control over the text extraction:

**Option 1: Copy-Paste (Quick)**
1. Open PDF
2. Select all (Cmd+A)
3. Copy (Cmd+C)
4. Paste into text editor
5. Save as `.txt`

**Option 2: Online Tool**
- https://pdftotext.com
- Upload PDF → Download TXT

**Option 3: Command Line (Mac/Linux)**
```bash
pdftotext paper.pdf paper.txt
```

---

## What Gets Ingested?

✅ **Keep:**
- Abstract
- Introduction
- Key findings
- Discussion
- Implications
- Conclusion

❌ **Remove (optional, but cleaner):**
- Table of contents
- References section
- Page numbers
- Headers/footers

---

## Troubleshooting

### "No files found"
- Check you put files in `to-ingest/` folder
- Make sure files end with `.txt`

### "File too short"
- File must be > 100 characters
- Check file isn't empty

### "Failed to ingest"
- Check console for specific error
- Failed files stay in `to-ingest/` for retry

---

## Cost

**Per paper:**
- Embeddings: ~$0.02
- Time: ~30-60 seconds

**For 20 papers:**
- Total cost: ~$0.40
- Total time: ~10-20 minutes

---

## Advanced

### Enable Fact Extraction

Edit `scripts/bulk-ingest-research.ts`:

```typescript
extractFacts: true  // Change from false
```

**Note:** Much slower (~5-10 min per paper) and more expensive (~$1 per paper)

### Check What's Ingested

```bash
npm run rgrs-test
```

Shows your corpus size and tests retrieval.

---

## Questions?

Check: `RESEARCH_INGESTION_GUIDE.md` for full documentation

