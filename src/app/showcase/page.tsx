'use client';

import { useState } from 'react';

export default function ShowcasePage() {
  const [activeDoc, setActiveDoc] = useState<'brief' | 'framework'>('brief');

  // Sample Brief (GPT-4 generated)
  const founderBrief = `**YardBird: Dynamic Dispatch for Construction Logistics**

**The Problem We're Solving**

Material deliveries to urban construction sites are late or misplaced roughly 30% of the time, stalling crews and burning budget. For mid-market General Contractors managing $50M–$500M in annual revenue, these delays translate directly into idle crew hours, missed milestones, and eroded margins. The root cause isn't negligence—it's coordination chaos. Job sites juggle dozens of vendors, dynamic schedules, and ever-changing curb access rules, all tracked in spreadsheets and phone calls.

**Why Now**

Three forces converge to make this solvable today. First, cities like NYC, Chicago, and LA are tightening curb management and requiring digital permitting, creating both pain and a forcing function. Second, contractors are rapidly adopting software-first scheduling tools, making API integration feasible. Third, telematics from box trucks and IoT from lift equipment are finally standardized, giving us the real-time data layer we need.

**Our Solution**

YardBird is a dynamic dispatch platform that ingests purchase order data, traffic conditions, and crane/lift availability, then auto-routes deliveries and schedules curb permits. Site superintendents use our mobile app to time-stamp drop zones and flag issues; chargebacks to vendors are automatically logged when deliveries miss their window. We're not trying to own trucks or warehouses—we're the intelligent middleware that makes existing logistics predictable.

**Who We Serve & How We Win**

Our beachhead is mid-market GCs ($50M–$500M revenue) in NYC, Chicago, and LA. The buyer is typically the Director of Operations; the daily users are site supers and vendor drivers. We win by focusing maniacally on this segment before expanding horizontally. Our edge comes from deep integration with their existing scheduling systems (Procore, Buildertrend) and real-time coordination that spreadsheets can't match.

**Traction & Validation**

We have 2 paid pilots with GCs doing $200M+ in annual revenue. Across 18 active sites, we've coordinated 1,240 material drops and reduced idle crew hours by 27%. More telling: our Net Revenue Retention on pilot add-ons (new sites, additional features) is running at 118%. Early customers are expanding, not churning.

**Current Decisions & What's Hard**

The biggest tension right now is horizontal expansion vs. vertical depth. Should we build for all construction trades (electricians, plumbers) or stay laser-focused on General Contractors? We're leaning toward GCs because they control the master schedule and can mandate vendor adoption. Another challenge: we don't control every truck in the supply chain, which means our system is only as good as vendor compliance. We're solving this through carrot (better delivery windows) and stick (automated chargebacks).

**What Success Looks Like**

Financially, we're building toward a $100M+ revenue business with strong unit economics—target LTV:CAC of 5:1+ within 18 months. Operationally, success means becoming the default logistics layer for our target GCs, embedded in their daily workflow. Culturally, we want a team that moves fast but never compromises on safety or accuracy. Transparency is non-negotiable: if there's a delay, customers hear it from us first, with a plan.

**The Capabilities We Need**

To execute this vision, we need three core systems: a robust integration engine that connects to ERP/scheduling platforms without breaking; a predictive routing algorithm that accounts for traffic, permits, and site constraints; and a mobile-first interface that site supers actually want to use. On the team side, we need enterprise sales talent who understand construction ops, not just SaaS.

**Where We Are Today**

We're a team of 3: an ex-Procore PM (CEO), an ex-Uber Freight ops lead (COO), and a technical co-founder (CTO). We're post-pilot, pre-seed, with $400K in the bank, burning $35K/month—giving us about 11 months of runway. We have 2 paid customers, 18 active sites, and clear line of sight to 5 more contracts in Q1.

**The Ask**

We're raising a $2M seed round to hire 2 AEs, 2 engineers, and extend runway to 18+ months. We need capital and strategic partners who understand construction tech and can open doors to mid-market GCs in our target cities.`;

  const vcSummary = `**YardBird: Investment Summary**

**Thesis**
Mid-market construction contractors lose millions annually to delivery delays. YardBird eliminates this waste with dynamic dispatch software, reducing idle crew time by 25%+ and creating a sticky, high-NRR SaaS business.

**Market Opportunity**
The US construction industry is $1.8T annually, with logistics representing ~10% of project costs. Mid-market General Contractors ($50M–$500M revenue) in urban centers are underserved by existing tools, creating a $5B+ TAM for intelligent dispatch software.

**Product**
YardBird auto-coordinates material deliveries by integrating with scheduling platforms (Procore, Buildertrend), routing trucks based on real-time traffic/permits, and providing mobile tools for site supers to manage drop zones. The system flags delays instantly and automates vendor chargebacks.

**Traction**
- 2 paid pilots with GCs doing $200M+ in revenue
- 18 active sites, 1,240 coordinated deliveries
- 27% reduction in idle crew hours (validated)
- 118% NRR on pilot expansions

**Business Model**
SaaS pricing: $500/site/month + $2 per coordinated delivery. Target LTV:CAC of 5:1+ within 18 months. Natural expansion path from pilot sites to full GC portfolios.

**Team**
- CEO: Ex-Procore PM, deep construction software experience
- COO: Ex-Uber Freight, logistics operations expert
- CTO: Technical co-founder

**Competition & Moat**
Legacy tools (spreadsheets, basic TMS software) lack real-time coordination. Competitors like Tenna focus on equipment tracking, not delivery orchestration. YardBird's moat comes from deep integrations, network effects (more vendors = better routing), and switching costs once embedded in daily workflows.

**Financials**
- Current: $400K cash, $35K/month burn, ~11 months runway
- Raising: $2M seed for go-to-market (2 AEs, 2 engineers)
- Path to profitability: 50 sites at current pricing = $300K MRR

**Why Now**
Cities are digitizing curb management, contractors are adopting software-first workflows, and telematics are standardized. The infrastructure layer is finally ready.

**The Ask**
$2M seed to scale from 2 customers to 20+ in our target cities (NYC, Chicago, LA), prove unit economics, and position for Series A within 18 months.`;

  // Sample Vision Framework V2 (Gemini-generated)
  const visionFramework = {
    vision: "We are eliminating the waste and frustration of construction delivery delays. We envision a world where every construction site receives materials exactly when and where they're needed, turning logistics from a project risk into a competitive advantage.",
    
    strategy: [
      "Dominate the mid-market General Contractor segment in key urban centers (NYC, Chicago, LA) before expanding horizontally to other trades.",
      "Become the essential, integrated logistics layer by building deep connections into existing scheduling platforms (Procore, Buildertrend).",
      "Build network effects through vendor adoption—the more trucks in our system, the better our routing intelligence becomes.",
      "Focus on unit economics and repeatability: prove the model works at scale in one city before replicating."
    ],
    
    operating_principles: [
      "Safety first, always—no delivery is worth a workplace incident.",
      "Transparency beats opacity—if there's a delay, customers hear it from us first, with a plan.",
      "Solve for the site super, not just the ops director—if the daily user doesn't love it, it won't stick.",
      "Build for integration, not isolation—we win by connecting existing tools, not replacing them.",
      "Move fast, but measure twice—speed without accuracy creates more chaos, not less."
    ],
    
    near_term_bets: [
      {
        bet: "Prove overwhelming value for General Contractors in our three core cities before expanding to other trades.",
        owner: "CEO",
        horizon: "12mo",
        measure: "Secure 10 new GC customers and achieve >50% site adoption within 3 months of contract."
      },
      {
        bet: "Build a vendor compliance program that turns logistics partners into active participants in the network.",
        owner: "COO",
        horizon: "6mo",
        measure: "Achieve 85%+ on-time delivery rate from top 20 vendors."
      },
      {
        bet: "Develop predictive routing that accounts for traffic, permits, and lift availability with minimal manual input.",
        owner: "CTO",
        horizon: "Q2",
        measure: "Reduce manual route adjustments by 60% compared to current baseline."
      },
      {
        bet: "Hire 2 AEs who understand construction operations and can close mid-market GCs without heavy founder involvement.",
        owner: "CEO",
        horizon: "Q1",
        measure: "Close 5 new contracts with <20% founder time per deal by end of Q2."
      }
    ],
    
    metrics: [
      {
        name: "Idle Crew Hour Reduction (%)",
        target: "35%+",
        cadence: "monthly"
      },
      {
        name: "On-Time Delivery Rate",
        target: ">90%",
        cadence: "weekly"
      },
      {
        name: "Net Revenue Retention (NRR)",
        target: "120%+",
        cadence: "quarterly"
      },
      {
        name: "Sites per Customer",
        target: "Average 8+ sites within 12 months",
        cadence: "quarterly"
      },
      {
        name: "Vendor Compliance Rate",
        target: "85%+ on-time from top 20 vendors",
        cadence: "monthly"
      },
      {
        name: "Customer Churn",
        target: "<5% annually",
        cadence: "quarterly"
      },
      {
        name: "LTV:CAC Ratio",
        target: "5:1 within 18 months",
        cadence: "quarterly"
      }
    ],
    
    tensions: [
      "Horizontal expansion (all trades) vs vertical depth (GC focus only) creates strategic resource tension.",
      "Move fast to capture market share vs measure twice to ensure accuracy and safety—speed can create chaos if not managed.",
      "Premium positioning (high-quality, high-touch) vs need for rapid site adoption may create pricing pressure.",
      "Dependency on vendor compliance (we don't control trucks) vs customer expectation of 100% reliability.",
      "Building for the ops director (economic buyer) vs building for the site super (daily user) creates dual product requirements.",
      "Transparency about delays vs perception of system reliability—admitting problems early builds trust but may scare prospects."
    ]
  };

  const executiveOnePager = `# YardBird - Vision Framework

**Vision:** We are eliminating the waste and frustration of construction delivery delays. We envision a world where every construction site receives materials exactly when and where they're needed, turning logistics from a project risk into a competitive advantage.

**How We Win:**
- Dominate mid-market General Contractors in NYC, Chicago, LA before expanding
- Become the essential logistics layer through deep platform integrations
- Build network effects via vendor adoption (more trucks = smarter routing)
- Prove unit economics at scale in one city before replicating

**Cultural DNA:**
- Safety first, always—no delivery is worth a workplace incident
- Transparency beats opacity—customers hear delays from us first, with a plan
- Solve for the site super, not just the ops director
- Build for integration, not isolation
- Move fast, but measure twice—speed without accuracy creates chaos

**Current Bets (Next 12mo):**
- Prove value for GCs in 3 core cities: 10 customers, >50% site adoption (CEO)
- Build vendor compliance program: 85%+ on-time from top 20 vendors (COO)
- Predictive routing with traffic/permits: 60% reduction in manual adjustments (CTO)
- Hire 2 AEs: Close 5 contracts with <20% founder time per deal (CEO)

**Key Metrics:**
- Idle Crew Hour Reduction: 35%+ (monthly)
- On-Time Delivery Rate: >90% (weekly)
- Net Revenue Retention: 120%+ (quarterly)
- Sites per Customer: 8+ within 12 months (quarterly)
- LTV:CAC Ratio: 5:1 within 18 months (quarterly)

**Tensions to Watch:**
- Horizontal expansion vs vertical GC focus
- Speed to market vs accuracy/safety requirements
- Premium positioning vs rapid adoption needs
- Vendor dependency vs customer reliability expectations
- Building for buyer vs daily user
- Transparency about delays vs perception of system reliability`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Document Showcase</h1>
              <p className="text-gray-600 mt-1">Example Documents</p>
            </div>
            <a
              href="/"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>

      {/* Toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveDoc('brief')}
            className={`px-6 py-3 font-semibold ${
              activeDoc === 'brief'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Founder Brief
          </button>
          <button
            onClick={() => setActiveDoc('framework')}
            className={`px-6 py-3 font-semibold ${
              activeDoc === 'framework'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Vision Framework V2
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {activeDoc === 'brief' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Founder Brief */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Founder Brief</h2>
              </div>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {founderBrief}
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  <strong>Purpose:</strong> Internal narrative for founders, team, and advisors
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  <strong>Length:</strong> ~1,200 words • <strong>Reading time:</strong> 5 minutes
                </p>
              </div>
            </div>

            {/* VC Summary */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">VC Summary</h2>
              </div>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {vcSummary}
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  <strong>Purpose:</strong> Investor pitch deck companion / email intro
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  <strong>Length:</strong> ~600 words • <strong>Reading time:</strong> 2-3 minutes
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vision Framework - Full */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Full Framework</h2>
              </div>
              
              <div className="space-y-6">
                {/* Vision */}
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Vision</h3>
                  <p className="text-gray-700">{visionFramework.vision}</p>
                </div>

                {/* Strategy */}
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Strategy</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {visionFramework.strategy.map((item, i) => (
                      <li key={i} className="text-sm">{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Operating Principles */}
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Operating Principles</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {visionFramework.operating_principles.map((item, i) => (
                      <li key={i} className="text-sm">{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Near-term Bets */}
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Near-term Bets</h3>
                  <div className="space-y-3">
                    {visionFramework.near_term_bets.map((bet, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">{bet.bet}</p>
                        <div className="flex gap-4 mt-2 text-xs text-gray-600">
                          <span>Owner: {bet.owner}</span>
                          <span>Horizon: {bet.horizon}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Measure: {bet.measure}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Key Metrics</h3>
                  <div className="space-y-2">
                    {visionFramework.metrics.slice(0, 5).map((metric, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-700">{metric.name}</span>
                        <span className="text-gray-600">{metric.target}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tensions */}
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Tensions to Watch</h3>
                  <ul className="space-y-2">
                    {visionFramework.tensions.slice(0, 4).map((tension, i) => (
                      <li key={i} className="text-sm text-gray-700 pl-4 border-l-2 border-yellow-400">
                        {tension}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  <strong>Purpose:</strong> Living strategic operating system
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  <strong>Features:</strong> Editable, version-controlled, alignment checks
                </p>
              </div>
            </div>

            {/* Executive One-Pager */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Executive One-Pager</h2>
              </div>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                  {executiveOnePager}
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  <strong>Purpose:</strong> Quick reference for team / board / advisors
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  <strong>Length:</strong> 300-400 words • <strong>Reading time:</strong> 90 seconds
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

