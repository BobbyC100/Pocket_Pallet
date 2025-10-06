# 🗺️ Banyan v2.0 Roadmap: Personalized Knowledge Graphs

## 🎯 Vision

Transform Banyan from **"research-backed generation tool"** into **"personalized, evolving organizational knowledge graph"** where each founder builds their own validated map of what's true for their company.

---

## 📊 Current State (v1.0)

✅ **Research-Grounded Reasoning System (RGRS)**
- 14 research papers ingested (268 chunks)
- Vector similarity search for relevant research
- Citations in generated frameworks
- Global research corpus

✅ **Core Generation**
- Brief generation
- Vision Framework V2
- Executive one-pagers
- Quality scoring

✅ **Infrastructure**
- Database schema (claims, chunks, sources, evals)
- Bulk PDF ingestion
- Cost tracking
- Rate limiting

**Gap:** Everything is one-off. No memory. No personalization. No learning loop.

---

## 🚀 v2.0 Features: The Knowledge Graph Evolution

### 1️⃣ User-Scoped Knowledge Graph

**What:** Each founder's organization becomes its own subgraph:
```
{vision, goals, culture, strategy} ⇄ {supporting research} ⇄ {validated claims}
```

**Why:** 
- "Banyan knows me" - personalized context
- Continuity across sessions/documents
- Validated organizational truth, not just AI outputs

**How:**
- New table: `user_knowledge_graphs` or enhance `documents` with graph relationships
- Link validated claims → user org data
- Link research chunks → specific user contexts
- Embeddings for user's org metadata (vision, culture, goals)

**Impact:**
> "When they create new docs, Banyan auto-pulls the most relevant nodes from their graph."

**Technical:**
- User-scoped vector search (filter by `userId` + similarity)
- Graph traversal queries (Postgres + pgvector)
- Cache frequently-accessed user graphs

---

### 2️⃣ Evolving Knowledge Base (Library View)

**What:** `/library` or `/insights` page where founders browse everything they've validated:
- Top confirmed claims by topic
- Related research with weightings
- Historical changes in confidence/clarity

**Why:**
- Sense of ownership - "this is MY company's truth"
- Reflection tool - see patterns over time
- Reference library - revisit past insights

**UI Preview:**
```
┌─────────────────────────────────────────────────────┐
│  📚 Your Knowledge Library                          │
│                                                     │
│  🏆 Top Validated Claims                           │
│  ┌─────────────────────────────────────────────┐  │
│  │ Psychological safety drives team learning   │  │
│  │ ✅ Confirmed 3 times                        │  │
│  │ 📊 Confidence: 92%                          │  │
│  │ 📚 3 sources: Edmondson (1999), ...        │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  📈 Your Insights Over Time                        │
│  [Chart showing claim validation trends]           │
│                                                     │
│  🔍 Browse by Topic                                │
│  Strategy (12) • Culture (8) • Teams (15)         │
└─────────────────────────────────────────────────────┘
```

**Technical:**
- Aggregation queries on `evals` + `claims` tables
- Time-series analysis (claim confidence over time)
- Topic clustering (ML or manual tags)
- Export to Notion, Confluence, etc.

---

### 3️⃣ Context-Aware Generation

**What:** Future prompts retrieve from **user's own knowledge base first**, then global corpus.

**Why:**
- Every doc feels "tuned to their worldview and maturity stage"
- Consistency across documents
- Builds on past validated insights

**Flow:**
```
User generates new framework
  ↓
1. Retrieve from their validated claims (user graph)
2. Retrieve from global research corpus
3. Merge + rank by relevance + validation confidence
4. Generate with personalized context
```

**Technical:**
- Dual retrieval: `user_claims` (high weight) + `global_chunks` (lower weight)
- Rerank by validation status: confirmed > needs_citation > unsupported
- Prompt engineering: "Based on your previously validated insights..."

**Impact:**
> "It feels like I'm talking to the version of Banyan that already knows me."

---

### 4️⃣ Cross-Pollination (Cohort Insights)

**What:** Anonymized/permissioned sharing of patterns across founders:

> "Other teams with similar cultural values cited these studies..."

**Why:**
- Social proof without giving away IP
- Learn from peers at similar stage
- Discover blindspots

**Variations:**
- **Anonymous aggregates:** "20 other founders in your cohort validated this claim"
- **Permissioned sharing:** "Sarah from Acme Corp found this insight useful"
- **Pattern matching:** "Companies with your culture + stage tend to cite X"

**Technical:**
- Anonymization: hash user IDs, strip company names
- Cohort segmentation: by stage, industry, culture, size
- Similarity matching: vector embeddings of org profiles
- Privacy controls: opt-in/out, granular permissions

**Privacy-First:**
- Default: NO sharing (private knowledge graphs)
- Opt-in: Share anonymized patterns
- Control: Choose what to share (topics, not specific docs)

---

### 5️⃣ Narrative Continuity (Living Knowledge)

**What:** When a user updates their org data (goals, culture), re-evaluate past claims:

> "This shift in your values may affect 3 validated insights — review them?"

**Why:**
- Reflection as a living process
- Catch inconsistencies early
- Evolution, not just creation

**Flow:**
```
User updates "Culture: Risk-taking encouraged" → "Culture: Process-driven excellence"
  ↓
Banyan scans validated claims:
  - "Psychological safety enables risk-taking" ← ⚠️ Misalignment detected
  - "Innovation requires experimentation" ← ⚠️ May need review
  - "Clear processes reduce errors" ← ✅ Now more relevant
  ↓
User sees: "3 insights may need review based on your culture shift"
```

**Technical:**
- Change detection: diff org data on updates
- Semantic similarity: compare new vs old values
- Impact analysis: find claims linked to changed fields
- Notification system: "Review needed" badges

**Impact:**
> "Turns strategy from a static document into a living system."

---

## 🔄 Implementation Sequence

### Phase 1: Foundation (Current - Next 2 Weeks)
1. ✅ RGRS working (retrieval + citations)
2. ✅ 14 papers ingested
3. 🚧 Test citations in real frameworks
4. 🚧 Build Review UI for claim validation

### Phase 2: User Graphs (2-4 Weeks)
1. **Claim Tracking** - Save claims during generation
2. **User-Scoped Storage** - Link claims → users → validated research
3. **Retrieval v2** - Dual-path (user graph + global corpus)
4. **Basic Library View** - Show user's validated claims

### Phase 3: Personalization (4-6 Weeks)
1. **Context-Aware Generation** - Use user graph in prompts
2. **Library UI Polish** - Topics, search, time-series
3. **Narrative Continuity** - Detect org changes, flag affected claims

### Phase 4: Network Effects (6-8 Weeks)
1. **Cohort Analysis** - Segment users by stage/industry
2. **Cross-Pollination** - Anonymized pattern sharing
3. **Privacy Controls** - Opt-in/out, granular permissions

---

## 📊 Success Metrics

### v1.0 (Current)
- ✅ Citations per framework
- ✅ Research coverage (papers used)
- ✅ Generation quality scores

### v2.0 (Knowledge Graphs)
- **Personalization:** % of generations using user's validated claims
- **Engagement:** Return visits to Library view
- **Validation:** % of claims reviewed (confirmed vs unsupported)
- **Continuity:** Narrative coherence score (old vs new docs)
- **Network:** Cohort insights discovered (cross-pollination)

---

## 🎯 The Big Picture

**v1.0:** "AI generates research-backed strategies"  
**v2.0:** "You build your company's evolving knowledge graph, Banyan helps you navigate it"

**The Shift:**
- From **generation** → **curation**
- From **one-off** → **continuous**
- From **generic** → **personalized**
- From **output** → **living system**

---

## 💡 Why This Matters

### For Founders:
- **Memory:** Banyan remembers your journey
- **Consistency:** Every doc builds on validated truth
- **Evolution:** Reflects growth and pivots
- **Confidence:** "This isn't just AI - it's MY validated insights"

### For Banyan:
- **Stickiness:** Knowledge graphs = high switching costs
- **Network Effects:** Cross-pollination creates value
- **Differentiation:** Not just another AI tool
- **Moat:** Personalized, validated knowledge is hard to replicate

---

## 🚧 Technical Considerations

### Database Changes Needed:
```typescript
// New tables or enhancements
user_knowledge_graphs {
  user_id
  graph_data: jsonb  // nodes + edges
  embedding: vector  // for similarity
}

user_claims {
  user_id
  claim_id
  validation_status
  confidence_history: jsonb
}

org_snapshots {
  user_id
  snapshot_date
  vision, goals, culture, strategy
  embedding: vector
}

cohort_patterns {
  cohort_id
  pattern_type
  aggregated_data: jsonb
  anonymized: boolean
}
```

### Infrastructure:
- **Vector Search:** User-scoped + global (multi-index)
- **Graph Queries:** Traverse relationships efficiently
- **Change Detection:** Background job for narrative continuity
- **Analytics:** Time-series, cohort analysis
- **Privacy:** Encryption, anonymization, audit logs

---

## 🤔 Open Questions

1. **Validation Threshold:** How many confirmations = "validated"?
2. **Graph Size:** Limit nodes per user? Archiving?
3. **Conflict Resolution:** What if user validates conflicting claims?
4. **Cohort Definition:** How to segment users fairly?
5. **Pricing:** Free tier vs premium (graph size, cross-pollination)?

---

## 🎉 When This Is Done...

**Users will say:**
> "Banyan isn't just a tool - it's my company's institutional memory. Every strategy doc, every pivot, every validated insight - it's all connected. When I create something new, it feels like Banyan already knows our story."

**That's the vision.** 🚀

---

## 📝 Next Steps

1. **Test current system** with 14 papers
2. **Build Review UI** to start collecting validations
3. **Phase 2:** User graphs + Library view
4. **Iterate** based on founder feedback

---

**Updated:** October 6, 2025  
**Status:** Phase 1 (Foundation) - Testing in progress

