# BANYAN_ARCHITECTURE.md  
**Plain-Language Overview for Founders & Stakeholders**  

---

## 🧭 Executive Summary

- **Stable today:** Banyan's single-app stack on Vercel easily supports up to ~300 users.  
- **Next 90 days:** Focus on reliability (Sentry), visibility (PostHog), and basic organization permissions.  
- **Next 12 months:** Add background workers, automated testing, and analytics refinement.  
- **Longer term:** Scale only when metrics justify it — DB pooling, caching, sharding.  
- **Principle:** Build for 300 users now; scale for 10,000 only when the data says so.  

---

## 🧩 Five Key Questions

| # | Question | Current State | What's Next | Trigger Metric | Owner / Lead |
|---|-----------|----------------|--------------|----------------|---------------|
| 1 | **Access Control for Multiple Companies** | Clerk handles identity; docs owned by individuals | Add `organizations` + `memberships` + role-based access (Owner/Admin/Editor/Viewer) | >2 companies sharing docs | Eng / Ops |
| 2 | **Error Handling & Tracking** | Console logs only | `BanyanError` type + Sentry + structured logs | >5% 5xx errors/day | Eng |
| 3 | **Testing AI Content** | Manual bash script | Golden fixtures, mocked AI, nightly real runs | Two regressions/week | QA |
| 4 | **Analytics Data** | Some events in DB | Dual-write to PostHog + internal dashboards | Can't answer "where do users drop off?" | Product |
| 5 | **Breaking Up the App** | Monolith on Vercel | Add worker queue, pooling, caching as load grows | See timeline | Eng / Ops |

---

## 🕒 Architecture Timeline

### **Today (0 – 100 users)**
- Current stack (Next.js + Drizzle + Clerk) fits perfectly.  
- Focus: product polish, Sentry, analytics setup.  
- **Cost:** ≈ $50/month.  

### **3 – 6 Months (100 – 500 users)**
- Add Inngest worker queue for AI generation.  
- Formalize golden-fixture testing.  
- **Cost:** ≈ $150/month.  

### **6 – 12 Months (500 – 2,000 users)**
- Add DB connection pooling / read replica.  
- Build PostHog dashboards + daily Lens summaries.  
- **Cost:** ≈ $300/month.  

### **12 – 18 Months (2,000 – 5,000 users)**
- Add Redis caching + hybrid AI refinements.  
- Roll out multi-company workspaces.  
- **Cost:** ≈ $800/month.  

### **18+ Months (5,000+ users)**
- Database sharding + dedicated AI infra.  
- Optionally split AI workers from main app.  
- **Cost:** ≈ $2,000+/month.  

---

## 📊 Decision Framework

### When to Invest in Each Layer

#### **Error Handling (Sentry)**
- **Do Now** if: Any production errors cause user data loss
- **Priority:** HIGH (foundational)
- **Effort:** 2 days
- **ROI:** Catch bugs before users report them

#### **Organization Permissions**
- **Do Now** if: 2+ teams want to share workspaces
- **Priority:** HIGH (enables B2B)
- **Effort:** 3-5 days
- **ROI:** Unlocks team plans, higher ARPU

#### **Analytics (PostHog)**
- **Do Now** if: Can't answer "where do users drop off?"
- **Priority:** HIGH (product decisions)
- **Effort:** 1 day
- **ROI:** Data-driven feature prioritization

#### **Worker Queue (Inngest)**
- **Wait until:** 100+ daily generations OR timeouts occur
- **Priority:** MEDIUM (performance)
- **Effort:** 3-4 days
- **ROI:** Eliminates timeouts, better UX

#### **Automated Testing**
- **Wait until:** 2+ regressions per week
- **Priority:** MEDIUM (velocity)
- **Effort:** 5-7 days
- **ROI:** Ship faster with confidence

#### **Database Scaling**
- **Wait until:** DB CPU >70% OR queries >500ms
- **Priority:** LOW (premature)
- **Effort:** 2-3 days per optimization
- **ROI:** Handles 10x more users

#### **Self-Hosted AI**
- **Wait until:** AI costs >$1,000/month
- **Priority:** LOW (cost optimization)
- **Effort:** 10-15 days
- **ROI:** 50-90% cost reduction on refinements

---

## 🎯 Next 90 Days: Priorities

### Week 1-2: Error Foundation
```
✓ Set up Sentry account
✓ Create BanyanError types
✓ Add error handler to all API routes
✓ Test error alerting
```

### Week 3-4: Analytics Pipeline
```
✓ Set up PostHog account
✓ Implement dual-write pattern
✓ Track 10 key events (generation, refinement, signup, etc.)
✓ Build basic dashboard
```

### Week 5-6: Permission System
```
✓ Add organizations table
✓ Add organization_members table
✓ Create middleware for access checks
✓ Update documents to support orgId
```

### Week 7-8: Testing Framework
```
✓ Create golden fixtures (5-10 examples)
✓ Mock OpenAI responses
✓ Write 20-30 unit tests
✓ Set up CI/CD test runs
```

### Week 9-12: Buffer & Polish
```
✓ Fix issues from new systems
✓ Document new patterns
✓ Train team on error tracking
✓ Review analytics insights
```

---

## 💰 Cost Projections

### Current Monthly Costs
- Vercel Hobby: $0
- Database (Supabase free): $0
- OpenAI API: ~$50-100
- Clerk free tier: $0
- **Total: ~$50-100/month**

### After 90-Day Buildout
- Vercel Pro: $20
- Database: $25
- OpenAI API: ~$200
- Sentry: $0 (free tier, 5k events/mo)
- PostHog: $0 (free tier, 1M events/mo)
- Inngest: $0 (free tier)
- **Total: ~$245-270/month**

### At 1,000 Daily Users
- Vercel Pro: $20
- Database + Replica: $150
- OpenAI API: ~$1,500
- Redis (Upstash): $50
- Sentry: $26 (team tier)
- PostHog: $0 (still under 1M/mo)
- Inngest: $100
- **Total: ~$1,846/month**

### At 5,000 Daily Users
- Vercel Pro: $20
- Database (scaled): $500
- OpenAI API: ~$3,000 (with hybrid AI: $1,200)
- Redis: $100
- Sentry: $80
- PostHog: $200
- Inngest: $300
- CDN/Storage: $100
- **Total: ~$2,500-4,300/month**

*Note: AI costs dominate at scale. Hybrid approach saves $1,800/month at 5K users.*

---

## 🏗️ Technical Deep Dives

For detailed technical implementation of each question, see:
- **`ARCHITECTURE_QUESTIONS.txt`** - Complete plain-language explanations with analogies
- **`src/lib/db/schema.ts`** - Current database structure
- **`README.md`** - Overall system architecture
- **`TESTING_GUIDE.md`** - Current testing approach

---

## 🚦 Health Metrics to Track

### Product Health
- Time-to-generation: <40s (p95)
- Error rate: <2%
- Framework quality score: >7.5 avg
- User refinement rate: >40%

### Infrastructure Health
- API response time: <200ms (p95)
- Database query time: <100ms (p95)
- Worker queue backlog: <5 min wait
- Database CPU: <60%

### Business Health
- Free → Paid conversion: >5%
- Monthly AI cost per user: <$2
- Support tickets per user: <0.1
- DAU/MAU ratio: >30%

### When to Scale
| Metric | Yellow Zone | Red Zone | Action |
|--------|-------------|----------|--------|
| Generation time | >50s | >60s | Add workers |
| Error rate | >3% | >5% | Emergency debug |
| DB CPU | >60% | >80% | Add replica |
| API p95 latency | >300ms | >500ms | Add caching |
| AI cost/user | >$3 | >$5 | Hybrid AI |
| Queue wait | >3min | >5min | Scale workers |

---

## 🎓 Learning Resources

### For Team Onboarding
1. Read `README.md` - Understand the product
2. Read `DESIGN_SYSTEM.md` - Learn design patterns
3. Read this doc - Understand growth path
4. Read `ARCHITECTURE_QUESTIONS.txt` - Deep dive on decisions

### For Stakeholders
1. Read "Executive Summary" above
2. Review "Next 90 Days: Priorities"
3. Review "Cost Projections"
4. Ask questions!

---

## ✅ Decision Log

### Why This Stack?
- **Next.js**: Server components + API routes = one codebase
- **Drizzle**: Lightweight ORM, great TypeScript support
- **Clerk**: Anonymous → authenticated flow is hard; they solved it
- **Postgres**: JSONB + full-text search + battle-tested
- **Vercel**: Zero-config deploys, excellent DX

### Why NOT This Stack?
- **GraphQL**: Overkill for CRUD operations
- **Microservices**: Premature for <1K users
- **NoSQL**: Need relational structure for permissions
- **Self-hosted**: Want to focus on product, not DevOps

### Key Architectural Principles
1. **Optimize for change** - Use JSONB for flexible documents
2. **Delay abstraction** - Monolith until pain points appear
3. **Instrument everything** - Can't optimize what you can't measure
4. **Plan for 3x growth** - Not 10x or 100x
5. **Buy before build** - Use Sentry/PostHog vs building dashboards

---

## 🤝 Contributing

This is a living document. Update it when:
- Architectural decisions change
- Cost structure shifts significantly
- New scaling challenges emerge
- Timeline estimates need revision

**Last Updated:** 2025-10-05  
**Next Review:** 2025-11-05 (or when we hit 500 users)  
**Maintainer:** Engineering Lead

---

## 📞 Questions?

- **Technical questions:** Check `ARCHITECTURE_QUESTIONS.txt`
- **Setup questions:** Check `README.md`
- **Testing questions:** Check `TESTING_GUIDE.md`
- **Everything else:** Ask the team!

---

**Remember:** These are good problems to have. They mean you're growing. 🚀

