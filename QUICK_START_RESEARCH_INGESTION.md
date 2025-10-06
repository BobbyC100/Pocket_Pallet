# 🚀 Quick Start: Adding Your 20 Research Papers

## ✅ What's Ready

✅ **Folders created** - `research-papers/to-ingest/` and `research-papers/ingested/`  
✅ **Bulk script built** - Auto-processes all files in folder  
✅ **NPM command ready** - `npm run ingest-research`  
✅ **Deduplication working** - Won't re-ingest same papers  
✅ **Auto-metadata extraction** - Pulls info from filenames  

---

## 📝 How to Add Your 20 Papers

### Step 1: Just Use Your PDFs!

**✅ PDFs now work directly - no conversion needed!**

Just drop your `.pdf` files into the folder. The script automatically extracts text.

**Both formats supported:**
- ✅ `.pdf` - Auto-extracts text
- ✅ `.txt` - Plain text files

**Optional: Convert to TXT for cleaner results**

If PDF extraction doesn't work well, you can convert:

**Option A: Copy-Paste from PDF**
1. Open PDF, Cmd+A, Cmd+C
2. Paste into text editor
3. Save as `Author_Year_Title.txt`

**Option B: Use Online Tool**
- https://pdftotext.com

**Option C: Command Line**
```bash
pdftotext yourpaper.pdf Author_Year_Title.txt
```

---

### Step 2: Name Your Files

**Format:** `Author_Year_Title.pdf` or `Author_Year_Title.txt`

**Examples:**
```
Grant_2021_TeamDynamics.pdf          ✅ PDF
Cameron_2018_OrganizationalChange.pdf
Edmondson_1999_PsychologicalSafety.txt  ✅ TXT
Hackman_2002_LeadingTeams.pdf
```

**Don't worry about perfect formatting** - the script is smart:
- ✅ `Grant_2021_TeamDynamics.txt` → Extracts all metadata
- ✅ `grant-2021.txt` → Still finds year
- ✅ `teamdynamics_paper.txt` → Uses filename as title

---

### Step 3: Drop Files in Folder

```bash
# Your 20 papers go here:
research-papers/to-ingest/
  ├── Paper1.txt
  ├── Paper2.txt
  ├── ...
  └── Paper20.txt
```

---

### Step 4: Run One Command

```bash
npm run ingest-research
```

**That's it!** The script will:
1. Process all 20 files
2. Extract metadata
3. Create embeddings (~30-60s each)
4. Store in database
5. Move to `ingested/` folder

---

## 📊 What You'll See

```
📚 Bulk Research Ingestion

📄 Found 20 file(s) to ingest

[1/20] Processing: Grant_2021_TeamDynamics.txt
  Title: Team Dynamics
  Authors: Grant
  Year: 2021
  Size: 12.3 KB
  ✅ Chunks created: 14
  ✅ Facts extracted: 0
  ✅ Moved to ingested/

[2/20] Processing: Cameron_2018_Change.txt
  ...

📊 INGESTION SUMMARY
✅ Successful: 20/20
❌ Failed: 0/20
📦 Total chunks created: 187

✨ Done!
```

---

## ⏱️ Time & Cost

**For 20 papers:**
- **Time:** 10-20 minutes
- **Cost:** ~$0.40 (OpenAI embeddings)
- **Storage:** ~5-10 MB in database

**Per paper:**
- **Time:** 30-60 seconds
- **Cost:** $0.02
- **Chunks:** ~8-15 (depends on length)

---

## 🧪 Test Your New Papers

After ingestion:

1. **Go to your app:** `http://localhost:3001/new`
2. **Generate a framework**
3. **Look for citations** - you should now see citations from your 20 papers!

Example:
```
📚 Research-Backed Insights          3 Sources

① Grant (2021) - Team Dynamics              75%
② Cameron (2018) - Organizational Change    68%
③ Edmondson (1999) - Psychological Safety   62%
```

---

## 🎯 Pro Tips

### Clean Up PDFs First
Remove these sections to get better chunks:
- ❌ Table of contents
- ❌ References list
- ❌ Appendices
- ❌ Page headers/footers

Keep these:
- ✅ Abstract
- ✅ Introduction
- ✅ Findings
- ✅ Discussion
- ✅ Implications

### Better Metadata
If the auto-detection doesn't work well, manually edit the first few lines of your `.txt` file:

```txt
Title: The Human Side of Strategy
Authors: Grant, A., Cameron, K., Edmondson, A.
Year: 2021

[rest of content...]
```

The script will use these if present!

### Batch by Topic
Process similar papers together:
- First 10: Strategy papers
- Next 5: Culture papers
- Last 5: Team dynamics

This helps you test retrieval per topic.

---

## ❓ Troubleshooting

### "No files found"
```bash
# Check you're in the right folder
ls research-papers/to-ingest/

# Should show your .txt files
```

### "File too short"
- Files must be > 100 characters
- Check file isn't empty or corrupt

### "Already exists"
- Paper was already ingested (deduplication working!)
- The script won't re-ingest duplicates
- If you want to re-ingest, delete from database first

### Failed to ingest X files
- Check console for specific error
- Failed files stay in `to-ingest/` for retry
- Fix the issue and run again

---

## 📚 Current Corpus

After adding your 20 papers, you'll have:

**Papers:** 23 (Dalain + Nishii + Tosti + your 20)  
**Chunks:** ~200-250 total  
**Topics:** Diverse organizational science coverage  

---

## 🚀 What's Next

**After ingestion:**
1. ✅ Test retrieval - generate frameworks
2. ✅ Check citation diversity - different papers cited?
3. ✅ Adjust similarity threshold if needed (in `retrieval.ts`)
4. ⏳ Later: Build Web UI (Option 2) for ongoing management

**Future enhancements:**
- 📄 PDF upload (no manual conversion)
- 🎨 Web UI with drag-and-drop
- 📊 Corpus management dashboard
- 🔍 Search your research corpus
- 📈 Citation analytics

---

## 💪 You're Ready!

**When you have your 20 papers as `.txt` files:**

```bash
# 1. Drop them here
ls research-papers/to-ingest/
# Should show 20 files

# 2. Run ingestion
npm run ingest-research

# 3. Wait 10-20 minutes

# 4. Test in app!
```

**Let me know when you're ready to add them!** 🎉

