'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { VisionFrameworkV2, NearTermBet, Metric } from '@/lib/vision-framework-schema-v2';
import RefinementPanel from './RefinementPanel';
import QualityBadge from './QualityBadge';
import LensBadge from './LensBadge';
import ResearchCitations, { Citation } from './ResearchCitations';

// Save indicator component
const SaveIndicator = ({ saving, dirty }: { saving: boolean; dirty: boolean }) => (
  <span className="ml-2 inline-flex items-center gap-1 text-xs text-banyan-text-subtle">
    {saving ? 'Saving…' : dirty ? 'Unsaved changes' : 'Saved'}
    <span className={`h-2 w-2 rounded-full ${saving ? 'bg-amber-400 animate-pulse' : dirty ? 'bg-amber-400' : 'bg-emerald-500'}`} />
  </span>
);

type TabKey = 'edit' | 'onepager' | 'qa';

interface VisionFrameworkV2PageProps {
  companyId?: string;
  embedded?: boolean; // Hide header when embedded in SOS
  editOnly?: boolean; // Only show edit tab, hide others
}

export default function VisionFrameworkV2Page({ companyId = 'demo-company', embedded = false, editOnly = false }: VisionFrameworkV2PageProps) {
  const [framework, setFramework] = useState<VisionFrameworkV2 | null>(null);
  const [executiveOnePager, setExecutiveOnePager] = useState<string>('');
  const [qaResults, setQaResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);
  // Default to edit tab when editOnly, QA tab when embedded
  const [activeTab, setActiveTab] = useState<TabKey>(editOnly ? 'edit' : embedded ? 'qa' : 'edit');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [refiningSection, setRefiningSection] = useState<string | null>(null);
  const [originalResponses, setOriginalResponses] = useState<any>(null);
  const [sectionQualities, setSectionQualities] = useState<Record<string, any>>({});
  const [lensScores, setLensScores] = useState<any>(null);
  const [scoringLens, setScoringLens] = useState(false);
  const [researchCitations, setResearchCitations] = useState<Citation[]>([]);

  // Load framework from session storage on mount
  useEffect(() => {
    const draftData = sessionStorage.getItem('visionFrameworkV2Draft');
    console.log('🔍 Session storage raw data:', draftData ? draftData.substring(0, 200) : 'null');
    
    if (draftData) {
      try {
        const parsed = JSON.parse(draftData);
        console.log('📦 Parsed data keys:', Object.keys(parsed));
        console.log('🎯 Framework exists:', !!parsed.framework);
        console.log('📄 Framework vision:', parsed.framework?.vision);
        console.log('📊 Framework strategy length:', parsed.framework?.strategy?.length);
        
        if (parsed.framework) {
          setFramework(parsed.framework);
          console.log('✅ Framework set with', Object.keys(parsed.framework).length, 'keys');
        }
        if (parsed.executiveOnePager) {
          setExecutiveOnePager(parsed.executiveOnePager);
          console.log('✅ One-pager set, length:', parsed.executiveOnePager.length);
        }
        if (parsed.metadata?.qaChecks) {
          setQaResults(parsed.metadata.qaChecks);
          console.log('✅ QA results set');
        }
        if (parsed.originalResponses) {
          setOriginalResponses(parsed.originalResponses);
          console.log('✅ Original responses captured for refinement');
        }
        if (parsed.qualityScores) {
          setSectionQualities(parsed.qualityScores);
          console.log('✅ Quality scores loaded:', Object.keys(parsed.qualityScores));
        }
        if (parsed.lensScores) {
          setLensScores(parsed.lensScores);
          console.log('✅ Lens scores loaded');
        }
        if (parsed.metadata?.researchCitations) {
          setResearchCitations(parsed.metadata.researchCitations);
          console.log('✅ Research citations loaded:', parsed.metadata.researchCitations.length);
        }
        console.log('✅ Loaded Vision Framework V2 from session');
      } catch (error) {
        console.error('❌ Failed to parse draft data:', error);
      }
    } else {
      console.log('⚠️ No visionFrameworkV2Draft in session storage');
    }
  }, []);

  // Tab URL hash management
  const tabOrder: TabKey[] = ['edit', 'onepager', 'qa'];

  useEffect(() => {
    const hash = (typeof window !== 'undefined' && window.location.hash.replace('#', '')) as TabKey;
    if (hash && tabOrder.includes(hash)) setActiveTab(hash);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') window.history.replaceState(null, '', `#${activeTab}`);
  }, [activeTab]);

  // Autosave when framework changes
  useEffect(() => {
    if (!framework) return;
    setIsDirty(true);
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      if (!isDirty) return;
      await handleSave();
      setIsDirty(false);
    }, 2500);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [framework]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLensScore = async () => {
    if (!framework) return;
    
    setScoringLens(true);
    
    try {
      // Combine all framework content for scoring
      const content = `
Vision: ${framework.vision}

Strategy:
${framework.strategy?.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}

Operating Principles:
${framework.operating_principles?.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}

Near-Term Bets:
${framework.near_term_bets?.map((b: any, i: number) => `${i + 1}. ${b.bet} (Owner: ${b.owner}, Timeline: ${b.horizon}, Measure: ${b.measure})`).join('\n')}

Metrics:
${framework.metrics?.map((m: any, i: number) => `${i + 1}. ${m.name}: ${m.target} (${m.cadence})`).join('\n')}

Tensions:
${framework.tensions?.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n')}
      `.trim();

      const response = await fetch('/api/lens/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          documentId: framework.companyId,
          documentType: 'vision_framework_v2'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to score document');
      }

      const result = await response.json();
      setLensScores(result);
      
      // Store in session storage
      const draftData = JSON.parse(sessionStorage.getItem('visionFrameworkV2Draft') || '{}');
      draftData.lensScores = result;
      sessionStorage.setItem('visionFrameworkV2Draft', JSON.stringify(draftData));
      
      console.log('✅ Lens scored:', result);
    } catch (error) {
      console.error('❌ Lens scoring failed:', error);
    } finally {
      setScoringLens(false);
    }
  };

  const handleSave = async () => {
    if (!framework) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const response = await fetch(`/api/vision-framework-v2/${companyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(framework)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save');
      }

      setMessage({ type: 'success', text: 'Vision Framework saved!' });
      
      // Analytics: Track save event
      try {
        const draftData = JSON.parse(sessionStorage.getItem('visionFrameworkV2Draft') || '{}');
        const timeSinceGeneration = draftData.generatedAt 
          ? (Date.now() - new Date(draftData.generatedAt).getTime()) / 1000
          : null;
        
        console.log('📊 ANALYTICS:', {
          event: 'framework_saved',
          totalRefinements: draftData.totalRefinements || 0,
          timeSinceGeneration: timeSinceGeneration ? `${(timeSinceGeneration / 60).toFixed(1)} min` : null,
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        // Analytics logging failed, continue
      }
      
      // Clear session storage after successful save
      sessionStorage.removeItem('visionFrameworkV2Draft');
    } catch (error) {
      console.error('Save error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRefineSection = async (section: string, feedback: string) => {
    if (!framework) return;
    
    setRefiningSection(section);
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/vision-framework-v2/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section,
          currentContent: (framework as any)[section],
          feedback,
          originalResponses,
          fullFramework: framework
        })
      });

      if (!response.ok) {
        throw new Error('Failed to refine section');
      }

      const result = await response.json();
      const duration = Date.now() - startTime;
      
      console.log('🔍 Refinement API response:', result);
      console.log('🔍 Quality data:', result.quality);
      console.log(`⏱️ Refinement took ${(duration / 1000).toFixed(1)}s`);
      
      // Store refinement in history
      const historyEntry = {
        section,
        timestamp: new Date().toISOString(),
        feedback,
        previousContent: (framework as any)[section],
        refinedContent: result.refinedContent,
        previousQuality: sectionQualities[section]?.overallScore || null,
        newQuality: result.quality?.overallScore || null,
        duration
      };
      
      // Update refinement history in session storage
      try {
        const existingDraft = sessionStorage.getItem('visionFrameworkV2Draft');
        if (existingDraft) {
          const draftData = JSON.parse(existingDraft);
          const history = draftData.refinementHistory || [];
          history.push(historyEntry);
          
          draftData.refinementHistory = history;
          draftData.lastRefinedAt = new Date().toISOString();
          draftData.totalRefinements = history.length;
          
          sessionStorage.setItem('visionFrameworkV2Draft', JSON.stringify(draftData));
          console.log('📝 Refinement history updated:', history.length, 'refinements');
          
          // Analytics: Track refinement event
          console.log('📊 ANALYTICS:', {
            event: 'refinement_completed',
            section,
            feedback,
            qualityImprovement: (result.quality?.overallScore || 0) - (sectionQualities[section]?.overallScore || 0),
            duration,
            totalRefinements: history.length
          });
        }
      } catch (storageError) {
        console.warn('⚠️ Failed to update refinement history:', storageError);
      }
      
      // Update the framework with refined content
      setFramework({
        ...framework,
        [section]: result.refinedContent
      });

      // Store quality scores
      if (result.quality) {
        console.log('✅ Updating quality scores for section:', section, result.quality);
        setSectionQualities(prev => {
          const updated = {
            ...prev,
            [section]: result.quality
          };
          console.log('📊 All section qualities:', updated);
          return updated;
        });
      } else {
        console.warn('⚠️ No quality data returned from refinement API');
      }

      // Show success message
      setMessage({
        type: 'success',
        text: `${section.charAt(0).toUpperCase() + section.slice(1)} refined successfully!`
      });

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);

    } catch (error) {
      console.error('Refinement error:', error);
      setMessage({
        type: 'error',
        text: 'Failed to refine section. Please try again.'
      });
    } finally {
      setRefiningSection(null);
    }
  };

  const addBet = () => {
    if (!framework) return;
    const newBet: NearTermBet = {
      bet: '',
      owner: '',
      horizon: 'Q1',
      measure: ''
    };
    setFramework({
      ...framework,
      near_term_bets: [...framework.near_term_bets, newBet]
    });
  };

  const updateBet = (index: number, field: keyof NearTermBet, value: string) => {
    if (!framework) return;
    const updated = [...framework.near_term_bets];
    updated[index] = { ...updated[index], [field]: value };
    setFramework({ ...framework, near_term_bets: updated });
  };

  const removeBet = (index: number) => {
    if (!framework) return;
    setFramework({
      ...framework,
      near_term_bets: framework.near_term_bets.filter((_, i) => i !== index)
    });
  };

  const addMetric = () => {
    if (!framework) return;
    const newMetric: Metric = {
      name: '',
      target: '',
      cadence: 'monthly'
    };
    setFramework({
      ...framework,
      metrics: [...framework.metrics, newMetric]
    });
  };

  const updateMetric = (index: number, field: keyof Metric, value: string) => {
    if (!framework) return;
    const updated = [...framework.metrics];
    updated[index] = { ...updated[index], [field]: value };
    setFramework({ ...framework, metrics: updated });
  };

  const removeMetric = (index: number) => {
    if (!framework) return;
    setFramework({
      ...framework,
      metrics: framework.metrics.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-banyan-primary mx-auto mb-4"></div>
          <p className="text-banyan-text-subtle">Loading Vision Framework...</p>
        </div>
      </div>
    );
  }

  if (!framework) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-banyan-text-default mb-4">No Vision Framework Found</h2>
          <p className="text-banyan-text-subtle mb-6">
            Create a brief first, then generate your Vision Framework from there.
          </p>
          <a
            href="/new"
            className="btn-banyan-primary inline-block"
          >
            Create a Brief
          </a>
        </div>
      </div>
    );
  }

  const content = (
    <>
      {/* Header - only show when not embedded */}
      {!embedded && (
        <div className="sticky top-0 z-30 bg-banyan-bg-base backdrop-blur border-b border-banyan-border-default">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <a href="/new" className="text-sm text-banyan-text-subtle hover:text-banyan-text-default transition-colors">
                  ← Back to Brief
                </a>
                <div className="flex items-baseline gap-3">
                  <h1 className="truncate text-xl sm:text-2xl font-semibold text-banyan-text-default">Vision Framework</h1>
                  <p className="hidden sm:block text-xs text-banyan-text-subtle">Your strategic operating system</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLensScore}
                  disabled={scoringLens}
                  className="btn-banyan-ghost"
                  title="Score with Founder's Lens"
                >
                  {scoringLens ? 'Scoring…' : 'Score with Lens'}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-banyan-primary"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <SaveIndicator saving={saving} dirty={isDirty} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className="bg-banyan-bg-base">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className={`rounded-lg p-4 border ${message.type === 'success' ? 'bg-banyan-success/20 text-banyan-success border-banyan-success' : 'bg-banyan-error/20 text-banyan-error border-banyan-error'}`}>
              {message.text}
            </div>
          </div>
        </div>
      )}

      {/* Lens Badge */}
      {lensScores && (
        <div className="bg-banyan-bg-base">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <LensBadge
            clarity={lensScores.scores?.clarity}
            alignment={lensScores.scores?.alignment}
            actionability={lensScores.scores?.actionability}
            overall={lensScores.scores?.overall}
            badge={lensScores.badge}
            message={lensScores.message}
            feedback={lensScores.scores?.feedback}
          />
        </div>
        </div>
      )}

      {/* Tabs - hide when editOnly */}
      {!editOnly && (
        <div className="bg-banyan-bg-base">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              role="tablist"
              aria-label="Vision Framework Views"
              className="flex items-center gap-1 border-b border-banyan-border-default"
            >
            {([
              { key: 'edit', label: 'Framework' },
              { key: 'onepager', label: 'Executive One-Pager' },
              { key: 'qa', label: 'QA Results' },
            ] as { key: TabKey; label: string }[]).map(t => (
              <button
                key={t.key}
                role="tab"
                aria-selected={activeTab === t.key}
                aria-controls={`panel-${t.key}`}
                onClick={() => setActiveTab(t.key)}
                onKeyDown={(e) => {
                  const i = tabOrder.indexOf(activeTab);
                  if (e.key === 'ArrowRight') setActiveTab(tabOrder[(i + 1) % tabOrder.length]);
                  if (e.key === 'ArrowLeft') setActiveTab(tabOrder[(i - 1 + tabOrder.length) % tabOrder.length]);
                }}
                className={`px-3 sm:px-4 py-2 text-sm rounded-t-md outline-none
                  ${activeTab === t.key
                    ? 'text-banyan-text-default border-b-2 border-banyan-text-default font-medium'
                    : 'text-banyan-text-subtle hover:text-banyan-text-default'
                  }
                  focus-visible:ring-2 focus-visible:ring-banyan-focus`}
              >
                {t.label}
              </button>
            ))}
            {/* Score button - show in embedded view */}
            {embedded && (
              <button
                onClick={handleLensScore}
                disabled={scoringLens}
                className="btn-banyan-ghost text-sm ml-auto"
                title="Score with Founder's Lens"
              >
                {scoringLens ? 'Scoring…' : 'Score with Lens'}
              </button>
            )}
          </div>
          </div>
        </div>
      )}

      {/* Title when editOnly (no tabs) */}
      {editOnly && (
        <div className="bg-banyan-bg-surface rounded-lg shadow-banyan-mid border border-banyan-border-default p-6 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-banyan-text-default">Vision Framework</h2>
            <button
              onClick={handleLensScore}
              disabled={scoringLens}
              className="btn-banyan-ghost"
              title="Score with Founder's Lens"
            >
              {scoringLens ? 'Scoring...' : 'Score with Lens'}
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${embedded ? 'pt-2' : ''}`}>
        {activeTab === 'edit' && (
          <div role="tabpanel" id="panel-edit" aria-labelledby="edit" className="space-y-8 sm:space-y-10">
            {/* Research Citations */}
            {researchCitations.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                <ResearchCitations citations={researchCitations} />
              </motion.div>
            )}
            
            {/* Vision */}
            <motion.section
              id="vision"
              role="region"
              aria-labelledby="vision-title"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="bg-banyan-bg-surface rounded-xl shadow-banyan-mid border border-banyan-border-default p-6 sm:p-7"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                <h2 id="vision-title" className="text-lg sm:text-xl font-semibold text-banyan-text-default shrink-0">Vision</h2>
                {sectionQualities.vision && sectionQualities.vision.overallScore && (
                  <QualityBadge
                    score={sectionQualities.vision.overallScore}
                    alignment={sectionQualities.vision.alignment}
                    issues={sectionQualities.vision.issues || []}
                    suggestions={sectionQualities.vision.suggestions || []}
                    strengths={sectionQualities.vision.strengths || []}
                  />
                )}
              </div>
              <textarea
                value={framework.vision}
                onChange={(e) => setFramework({ ...framework, vision: e.target.value })}
                rows={4}
                className="w-full resize-y rounded-md border border-banyan-border-default bg-banyan-bg-base px-3 py-2 text-banyan-text-default placeholder:text-banyan-text-subtle focus:outline-none focus:ring-2 focus:ring-banyan-focus"
                placeholder="In one paragraph, describe the future you're building and why it matters."
              />
              <div className="mt-3">
                <RefinementPanel
                  section="vision"
                  content={framework.vision}
                  onRefine={(feedback) => handleRefineSection('vision', feedback)}
                  quality={sectionQualities.vision}
                  isRefining={refiningSection === 'vision'}
                />
              </div>
            </motion.section>

            {/* Strategy */}
            <motion.section
              id="strategy"
              role="region"
              aria-labelledby="strategy-title"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: 0.03 }}
              className="bg-banyan-bg-surface rounded-xl shadow-banyan-mid border border-banyan-border-default p-6 sm:p-7"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                <h2 id="strategy-title" className="text-lg sm:text-xl font-semibold text-banyan-text-default shrink-0">Strategy (How We Win)</h2>
                {sectionQualities.strategy && sectionQualities.strategy.overallScore && (
                  <QualityBadge
                    score={sectionQualities.strategy.overallScore}
                    alignment={sectionQualities.strategy.alignment}
                    issues={sectionQualities.strategy.issues || []}
                    suggestions={sectionQualities.strategy.suggestions || []}
                    strengths={sectionQualities.strategy.strengths || []}
                  />
                )}
              </div>
              <div className="space-y-2">
                {framework.strategy.map((pillar, index) => (
                  <input
                    key={index}
                    type="text"
                    value={pillar}
                    onChange={(e) => {
                      const updated = [...framework.strategy];
                      updated[index] = e.target.value;
                      setFramework({ ...framework, strategy: updated });
                    }}
                    className="w-full rounded-md border border-banyan-border-default bg-banyan-bg-base px-3 py-2 text-banyan-text-default focus:outline-none focus:ring-2 focus:ring-banyan-focus"
                    placeholder={`Pillar ${index + 1}`}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setFramework({ ...framework, strategy: [...framework.strategy, ''] })}
                  className="btn-banyan-ghost"
                >
                  + Add Strategic Pillar
                </button>
              </div>
              <div className="mt-3">
                <RefinementPanel
                  section="strategy"
                  content={framework.strategy}
                  onRefine={(feedback) => handleRefineSection('strategy', feedback)}
                  quality={sectionQualities.strategy}
                  isRefining={refiningSection === 'strategy'}
                />
              </div>
            </motion.section>

            {/* Operating Principles */}
            <motion.section
              id="operating_principles"
              role="region"
              aria-labelledby="operating-principles-title"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: 0.06 }}
              className="bg-banyan-bg-surface rounded-xl shadow-banyan-mid border border-banyan-border-default p-6 sm:p-7"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                <h2 id="operating-principles-title" className="text-lg sm:text-xl font-semibold text-banyan-text-default shrink-0">Operating Principles</h2>
                {sectionQualities.operating_principles && sectionQualities.operating_principles.overallScore && (
                  <QualityBadge
                    score={sectionQualities.operating_principles.overallScore}
                    alignment={sectionQualities.operating_principles.alignment}
                    issues={sectionQualities.operating_principles.issues || []}
                    suggestions={sectionQualities.operating_principles.suggestions || []}
                    strengths={sectionQualities.operating_principles.strengths || []}
                  />
                )}
              </div>
              <div className="space-y-2">
                {framework.operating_principles.map((principle, index) => (
                  <input
                    key={index}
                    type="text"
                    value={principle}
                    onChange={(e) => {
                      const updated = [...framework.operating_principles];
                      updated[index] = e.target.value;
                      setFramework({ ...framework, operating_principles: updated });
                    }}
                    className="w-full rounded-md border border-banyan-border-default bg-banyan-bg-base px-3 py-2 text-banyan-text-default focus:outline-none focus:ring-2 focus:ring-banyan-focus"
                    placeholder={`Principle ${index + 1}`}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setFramework({ ...framework, operating_principles: [...framework.operating_principles, ''] })}
                  className="btn-banyan-ghost"
                >
                  + Add Principle
                </button>
              </div>
              <div className="mt-3">
                <RefinementPanel
                  section="operating_principles"
                  content={framework.operating_principles}
                  onRefine={(feedback) => handleRefineSection('operating_principles', feedback)}
                  quality={sectionQualities.operating_principles}
                  isRefining={refiningSection === 'operating_principles'}
                />
              </div>
            </motion.section>

            {/* Near-term Bets */}
            <motion.section
              id="near_term_bets"
              role="region"
              aria-labelledby="near-term-bets-title"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: 0.09 }}
              className="bg-banyan-bg-surface rounded-xl shadow-banyan-mid border border-banyan-border-default p-6 sm:p-7"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                <h2 id="near-term-bets-title" className="text-lg sm:text-xl font-semibold text-banyan-text-default shrink-0">Near-term Bets</h2>
                {sectionQualities.near_term_bets && sectionQualities.near_term_bets.overallScore && (
                  <QualityBadge
                    score={sectionQualities.near_term_bets.overallScore}
                    alignment={sectionQualities.near_term_bets.alignment}
                    issues={sectionQualities.near_term_bets.issues || []}
                    suggestions={sectionQualities.near_term_bets.suggestions || []}
                    strengths={sectionQualities.near_term_bets.strengths || []}
                  />
                )}
              </div>
              <div className="space-y-3">
                {framework.near_term_bets.map((bet, index) => (
                  <div key={index} className="p-4 border border-banyan-border-default bg-banyan-bg-base rounded-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-banyan-text-default mb-1">Bet</label>
                        <input
                          type="text"
                          value={bet.bet}
                          onChange={(e) => updateBet(index, 'bet', e.target.value)}
                          className="w-full rounded-md border border-banyan-border-default bg-banyan-bg-base px-3 py-2 text-banyan-text-default focus:outline-none focus:ring-2 focus:ring-banyan-focus"
                          placeholder="What are you committing to?"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-banyan-text-default mb-1">Owner</label>
                        <input
                          type="text"
                          value={bet.owner}
                          onChange={(e) => updateBet(index, 'owner', e.target.value)}
                          className="w-full rounded-md border border-banyan-border-default bg-banyan-bg-base px-3 py-2 text-banyan-text-default focus:outline-none focus:ring-2 focus:ring-banyan-focus"
                          placeholder="CEO, CTO, etc."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-banyan-text-default mb-1">Horizon</label>
                        <select
                          value={bet.horizon}
                          onChange={(e) => updateBet(index, 'horizon', e.target.value)}
                          className="w-full rounded-md border border-banyan-border-default bg-banyan-bg-base px-3 py-2 text-banyan-text-default focus:outline-none focus:ring-2 focus:ring-banyan-focus"
                        >
                          <option value="Q1">Q1</option>
                          <option value="Q2">Q2</option>
                          <option value="Q3">Q3</option>
                          <option value="Q4">Q4</option>
                          <option value="H1">H1</option>
                          <option value="H2">H2</option>
                          <option value="6mo">6 months</option>
                          <option value="12mo">12 months</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-banyan-text-default mb-1">Measure</label>
                        <input
                          type="text"
                          value={bet.measure}
                          onChange={(e) => updateBet(index, 'measure', e.target.value)}
                          className="w-full rounded-md border border-banyan-border-default bg-banyan-bg-base px-3 py-2 text-banyan-text-default focus:outline-none focus:ring-2 focus:ring-banyan-focus"
                          placeholder="How will you measure success?"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBet(index)}
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addBet}
                  className="btn-banyan-ghost"
                >
                  + Add Bet
                </button>
              </div>
              <div className="mt-3">
                <RefinementPanel
                  section="near_term_bets"
                  content={framework.near_term_bets}
                  onRefine={(feedback) => handleRefineSection('near_term_bets', feedback)}
                  quality={sectionQualities.near_term_bets}
                  isRefining={refiningSection === 'near_term_bets'}
                />
              </div>
            </motion.section>

            {/* Metrics */}
            <motion.section
              id="metrics"
              role="region"
              aria-labelledby="metrics-title"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: 0.12 }}
              className="bg-banyan-bg-surface rounded-xl shadow-banyan-mid border border-banyan-border-default p-6 sm:p-7"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                <h2 id="metrics-title" className="text-lg sm:text-xl font-semibold text-banyan-text-default shrink-0">Metrics</h2>
                {sectionQualities.metrics && sectionQualities.metrics.overallScore && (
                  <QualityBadge
                    score={sectionQualities.metrics.overallScore}
                    alignment={sectionQualities.metrics.alignment}
                    issues={sectionQualities.metrics.issues || []}
                    suggestions={sectionQualities.metrics.suggestions || []}
                    strengths={sectionQualities.metrics.strengths || []}
                  />
                )}
              </div>
              <div className="space-y-3">
                {framework.metrics.map((metric, index) => (
                  <div key={index} className="p-4 border border-banyan-border-default bg-banyan-bg-base rounded-lg">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-banyan-text-default mb-1">Metric</label>
                        <input
                          type="text"
                          value={metric.name}
                          onChange={(e) => updateMetric(index, 'name', e.target.value)}
                          className="w-full rounded-md border border-banyan-border-default bg-banyan-bg-base px-3 py-2 text-banyan-text-default focus:outline-none focus:ring-2 focus:ring-banyan-focus"
                          placeholder="What to measure"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-banyan-text-default mb-1">Target</label>
                        <input
                          type="text"
                          value={metric.target}
                          onChange={(e) => updateMetric(index, 'target', e.target.value)}
                          className="w-full rounded-md border border-banyan-border-default bg-banyan-bg-base px-3 py-2 text-banyan-text-default focus:outline-none focus:ring-2 focus:ring-banyan-focus"
                          placeholder="Goal"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-banyan-text-default mb-1">Cadence</label>
                        <select
                          value={metric.cadence}
                          onChange={(e) => updateMetric(index, 'cadence', e.target.value)}
                          className="w-full rounded-md border border-banyan-border-default bg-banyan-bg-base px-3 py-2 text-banyan-text-default focus:outline-none focus:ring-2 focus:ring-banyan-focus"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="milestone">Milestone</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMetric(index)}
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addMetric}
                  className="btn-banyan-ghost"
                >
                  + Add Metric
                </button>
              </div>
              <div className="mt-3">
                <RefinementPanel
                  section="metrics"
                  content={framework.metrics}
                  onRefine={(feedback) => handleRefineSection('metrics', feedback)}
                  quality={sectionQualities.metrics}
                  isRefining={refiningSection === 'metrics'}
                />
              </div>
            </motion.section>

            {/* Tensions */}
            <motion.section
              id="tensions"
              role="region"
              aria-labelledby="tensions-title"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: 0.15 }}
              className="bg-banyan-bg-surface rounded-xl shadow-banyan-mid border border-banyan-border-default p-6 sm:p-7"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                <div className="shrink-0">
                  <h2 id="tensions-title" className="text-lg sm:text-xl font-semibold text-banyan-text-default">Tensions to Watch</h2>
                  <p className="text-sm text-banyan-text-subtle mt-1">Known contradictions or trade-offs in your strategy</p>
                </div>
                {sectionQualities.tensions && sectionQualities.tensions.overallScore && (
                  <QualityBadge
                    score={sectionQualities.tensions.overallScore}
                    alignment={sectionQualities.tensions.alignment}
                    issues={sectionQualities.tensions.issues || []}
                    suggestions={sectionQualities.tensions.suggestions || []}
                    strengths={sectionQualities.tensions.strengths || []}
                  />
                )}
              </div>
              <div className="space-y-2">
                {framework.tensions.map((tension, index) => (
                  <input
                    key={index}
                    type="text"
                    value={tension}
                    onChange={(e) => {
                      const updated = [...framework.tensions];
                      updated[index] = e.target.value;
                      setFramework({ ...framework, tensions: updated });
                    }}
                    className="w-full rounded-md border border-banyan-border-default bg-banyan-bg-base px-3 py-2 text-banyan-text-default focus:outline-none focus:ring-2 focus:ring-banyan-focus"
                    placeholder="E.g., premium positioning vs need for rapid growth"
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setFramework({ ...framework, tensions: [...framework.tensions, ''] })}
                  className="btn-banyan-ghost"
                >
                  + Add Tension
                </button>
              </div>
              <div className="mt-3">
                <RefinementPanel
                  section="tensions"
                  content={framework.tensions}
                  onRefine={(feedback) => handleRefineSection('tensions', feedback)}
                  quality={sectionQualities.tensions}
                  isRefining={refiningSection === 'tensions'}
                />
              </div>
            </motion.section>
          </div>
        )}

        {activeTab === 'onepager' && (
          <section
            id="panel-onepager"
            role="tabpanel"
            aria-labelledby="onepager"
            className="bg-banyan-bg-surface rounded-xl shadow-banyan-mid border border-banyan-border-default p-6 sm:p-8"
          >
            <div className="prose prose-sm max-w-none print:prose print:!max-w-none">
              {executiveOnePager ? (
                <div 
                  className="text-banyan-text-default leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: executiveOnePager
                      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // Bold
                      .replace(/\*(.+?)\*/g, '<em>$1</em>') // Italic
                      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>') // H3
                      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>') // H2
                      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>') // H1
                      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc list-inside">$1</li>') // List items
                      .replace(/\n\n/g, '</p><p class="mb-4">') // Paragraphs
                      .replace(/^(.+)$/gm, (match) => match.startsWith('<') ? match : `<p class="mb-2">${match}</p>`) // Wrap remaining lines
                  }}
                />
              ) : (
                <div className="text-banyan-text-subtle">
                  <p><strong>Executive one-pager</strong> will appear here after generation.</p>
                  <p className="mt-2">Tip: Complete Vision and at least one Strategy pillar, then run <em>Score with Lens</em> to unlock the draft.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'qa' && (
          <section
            id="panel-qa"
            role="tabpanel"
            aria-labelledby="qa"
            className="bg-banyan-bg-surface rounded-xl shadow-banyan-mid border border-banyan-border-default p-6 sm:p-8"
          >
            {qaResults ? (
              <div className="space-y-6">
                <div className="flex items-end justify-between pb-4 border-b border-banyan-border-default">
                  <h3 className="text-lg font-semibold text-banyan-text-default">Quality Assessment</h3>
                  <p className="text-2xl font-bold text-banyan-text-default">{qaResults.overallScore}/10</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['consistency', 'measurability', 'tensions', 'actionability', 'completeness'].map((category) => {
                    const score = qaResults[category] || 0;
                    return (
                      <div key={category} className="rounded-md border border-banyan-border-default bg-banyan-bg-base p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium capitalize text-banyan-text-default">{category}</span>
                          <span className="text-sm text-banyan-text-subtle">{score}/10</span>
                        </div>
                        <div className="h-2 rounded bg-banyan-bg-base overflow-hidden">
                          <div
                            className="h-full rounded bg-banyan-text-default"
                            style={{ width: `${(score / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {qaResults.recommendations && qaResults.recommendations.length > 0 && (
                  <div className="mt-6 p-6 bg-banyan-bg-base rounded-lg border border-banyan-border-default">
                    <h4 className="text-sm font-semibold text-banyan-text-default mb-2">Recommendations</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-banyan-text-default">
                      {qaResults.recommendations.map((rec: string, i: number) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-banyan-text-subtle">QA results will appear here after generation.</p>
            )}
          </section>
        )}
      </div>
    </>
  );

  // Return with or without outer container based on embedded prop
  if (embedded) {
    return content;
  }

  return (
    <div className="min-h-screen bg-banyan-bg-base">
      {content}
    </div>
  );
}

