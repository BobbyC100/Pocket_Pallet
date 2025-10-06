# Banyan Architecture Diagrams

Visual representations of the Banyan system architecture at different scales and perspectives.

---

## 📐 Current Architecture (MVP)

```mermaid
flowchart TD
    A[User] --> B[Web App (Next.js 14)]
    B -->|Wizard (6 prompts)| C[/POST /api/generate-brief/]
    B -->|Vision V2 Generate/Refine/Score| D[/POST /api/vision-framework-v2/*/]

    subgraph AI[AI Pipeline]
      C --> R1[Model Router\n(GPT-4 / Gemini Pro / Flash)]
      D --> R1
      R1 --> V1[Zod Validation]
      V1 --> E1[Evaluation\n(QA + Quality Scores)]
    end

    E1 --> P1[Persistence\n(Postgres via Drizzle)]
    V1 --> P1

    subgraph DB[(PostgreSQL)]
      P1 --> DOCS[(documents JSONB)]
      P1 --> EVENTS[(lensEvents / eventsAudit)]
      P1 --> EMB[(visionEmbeddings)]
    end

    B <-->|Fetch/Stream| DOCS

    subgraph Lens[Founder's Lens]
      EVENTS --> L1[Aggregation & Reflections]
      EMB --> L2[Alignment Scoring]
      L1 --> B
      L2 --> B
    end

    subgraph Exports[Exports]
      B --> X1[Markdown]
      B --> X2[PDF (jsPDF + html2canvas)]
      B --> X3[Google Docs (future)]
    end

    subgraph Ops[Observability & Scale]
      B -. events .-> PH[(PostHog)]
      B -. errors .-> SE[(Sentry)]
      R1 -. long jobs .-> WQ[Inngest Workers\n(background generation)]
    end

    subgraph Auth[Auth]
      A --> CLERK[Clerk]
      CLERK --> B
      CLERK --> P1
    end
```

**Key Characteristics:**
- Single monolith on Vercel
- Synchronous AI generation (30-40s response time)
- Direct database connections
- Simple auth flow (anonymous → authenticated)

---

## 🚀 Future Architecture (500+ Users)

```mermaid
flowchart TD
    A[User] --> CDN[Vercel Edge CDN]
    CDN --> B[Next.js App\n(UI + API Gateway)]
    
    B -->|Job Request| Q[Job Queue\nInngest/BullMQ]
    Q --> W1[Worker Pool]
    Q --> W2[Worker Pool]
    Q --> W3[Worker Pool]
    
    W1 --> AI[AI Services]
    W2 --> AI
    W3 --> AI
    
    AI -->|GPT-4 High Quality| OAI[OpenAI API]
    AI -->|Refinements + Bulk| LLM[Self-Hosted\nLlama 3.1 70B]
    
    B <-->|Read| CACHE[(Redis Cache\n5min TTL)]
    CACHE <-->|Miss| DBR[(DB Read Replica)]
    B -->|Write| DBW[(DB Primary)]
    DBR -.->|Replication| DBW
    
    subgraph Observability
      B --> LOG[Structured Logs]
      W1 --> LOG
      W2 --> LOG
      W3 --> LOG
      LOG --> SE[Sentry]
      B --> PH[PostHog]
    end
    
    subgraph Auth & Permissions
      A --> CLERK[Clerk]
      CLERK --> B
      B --> MW[Middleware\nRBAC + RLS]
      MW --> DBW
      MW --> DBR
    end
    
    subgraph Storage
      B --> S3[S3/R2\nExported PDFs]
      B --> BLOB[Blob Storage\nLarge Documents]
    end
```

**Key Changes:**
- Async job processing (no timeouts)
- Worker pools for parallel AI operations
- Read/write database split
- Redis caching layer
- Hybrid AI strategy (cost optimization)
- File storage for exports

---

## 🔐 Permission Flow (Multi-Tenant)

```mermaid
flowchart LR
    A[User Request] --> M[Middleware]
    M --> C1{Authenticated?}
    C1 -->|No| AN[Anonymous ID]
    C1 -->|Yes| U[User ID from Clerk]
    
    AN --> D1{Accessing Document?}
    U --> D1
    
    D1 -->|Yes| P[Check Permissions]
    D1 -->|No| ALLOW[Allow]
    
    P --> C2{Owner?}
    C2 -->|Yes| ALLOW
    C2 -->|No| C3{In Same Org?}
    
    C3 -->|Yes| R[Check Role]
    C3 -->|No| C4{Explicitly Shared?}
    
    R --> C5{Has Permission?}
    C5 -->|Yes| ALLOW
    C5 -->|No| DENY[403 Forbidden]
    
    C4 -->|Yes| SP[Check Share Permissions]
    C4 -->|No| DENY
    
    SP --> C6{Valid & Not Expired?}
    C6 -->|Yes| ALLOW
    C6 -->|No| DENY
    
    ALLOW --> API[Execute API Route]
    DENY --> ERR[Return Error]
```

**Permission Hierarchy:**
1. Direct ownership (always allow)
2. Organization membership + role
3. Explicit document shares
4. Deny by default

---

## 📊 Data Flow: Brief Generation

```mermaid
sequenceDiagram
    participant U as User Browser
    participant API as Next.js API
    participant V as Validator
    participant AI as AI Service
    participant DB as Database
    participant A as Analytics

    U->>API: POST /api/generate-brief<br/>(8 wizard responses)
    API->>V: Validate input
    V-->>API: ✓ Valid
    
    API->>AI: Generate Founder Brief
    API->>AI: Generate VC Summary (parallel)
    
    par GPT-4 Calls
        AI->>OpenAI: Brief prompt
        OpenAI-->>AI: Founder brief MD
        AI->>OpenAI: VC prompt
        OpenAI-->>AI: VC summary JSON
    end
    
    AI->>V: Validate VC structure
    V-->>AI: ✓ Passes Zod schema
    
    AI->>AI: Calculate quality scores
    
    AI-->>API: Return both briefs + scores
    API->>DB: Save to documents table
    API->>A: Track generation_completed
    
    API-->>U: Return briefs (JSON)
    U->>U: Render in ResultTabs
```

**Timing:**
- Input validation: <100ms
- AI generation: 15-20s (parallel calls)
- Quality scoring: 3-5s
- Database save: <200ms
- **Total: ~20-25 seconds**

---

## 🔄 Data Flow: Iterative Refinement

```mermaid
sequenceDiagram
    participant U as User Browser
    participant API as Refine API
    participant AI as AI Service
    participant DB as Database
    participant CACHE as Redis

    U->>U: Views section score: 5.2/10
    U->>U: Clicks "🎯 More Specific"
    
    U->>API: POST /api/vision-framework-v2/refine<br/>{section, action, currentContent}
    
    API->>CACHE: Get original responses
    alt Cache Hit
        CACHE-->>API: Return cached data
    else Cache Miss
        API->>DB: Fetch from DB
        DB-->>API: Original responses
        API->>CACHE: Store for 5min
    end
    
    API->>AI: Build refinement prompt
    Note over AI: Includes:<br/>- Current content<br/>- Original responses<br/>- Identified issues<br/>- Refinement action
    
    AI->>OpenAI: GPT-4 refinement
    OpenAI-->>AI: Refined content
    
    AI->>AI: Re-score section
    AI-->>API: {refinedContent, newScore}
    
    API->>DB: Update document
    API->>CACHE: Invalidate cache
    
    API-->>U: Return refined section
    U->>U: Update UI<br/>Show new score: 8.1/10
```

**Timing:**
- Cache lookup: <10ms
- AI refinement: 5-10s
- Re-scoring: 2-3s
- Database update: <200ms
- **Total: ~8-15 seconds**

---

## 🏢 Multi-Tenant Data Model

```mermaid
erDiagram
    USERS ||--o{ ORGANIZATION_MEMBERS : "belongs to"
    ORGANIZATIONS ||--o{ ORGANIZATION_MEMBERS : "has"
    ORGANIZATIONS ||--o{ DOCUMENTS : "owns"
    USERS ||--o{ DOCUMENTS : "created by"
    DOCUMENTS ||--o{ DOCUMENT_SHARES : "shared via"
    USERS ||--o{ DOCUMENT_SHARES : "shared with"
    USERS ||--o{ LENS_EVENTS : "generates"
    DOCUMENTS ||--o{ LENS_EVENTS : "tracked for"

    USERS {
        uuid id PK
        string clerk_id UK
        string anonymous_id UK
        enum auth_provider
        timestamp created_at
    }
    
    ORGANIZATIONS {
        uuid id PK
        string name
        jsonb settings
        timestamp created_at
    }
    
    ORGANIZATION_MEMBERS {
        uuid id PK
        uuid org_id FK
        uuid user_id FK
        enum role "owner|admin|editor|viewer"
        timestamp joined_at
    }
    
    DOCUMENTS {
        uuid id PK
        uuid user_id FK
        uuid organization_id FK
        enum type
        jsonb content_json
        jsonb metadata
        boolean is_public
        timestamp created_at
    }
    
    DOCUMENT_SHARES {
        uuid id PK
        uuid document_id FK
        uuid shared_with_user_id FK
        enum permission "view|edit"
        timestamp expires_at
        timestamp created_at
    }
    
    LENS_EVENTS {
        uuid id PK
        uuid user_id FK
        uuid document_id FK
        enum event_type
        jsonb metadata
        timestamp created_at
    }
```

**Access Patterns:**
1. Get user's documents: `documents.user_id = ?`
2. Get org's documents: `documents.organization_id = ?`
3. Get shared documents: `JOIN document_shares ON ...`
4. Check permission: `organization_members.role >= required_role`

---

## 🔥 Error Handling Flow

```mermaid
flowchart TD
    A[API Request] --> B{Try Block}
    B -->|Success| S[Return Success]
    B -->|Error| C{Error Type}
    
    C -->|BanyanError| E1[Known Error]
    C -->|ValidationError| E2[Validation Failed]
    C -->|AIGenerationError| E3[AI Failed]
    C -->|Unknown| E4[Unexpected Error]
    
    E1 --> L1[Log with Context]
    E2 --> L1
    E3 --> L1
    E4 --> L1
    
    L1 --> SE{Severity?}
    SE -->|Error 5xx| SEN1[Sentry: Error Level]
    SE -->|Warning 4xx| SEN2[Sentry: Warning Level]
    
    SEN1 --> R1[Return User-Friendly Message]
    SEN2 --> R1
    
    R1 --> RES[HTTP Response]
    RES --> U[User Sees Message]
    
    SEN1 -.->|Alert| T[Team Notified]
    
    style E4 fill:#ff6b6b
    style E3 fill:#ffd93d
    style E2 fill:#95e1d3
    style E1 fill:#95e1d3
```

**Error Response Format:**
```json
{
  "error": "AI generation timed out",
  "code": "AI_GENERATION_TIMEOUT",
  "statusCode": 500,
  "requestId": "req_abc123",
  "timestamp": "2025-10-05T14:30:00Z"
}
```

---

## 📈 Scaling Triggers & Actions

```mermaid
graph TB
    subgraph Metrics[Monitor These Metrics]
        M1[Generation Time]
        M2[Error Rate]
        M3[DB CPU]
        M4[API Latency]
        M5[AI Cost/User]
        M6[Queue Backlog]
    end
    
    subgraph Yellow[Yellow Zone]
        M1 -->|>50s| Y1[Review API efficiency]
        M2 -->|>3%| Y2[Check error patterns]
        M3 -->|>60%| Y3[Optimize queries]
        M4 -->|>300ms| Y4[Add caching]
        M5 -->|>$3| Y5[Review AI usage]
        M6 -->|>3min| Y6[Monitor workers]
    end
    
    subgraph Red[Red Zone - Take Action]
        M1 -->|>60s| R1[Add worker queue NOW]
        M2 -->|>5%| R2[Emergency debug]
        M3 -->|>80%| R3[Add read replica]
        M4 -->|>500ms| R4[Redis caching]
        M5 -->|>$5| R5[Implement hybrid AI]
        M6 -->|>5min| R6[Scale workers]
    end
    
    style Red fill:#ff6b6b
    style Yellow fill:#ffd93d
```

**Action Priority:**
1. Error rate → Immediate (quality issue)
2. Generation time → High (user experience)
3. DB CPU → High (prevents cascading failures)
4. API latency → Medium (performance)
5. Queue backlog → Medium (capacity)
6. AI cost → Low (financial optimization)

---

## 🧪 Testing Strategy

```mermaid
flowchart LR
    subgraph Unit[Unit Tests - Fast & Cheap]
        U1[Zod Validation]
        U2[Helper Functions]
        U3[Error Handling]
        U1 --> MOCK1[Mocked AI]
        U2 --> MOCK1
        U3 --> MOCK1
    end
    
    subgraph Integration[Integration Tests - Medium]
        I1[API Routes]
        I2[Database Ops]
        I3[Auth Flow]
        I1 --> MOCK2[Mocked AI]
        I2 --> TESTDB[(Test DB)]
        I3 --> TESTDB
    end
    
    subgraph Contract[Contract Tests - Slow & Expensive]
        C1[Golden Fixtures]
        C2[Real AI Calls]
        C3[Schema Validation]
        C2 --> REAL[Real OpenAI API]
        C1 --> REAL
    end
    
    subgraph E2E[E2E Tests - Slowest]
        E1[User Flows]
        E2[Visual Regression]
        E3[Performance]
        E1 --> BROWSER[Playwright]
        E2 --> BROWSER
    end
    
    Unit -->|95% of tests| CI[CI/CD Pipeline]
    Integration -->|4% of tests| CI
    Contract -->|1% of tests| NIGHTLY[Nightly Only]
    E2E -->|On Deploy| STAGING[Staging Env]
    
    style Unit fill:#95e1d3
    style Integration fill:#ffd93d
    style Contract fill:#ff9a76
    style E2E fill:#ff6b6b
```

**Test Pyramid:**
- **Unit**: Run every commit (1,000+ tests, <30s)
- **Integration**: Run every commit (100+ tests, ~2min)
- **Contract**: Run nightly on `main` (10-20 tests, ~5min, $2-5)
- **E2E**: Run on deploy to staging (5-10 tests, ~3min)

---

## 🌐 Deployment Pipeline

```mermaid
flowchart TD
    A[Git Push] --> B{Branch?}
    
    B -->|feature/*| F1[Run Tests]
    B -->|main| M1[Run Tests]
    
    F1 --> F2{Tests Pass?}
    F2 -->|Yes| F3[Deploy to Preview]
    F2 -->|No| F4[Notify Dev]
    
    M1 --> M2{Tests Pass?}
    M2 -->|No| M4[Block Deploy]
    M2 -->|Yes| M3[Deploy to Production]
    
    M3 --> P1[Vercel Deploy]
    P1 --> P2[Run DB Migrations]
    P2 --> P3[Warm Cache]
    P3 --> P4[Health Check]
    
    P4 -->|Fail| RB[Auto Rollback]
    P4 -->|Pass| LIVE[Live on Production]
    
    LIVE --> MON[Monitor Metrics]
    MON --> SE[Sentry Alerts]
    MON --> PH[PostHog Events]
    
    style M4 fill:#ff6b6b
    style RB fill:#ff9a76
    style LIVE fill:#95e1d3
```

**Zero-Downtime Deploy:**
1. New version deploys alongside old
2. Health checks pass
3. Traffic gradually shifts to new version
4. Old version stays up for 5min (rollback buffer)
5. Old version terminated

---

## 📱 Anonymous → Authenticated Flow

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant API as API
    participant DB as Database
    participant CLERK as Clerk

    Note over U,B: Anonymous Usage
    U->>B: Open app
    B->>B: Generate anonymous_id<br/>"anon_abc123"
    U->>API: Generate framework
    API->>DB: Save with anonymous_id
    B->>B: Store in localStorage
    
    Note over U,CLERK: User Decides to Sign Up
    U->>B: Click "Sign Up"
    B->>CLERK: Redirect to signup
    CLERK-->>B: Redirect back with userId
    
    B->>API: POST /api/migrate-anonymous-data
    Note over API: Request includes:<br/>- Clerk userId<br/>- anonymous_id from localStorage
    
    API->>DB: Check if user exists
    alt User is New
        API->>DB: INSERT new user
    end
    
    API->>DB: UPDATE documents<br/>SET user_id = ?<br/>WHERE anonymous_id = ?
    
    API->>DB: UPDATE lens_events<br/>SET user_id = ?<br/>WHERE anonymous_id = ?
    
    API-->>B: Migration complete
    B->>B: Clear localStorage
    B->>B: Set userId in session
    
    U->>B: Access documents
    B->>API: GET /api/documents
    API->>DB: SELECT WHERE user_id = ?
    DB-->>API: All user's documents
    API-->>B: Document list
    B->>U: Display documents
```

**Key Points:**
- Anonymous users get full functionality
- No data loss on signup
- Migration is atomic (all or nothing)
- Can take 2-3 devices worth of anonymous data

---

## 🎯 Component Dependency Graph

```mermaid
graph TD
    subgraph Frontend[Frontend Components]
        PW[PromptWizard]
        RT[ResultTabs]
        VF[VisionFrameworkV2Page]
        RP[RefinementPanel]
        QB[QualityBadge]
    end
    
    subgraph API[API Routes]
        GB[/generate-brief/]
        VG[/vision-framework-v2/generate/]
        VR[/vision-framework-v2/refine/]
        VS[/vision-framework-v2/score/]
        DS[/documents/save/]
    end
    
    subgraph Lib[Library Code]
        SCH[Zod Schemas]
        VAL[Validators]
        TYP[Types]
        ERR[Error Handlers]
        LOG[Logger]
    end
    
    subgraph External[External Services]
        OAI[OpenAI API]
        GEM[Gemini API]
        CL[Clerk Auth]
        DB[(PostgreSQL)]
        SE[Sentry]
        PH[PostHog]
    end
    
    PW --> GB
    PW --> VG
    VF --> VR
    VF --> VS
    RP --> VR
    
    GB --> SCH
    VG --> SCH
    VR --> SCH
    VS --> SCH
    
    SCH --> VAL
    VAL --> TYP
    
    GB --> OAI
    GB --> GEM
    VG --> OAI
    VR --> OAI
    
    GB --> ERR
    VG --> ERR
    VR --> ERR
    
    ERR --> LOG
    LOG --> SE
    
    GB --> DB
    VG --> DB
    DS --> DB
    
    PW --> PH
    VF --> PH
    
    PW --> CL
    DS --> CL
```

**Dependency Rules:**
- Frontend → API routes (HTTP)
- API routes → Lib (import)
- Lib → External (API calls)
- Never: Frontend → DB (must go through API)
- Never: Circular dependencies

---

## 📝 Notes

### How to Use These Diagrams

1. **For Onboarding:** Start with "Current Architecture" overview
2. **For Planning:** Reference "Future Architecture" and "Scaling Triggers"
3. **For Debugging:** Use "Data Flow" and "Error Handling" diagrams
4. **For Database:** Reference "Multi-Tenant Data Model"

### Updating These Diagrams

When architecture changes:
- Update relevant diagram(s)
- Add date and reason in git commit
- Update `BANYAN_ARCHITECTURE.md` to match
- Notify team in Slack/Discord

### Rendering These Diagrams

These use Mermaid syntax. View them in:
- GitHub (renders automatically)
- VS Code (with Mermaid extension)
- [Mermaid Live Editor](https://mermaid.live)
- Your documentation site

---

**Last Updated:** 2025-10-05  
**Next Review:** When hitting 500 daily users or major architecture change

