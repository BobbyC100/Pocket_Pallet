# Research-Grounded Reasoning System (RGRS) v0.1
## Design Document

**Version:** 0.1  
**Date:** October 2025  
**Status:** Phase 1 Implementation Complete  
**Owner:** Banyan Engineering

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Architecture](#architecture)
4. [Core Components](#core-components)
5. [Data Pipeline](#data-pipeline)
6. [Retrieval Strategy](#retrieval-strategy)
7. [Learning Loop](#learning-loop)
8. [Glossary of Terms](#glossary-of-terms)
9. [Phase Roadmap](#phase-roadmap)
10. [Success Metrics](#success-metrics)
11. [Technical Specifications](#technical-specifications)
12. [References](#references)

---

## Executive Summary

The Research-Grounded Reasoning System (RGRS) transforms Banyan from a generative AI tool into a **research-backed strategic advisor**. By grounding every insight in peer-reviewed organizational science, RGRS provides:

- **Explainability:** Every claim traceable to source research
- **Trust:** Citations to peer-reviewed studies
- **Learning:** System improves with human feedback
- **Differentiation:** Only research-backed strategy platform

### Core Innovation

RGRS combines **semantic retrieval** (vector embeddings) with **symbolic reasoning** (knowledge graph facts) to deliver multi-hop, explainable insights that improve over time through human-in-the-loop feedback.

### Competitive Moat

No competitor offers research-grounded strategy generation. This is Banyan's defensible advantage.

---

## System Overview

### The Problem

Standard LLMs hallucinate, lack citations, and don't improve from feedback. Users can't trust where insights come from.

### The Solution

**RGRS** retrieves relevant research chunks, extracts structured facts, and uses both to generate evidence-backed strategic frameworks. Human feedback trains a preference model to improve retrieval and generation quality.

### How It Works

```
Research Papers
    ↓ Ingestion
Chunks + Embeddings + Facts
    ↓ Retrieval
Top-K Relevant Chunks (with fact boosting)
    ↓ Generation
Framework with Citations
    ↓ Human Feedback
Learning Loop (RLHF-lite)
```

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      BANYAN PLATFORM                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                     │
│  │   User Input │─────▶│  Generation  │                     │
│  │  (Wizard)    │      │   Pipeline   │                     │
│  └──────────────┘      └───────┬──────┘                     │
│                                 │                             │
│                                 ▼                             │
│                    ┌────────────────────┐                    │
│                    │   RGRS Retrieval   │◀───────┐          │
│                    └─────────┬──────────┘        │          │
│                              │              [Feedback]       │
│                              │                    │          │
│         ┌────────────────────┼────────────────────┤          │
│         │                    │                    │          │
│         ▼                    ▼                    │          │
│  ┌─────────────┐      ┌─────────────┐     ┌─────┴──────┐   │
│  │   Vector    │      │    Facts    │     │   Human    │   │
│  │   Search    │      │   Boosting  │     │  Review    │   │
│  │  (pgvector) │      │    (KG)     │     │   (HITL)   │   │
│  └─────────────┘      └─────────────┘     └────────────┘   │
│         │                    │                               │
│         └────────┬───────────┘                               │
│                  ▼                                            │
│         ┌──────────────────┐                                 │
│         │  Research Chunks │                                 │
│         │  + Citations     │                                 │
│         └─────────┬────────┘                                 │
│                   │                                           │
│                   ▼                                           │
│         ┌──────────────────┐                                 │
│         │  LLM Generation  │                                 │
│         │  (GPT-4)         │                                 │
│         └─────────┬────────┘                                 │
│                   │                                           │
│                   ▼                                           │
│         ┌──────────────────┐                                 │
│         │  Framework with  │                                 │
│         │   Citations      │                                 │
│         └──────────────────┘                                 │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Database Schema

```sql
-- Research sources (papers, articles, books)
sources
  - id (uuid)
  - title (text)
  - authors (text[])
  - type (enum: paper, article, book, report, thesis)
  - published_at (timestamp)
  - url (text)
  - vetting_score (float 0-1)
  - content_hash (text, unique)
  
-- Text chunks with embeddings
chunks
  - id (uuid)
  - source_id (uuid → sources)
  - content (text)
  - section (text: Abstract, Introduction, Findings, etc.)
  - chunk_index (int)
  - embedding (vector[1536])
  - token_count (int)
  
-- Extracted facts (triples)
facts
  - id (uuid)
  - chunk_id (uuid → chunks)
  - subject (text)
  - predicate (text)
  - object (text)
  - confidence (float 0-1)
  - evidence (text)
  
-- Generated claims with citations
claims
  - id (uuid)
  - session_id (uuid)
  - content (text)
  - section (text: vision, strategy, culture, etc.)
  - confidence (float 0-1)
  - supporting_chunks (uuid[])
  - label (enum: confirmed, needs_citation, unsupported)
  
-- Human feedback for learning
evals
  - id (uuid)
  - claim_id (uuid → claims)
  - reviewer_id (text)
  - label (enum: confirmed, needs_citation, unsupported)
  - notes (text)
  
-- Banyan Alignment Index scores
bai_scores
  - id (uuid)
  - session_id (uuid)
  - goal_congruence (float 0-1)
  - role_clarity (float 0-1)
  - metric_coherence (float 0-1)
  - voice_safety (float 0-1)
  - doc_consistency (float 0-1)
  - composite_bai (float 0-1)
```

---

## Core Components

### 1. Ingestion Pipeline

**Purpose:** Transform research papers into searchable chunks with embeddings and facts.

**Location:** `src/lib/rgrs/ingestion.ts`

**Functions:**
- `chunkText()` - Split text into ~1k token chunks with 100-token overlap
- `generateEmbeddings()` - Create vector embeddings using OpenAI
- `extractFacts()` - Use LLM to extract subject-predicate-object triples
- `ingestFromText()` - End-to-end ingestion pipeline

**Process:**
1. Compute content hash (deduplication)
2. Split text into semantic chunks
3. Detect section headings (Abstract, Findings, etc.)
4. Generate embeddings (text-embedding-3-small, 1536 dims)
5. Extract structured facts (GPT-4, optional)
6. Store in database with pgvector index

**Performance:**
- ~10-30 chunks per paper
- ~30-60 seconds per paper (with fact extraction)
- ~5-10 seconds per paper (without fact extraction)

---

### 2. Retrieval Engine

**Purpose:** Find relevant research chunks using hybrid semantic + symbolic search.

**Location:** `src/lib/rgrs/retrieval.ts`

**Functions:**
- `retrieveChunks()` - Core retrieval with fact boosting
- `retrieveForGeneration()` - Optimized for framework generation
- `formatCitations()` - Format citations for display
- `getCitation()` - Get structured citation metadata

**Retrieval Algorithm:**

```
Step 1: Vector Similarity Search
  - Convert query to embedding
  - Cosine similarity search using pgvector
  - Filter by minSimilarity threshold (default 0.6)
  
Step 2: Fact Boosting (optional)
  - For each chunk, count matching facts
  - Matching = fact subject/object contains boost concept
  - Boost concepts: alignment, goal_congruence, role_clarity, etc.
  - Add 0.1 per matching fact
  
Step 3: Section Weighting
  - Findings: 2.0x
  - Discussion, Results: 1.8x
  - Introduction, Methods: 1.0x
  - References: 0.1x
  
Step 4: Re-Ranking
  finalScore = (similarity + factBoost) × sectionWeight
  
Step 5: Return Top-K
  - Sort by finalScore
  - Return top K chunks (default 8-12)
  - Include citation metadata
```

**Performance Targets:**
- p95 latency ≤ 700ms @ ≤25 papers
- p99 latency ≤ 1200ms @ ≤25 papers

---

### 3. Generation Integration

**Purpose:** Enhance LLM prompts with research context.

**Location:** `src/app/api/vision-framework-v2/generate-stream/route.ts`

**Integration Points:**
- **Step 0:** Retrieve research insights before generation
- **Prompt Enhancement:** Add research context to system message
- **Citation Tracking:** Store citations in session metadata
- **Graceful Degradation:** Continue generation even if retrieval fails

**Research Context Format:**

```
## Research-Backed Insights

The following findings from organizational science research inform your framework:

**[1] {Title}** ({Section})
{Content excerpt}

**[2] {Title}** ({Section})
{Content excerpt}

---

When crafting the framework, incorporate insights from the research above 
where relevant. Reference specific findings to add credibility.
```

---

### 4. Citation Display

**Purpose:** Show users which research informed their framework.

**Location:** `src/components/ResearchCitations.tsx`

**Features:**
- Research citations panel at top of framework
- Color-coded confidence scores:
  - Green (≥80%): Strong alignment
  - Blue (≥60%): Moderate alignment
  - Gray (<60%): Weak alignment
- Clickable source links (if URLs provided)
- Author attribution and section context
- Tooltip explanation of confidence scores

**UI Design:**
- Minimalist, non-intrusive
- Only shows when citations exist
- Responsive layout
- Accessible (ARIA labels, keyboard navigation)

---

## Data Pipeline

### Ingestion Flow

```
1. Source Document (PDF/Text)
   ↓
2. Content Hash Check (deduplication)
   ↓
3. Text Chunking (~1k tokens, 100 overlap)
   ↓
4. Section Detection (Abstract, Findings, etc.)
   ↓
5. Embedding Generation (1536-dim vectors)
   ↓
6. Database Insert (chunks + embeddings)
   ↓
7. Fact Extraction (optional, GPT-4)
   ↓
8. Database Insert (facts)
   ↓
9. HNSW Index Update (automatic)
```

### Retrieval Flow

```
1. User Input (wizard responses)
   ↓
2. Query Construction (semantic + keywords)
   ↓
3. Embedding Generation (query vector)
   ↓
4. Vector Search (pgvector cosine similarity)
   ↓
5. Fact Boosting (symbolic augmentation)
   ↓
6. Section Weighting (prioritize Findings)
   ↓
7. Re-Ranking (final scores)
   ↓
8. Top-K Selection (8-12 chunks)
   ↓
9. Citation Formatting
   ↓
10. Return to Generation Pipeline
```

### Learning Flow (Phase 2+)

```
1. Framework Generated (with claims)
   ↓
2. Store Claims in Database
   ↓
3. Present to Human Reviewer
   ↓
4. Collect Feedback (confirmed/needs_citation/unsupported)
   ↓
5. Store in Evals Table
   ↓
6. Train Preference Re-Ranker (weekly batch)
   ↓
7. Update Retrieval Weights
   ↓
8. Deploy Updated Model
```

---

## Retrieval Strategy

### Why Hybrid Retrieval?

**Semantic Only (Embeddings):**
- ✅ Captures conceptual similarity
- ❌ Misses explicit relationships
- ❌ No symbolic reasoning

**Symbolic Only (Facts/KG):**
- ✅ Explicit relationships
- ✅ Multi-hop reasoning
- ❌ Misses conceptual nuance
- ❌ Requires perfect fact extraction

**Hybrid (Semantic + Symbolic):**
- ✅ Best of both worlds
- ✅ Robust to imperfect fact extraction
- ✅ Explainable (facts show "why")
- ✅ Flexible (can tune balance)

### Tuning Parameters

| Parameter | Default | Range | Purpose |
|-----------|---------|-------|---------|
| `topK` | 8 | 5-20 | Number of chunks to retrieve |
| `minSimilarity` | 0.6 | 0.4-0.8 | Minimum cosine similarity threshold |
| `factBoostWeight` | 0.1 | 0.0-0.3 | How much to boost per matching fact |
| `sectionWeights` | See code | 0.1-2.0 | Multiplier per section type |
| `boostConcepts` | See code | N/A | Keywords for fact boosting |

### Optimization Strategies

**For Precision (fewer, better chunks):**
- Increase `minSimilarity` (0.7-0.8)
- Decrease `topK` (5-6)
- Increase `factBoostWeight` (0.15-0.2)

**For Recall (more coverage):**
- Decrease `minSimilarity` (0.5-0.6)
- Increase `topK` (10-15)
- Decrease `factBoostWeight` (0.05-0.1)

**For Speed:**
- Disable fact boosting
- Use lower `topK`
- Cache query embeddings

---

## Learning Loop

### Phase 1: Human-in-the-Loop Feedback

**Goal:** Collect human labels on generated claims to train preference model.

**Process:**
1. Generate framework with citations
2. Extract individual claims (statements)
3. Present claims to reviewer with context
4. Reviewer labels: Confirmed / Needs Citation / Unsupported
5. Store feedback in `evals` table

**UI Components (Phase 2):**
- Claim review panel (inline editing)
- Citation suggestion tool
- Batch review interface
- Reviewer dashboard

### Phase 2: Preference Re-Ranker

**Goal:** Learn which retrievals lead to confirmed claims.

**Approach:** Lightweight gradient-boosted tree (LightGBM) trained on:

**Features:**
- Similarity score
- Number of matching facts
- Section type
- Source vetting score
- Chunk position in paper
- Query-chunk keyword overlap

**Labels:**
- Positive: Chunks that supported confirmed claims
- Negative: Chunks that led to unsupported claims

**Training:**
- Weekly batch training on accumulated feedback
- 80/20 train/validation split
- Optimize for AUC-ROC
- Deploy as SQL function or app-level scorer

### Phase 3: Banyan Alignment Index (BAI)

**Goal:** Quantify strategic alignment across 5 dimensions.

**Formula:**
```
BAI = (goal_congruence + role_clarity + metric_coherence + 
       voice_safety + doc_consistency) / 5
```

**Signals:**
1. **Goal Congruence (0-1):** Do individual and team goals align with strategy?
2. **Role Clarity (0-1):** Do people understand their contribution?
3. **Metric Coherence (0-1):** Do metrics reinforce strategic priorities?
4. **Voice Safety (0-1):** Do people re-speak after idea rejection?
5. **Doc Consistency (0-1):** Do vision, strategy, culture docs reinforce each other?

**Measurement:**
- Parse generated framework text
- Extract goal statements, role descriptions, metrics, culture signals
- Use research-backed heuristics + LLM analysis
- Store in `bai_scores` table
- Display in dashboard

---

## Glossary of Terms

| Term | Definition |
|------|-------------|
| **Alignment** | The degree to which strategy, culture, and operations reinforce the same intent and goals. |
| **BAI (Banyan Alignment Index)** | A composite score (0–1) derived from five signals: goal congruence, role clarity, metric coherence, voice safety, and document consistency. |
| **Chunk** | A text segment (≈1000 tokens) from a source document, embedded for semantic retrieval. |
| **Claim** | A statement Banyan generates in an output doc, supported by one or more evidence chunks and facts. |
| **Coherence Index (CI)** | A structural metric that measures vertical linkage (Strategy → Policy → Task → Metric) in the knowledge graph. |
| **Fact (Triple)** | A structured statement extracted from text in the form `(subject, predicate, object)` representing relationships (e.g., *alignment increases engagement*). |
| **Fact Quality Gate** | A validation process ensuring extracted triples meet ≥90% accuracy before inclusion in the reasoning layer. |
| **GraphRAG** | Graph-based Retrieval-Augmented Generation—combines vector search with graph reasoning for multi-hop retrieval and explainability. |
| **HITL (Human-in-the-Loop)** | Feedback process where humans validate or correct AI-generated claims, improving model reasoning over time. |
| **Knowledge Graph (KG)** | Structured representation of entities (e.g., strategy, policy, metric) and their relationships, enabling reasoning across multiple documents. |
| **Multi-Hop Reasoning** | The ability to connect multiple related facts (hops) to form complex, explainable conclusions (e.g., *strategy → leadership → engagement*). |
| **pgvector** | A PostgreSQL extension that enables vector similarity search, allowing Banyan to retrieve relevant text embeddings efficiently. |
| **Preference Re-Ranker** | Lightweight ML model that learns to prioritize retrievals and evidence based on human feedback signals. |
| **RAG (Retrieval-Augmented Generation)** | Technique where external documents are retrieved to ground AI responses in factual evidence. |
| **RLHF (Reinforcement Learning from Human Feedback)** | Training process where AI systems use human preference data to improve their alignment with desired outputs. |
| **SHACL / ShEx** | Schema validation languages used to enforce structural and logical integrity within the Knowledge Graph. |
| **Voice Safety** | Behavioral dimension of psychological safety: employees' willingness to re-speak after idea rejection, supported by specific managerial explanations. |
| **Explanation Specificity Score** | A quantitative signal (0–1) reflecting how specific and policy-backed a managerial explanation is. Used as a reward signal in model learning. |
| **Wilson Sampling** | Statistical technique for estimating accuracy or confidence intervals using a small validation subset instead of exhaustive manual audit. |

---

## Phase Roadmap

### Phase 1: Foundation (COMPLETE ✅)

**Goal:** Prove RGRS works end-to-end with citations in UI.

**Deliverables:**
- [x] Database schema with pgvector
- [x] Ingestion pipeline (chunks + embeddings + facts)
- [x] Retrieval engine (semantic + fact boosting)
- [x] Generation integration (research context in prompts)
- [x] Citation display (ResearchCitations component)
- [x] Test script (validation)

**Success Criteria:**
- [x] ≥80% of frameworks show ≥1 citation
- [x] p95 retrieval ≤700ms @ ≤25 papers
- [ ] User testing: ≥75% rate citations "clear/helpful" (pending)

**Timeline:** October 2025 (2 weeks) - DONE

---

### Phase 2: Learning Loop (Q4 2025)

**Goal:** System improves from human feedback.

**Deliverables:**
- [ ] Claim extraction and storage
- [ ] Review UI for human feedback
- [ ] Preference re-ranker training pipeline
- [ ] Re-ranking in retrieval
- [ ] BAI v1 scoring system

**Success Criteria:**
- ≥100 human-labeled claims collected
- Re-ranker AUC-ROC ≥0.75
- ≥15% increase in confirmed claims (vs baseline)

**Timeline:** 4 weeks

---

### Phase 3: Graph Reasoning (Q1 2026)

**Goal:** Multi-hop reasoning using knowledge graph.

**Deliverables:**
- [ ] Entity extraction and linking
- [ ] Knowledge graph construction
- [ ] Multi-hop query engine
- [ ] Graph-based fact validation
- [ ] SHACL/ShEx schema validation

**Success Criteria:**
- Answer complex queries requiring 2+ hops
- ≥85% fact precision (with quality gate)
- ≥3x increase in explainability depth

**Timeline:** 6 weeks

---

### Phase 4: Scale (Q2 2026)

**Goal:** Support 100+ papers, real-time updates, custom corpora.

**Deliverables:**
- [ ] Migrate to dedicated vector DB (Pinecone/Weaviate)
- [ ] Background ingestion workers
- [ ] Custom corpus upload (per organization)
- [ ] Real-time research updates
- [ ] Advanced analytics dashboard

**Success Criteria:**
- Support ≥100 papers with <1s p95 latency
- Custom corpus ingestion ≤5 minutes
- Enterprise customers using custom corpora

**Timeline:** 8 weeks

---

## Success Metrics

### Phase 1 Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Explainability** | ≥80% of frameworks show ≥1 citation | Count sessions with citations |
| **Performance** | p95 ≤700ms @ ≤25 papers | Monitor API logs (retrieval step) |
| **Fact Precision** | ≥90% verified | Wilson sampling on 50-triple gold set |
| **User Trust** | ≥75% rate "clear/helpful" | Post-generation survey (5-point scale) |
| **Citation Coverage** | ≥80% of claims have supporting chunk | Automated analysis of generated text |

### Phase 2 Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Learning Rate** | ≥15% improvement in confirmed claims | Compare pre/post re-ranker deployment |
| **Feedback Volume** | ≥100 labeled claims | Count evals table rows |
| **Re-Ranker AUC** | ≥0.75 | Validation set performance |
| **BAI Adoption** | ≥50% of sessions view BAI score | Track UI interactions |

### Phase 3 Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Multi-Hop Success** | ≥70% correct on 2-hop queries | Test set of complex questions |
| **Fact Quality** | ≥90% precision at quality gate | Human audit of 100 random facts |
| **Coherence Index** | ≥0.8 average CI across frameworks | Automated graph analysis |

---

## Technical Specifications

### Models

| Component | Model | Cost | Rationale |
|-----------|-------|------|-----------|
| **Embeddings** | text-embedding-3-small (1536d) | $0.02/1M tokens | Fast, cheap, HNSW-compatible |
| **Fact Extraction** | gpt-4-turbo-preview | $0.01/1k tokens | High accuracy, JSON mode |
| **Generation** | gpt-4-turbo-preview | $0.03/1k tokens | Best reasoning, citation aware |
| **Re-Ranker** | LightGBM (custom) | $0 (self-hosted) | Fast inference, interpretable |

### Infrastructure

| Component | Service | Config | Notes |
|-----------|---------|--------|-------|
| **Database** | Supabase (Postgres) | Free tier → Pro | pgvector enabled |
| **Vector Index** | HNSW (pgvector) | 1536 dims, cosine | Auto-updated on insert |
| **API** | Next.js API routes | Vercel Edge | Streaming responses |
| **Storage** | Supabase Storage | 1GB free → 100GB Pro | For PDF uploads (Phase 4) |

### Performance Optimization

**Retrieval (p95 ≤700ms):**
- HNSW index on embeddings (10x faster than IVFFlat)
- Composite indexes on source_id, section, created_at
- Connection pooling (max 10 concurrent)
- Query result caching (5-minute TTL)

**Generation (p95 ≤15s):**
- Streaming responses (progressive rendering)
- Parallel section generation (where independent)
- Prompt caching for repeated queries

**Ingestion (5-10s per paper):**
- Batch embedding generation (100 at a time)
- Optional fact extraction (disable for speed)
- Parallel chunk processing

### Cost Estimates

**Phase 1 (≤25 papers, 5M tokens):**
- Embeddings: ~$0.10
- Fact extraction: ~$50 (optional, can disable)
- Generation (per framework): ~$0.15
- **Total setup:** ~$50-60
- **Total per framework:** ~$0.15

**Phase 4 (100 papers, 20M tokens):**
- Embeddings: ~$0.40
- Fact extraction: ~$200 (background job)
- Generation (per framework): ~$0.15-0.20
- Vector DB: ~$100/month (dedicated)
- **Total setup:** ~$300-400
- **Total per framework:** ~$0.20

---

## References

### Core Research Papers

1. **Dalain, M. (2023).** "Nurturing Employee Engagement Through Goal Congruence." *Journal of Organizational Psychology.*
   - **Key Finding:** Goal congruence is strongest predictor of engagement (β = 0.52, p < 0.001)
   - **Relevance:** Informs BAI goal_congruence signal

2. **Nishii et al. (2016).** "Strategy-Culture-HR Alignment and Organizational Performance."
   - **Key Finding:** Firms with high alignment show 23% higher employee engagement
   - **Relevance:** Validates multi-dimensional alignment framework

3. **Tosti & Jackson (2000).** "Organizational Alignment: The 7-S Model Applied."
   - **Key Finding:** Alignment framework linking strategy to operations
   - **Relevance:** Structural template for coherence index

### Technical References

4. **Lewis et al. (2020).** "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks." *NeurIPS.*
5. **Edge et al. (2024).** "From Local to Global: A Graph RAG Approach to Query-Focused Summarization." *Microsoft Research.*
6. **Ouyang et al. (2022).** "Training language models to follow instructions with human feedback." *OpenAI.*

### Implementation Docs

- **RGRS Quick Start:** `RGRS_QUICK_START.md`
- **RGRS Progress Report:** `RGRS_PHASE1_PROGRESS.md`
- **RGRS Citations Integration:** `RGRS_CITATIONS_INTEGRATION_COMPLETE.md`
- **Test Script:** `test-rgrs.ts`

---

## Appendix A: Database Migration

**Migration File:** `drizzle/0003_add_rgrs_tables.sql`

**Run Migration:**
```bash
node run-rgrs-migration.mjs
```

**Verify Migration:**
```sql
-- Check pgvector extension
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check HNSW index
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE indexname = 'idx_chunks_embedding';

-- Count ingested data
SELECT 
  COUNT(*) as sources,
  (SELECT COUNT(*) FROM chunks) as chunks,
  (SELECT COUNT(*) FROM facts) as facts
FROM sources;
```

---

## Appendix B: API Examples

### Ingest a Research Paper

```typescript
import { ingestFromText } from '@/lib/rgrs/ingestion';

const result = await ingestFromText(
  'Nurturing Employee Engagement Through Goal Congruence',
  ['Dalain, M.'],
  fullTextContent,
  {
    type: 'paper',
    publishedAt: new Date('2023-01-01'),
    url: 'https://doi.org/10.1234/example',
    vettingScore: 0.95,
    extractFacts: true, // Set false for 3x speed
  }
);

console.log(`Created ${result.chunksCreated} chunks, extracted ${result.factsExtracted} facts`);
```

### Retrieve Research for Generation

```typescript
import { retrieveForGeneration } from '@/lib/rgrs/retrieval';

const chunks = await retrieveForGeneration(
  {
    vision_purpose: 'Align team goals with company mission',
    vision_endstate: 'Every employee understands contribution',
    core_principles: 'Transparency, clarity, feedback',
  },
  'strategy' // Section being generated (optional)
);

console.log(`Found ${chunks.length} relevant chunks`);
chunks.forEach((c, i) => {
  console.log(`[${i+1}] ${c.chunk.source.title} (similarity: ${c.similarity.toFixed(2)})`);
});
```

### Format Citations

```typescript
import { formatCitations, getCitation } from '@/lib/rgrs/retrieval';

// Human-readable text
const citationText = formatCitations(chunks);
console.log(citationText);
// Output:
// [1] Dalain, M. "Nurturing Employee Engagement..." (Findings, similarity: 0.85)
// [2] Nishii et al. "Strategy-Culture-HR Alignment" (Discussion, similarity: 0.78)

// Structured metadata
const citation = getCitation(chunks[0]);
console.log(citation);
// Output:
// {
//   title: "Nurturing Employee Engagement...",
//   authors: ["Dalain, M."],
//   section: "Findings",
//   url: "https://doi.org/...",
//   confidence: 0.85
// }
```

---

## Appendix C: Troubleshooting

### Common Issues

**Issue: "No research insights found"**
- **Cause:** Empty corpus or query too different from research
- **Fix:** Ingest more papers or lower `minSimilarity` threshold

**Issue: Slow fact extraction**
- **Cause:** GPT-4 API latency (5-10s per chunk)
- **Fix:** Disable fact extraction (`extractFacts: false`) or run in background

**Issue: Low similarity scores**
- **Cause:** Query mismatch or poor chunk quality
- **Fix:** Review chunk content, adjust query construction, add more research

**Issue: Migration fails**
- **Cause:** pgvector extension not enabled
- **Fix:** `CREATE EXTENSION IF NOT EXISTS vector;` in Supabase SQL editor

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | Oct 2025 | Banyan Eng | Initial design doc with Phase 1 complete |

---

**This is a living document.** Update as RGRS evolves through phases 2-4.

**Questions?** Check `RGRS_QUICK_START.md` or `RGRS_PHASE1_PROGRESS.md` for implementation details.


