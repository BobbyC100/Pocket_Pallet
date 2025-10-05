'use client';

import { useState, useEffect } from 'react';
import { VisionFrameworkV2, NearTermBet, Metric } from '@/lib/vision-framework-schema-v2';
import RefinementPanel from './RefinementPanel';
import QualityBadge from './QualityBadge';
import LensBadge from './LensBadge';

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
  // Default to edit tab when editOnly, QA tab when embedded
  const [activeTab, setActiveTab] = useState<'edit' | 'onepager' | 'qa'>(editOnly ? 'edit' : embedded ? 'qa' : 'edit');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [refiningSection, setRefiningSection] = useState<string | null>(null);
  const [originalResponses, setOriginalResponses] = useState<any>(null);
  const [sectionQualities, setSectionQualities] = useState<Record<string, any>>({});
  const [lensScores, setLensScores] = useState<any>(null);
  const [scoringLens, setScoringLens] = useState(false);

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
        console.log('✅ Loaded Vision Framework V2 from session');
      } catch (error) {
        console.error('❌ Failed to parse draft data:', error);
      }
    } else {
      console.log('⚠️ No visionFrameworkV2Draft in session storage');
    }
  }, []);

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
        <div className="bg-banyan-bg-surface border-b border-banyan-border-default shadow-banyan-low">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <a href="/new" className="text-sm text-banyan-text-subtle hover:text-banyan-text-default mb-2 block transition-colors">
                  ← Back to Brief
                </a>
                <h1 className="text-2xl font-bold text-banyan-text-default">Vision Framework</h1>
                <p className="text-sm text-banyan-text-subtle mt-1">Your strategic operating system</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleLensScore}
                  disabled={scoringLens}
                  className="btn-banyan-ghost"
                  title="Score with Founder's Lens"
                >
                  {scoringLens ? 'Scoring...' : 'Score with Lens'}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-banyan-primary"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4`}>
          <div className={`rounded-lg p-4 border ${message.type === 'success' ? 'bg-banyan-success/20 text-banyan-success border-banyan-success' : 'bg-banyan-error/20 text-banyan-error border-banyan-error'}`}>
            {message.text}
          </div>
        </div>
      )}

      {/* Lens Badge */}
      {lensScores && (
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
      )}

      {/* Tabs - hide when editOnly */}
      {!editOnly && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between border-b border-banyan-border-default">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-4 py-2 font-medium transition-colors ${activeTab === 'edit' ? 'text-banyan-primary border-b-2 border-banyan-primary' : 'text-banyan-text-subtle hover:text-banyan-text-default'}`}
              >
                Framework
              </button>
              <button
                onClick={() => setActiveTab('onepager')}
                className={`px-4 py-2 font-medium transition-colors ${activeTab === 'onepager' ? 'text-banyan-primary border-b-2 border-banyan-primary' : 'text-banyan-text-subtle hover:text-banyan-text-default'}`}
              >
                Executive One-Pager
              </button>
              <button
                onClick={() => setActiveTab('qa')}
                className={`px-4 py-2 font-medium transition-colors ${activeTab === 'qa' ? 'text-banyan-primary border-b-2 border-banyan-primary' : 'text-banyan-text-subtle hover:text-banyan-text-default'}`}
              >
                QA Results
              </button>
            </div>
            {/* Score button - show in embedded view */}
            {embedded && (
              <button
                onClick={handleLensScore}
                disabled={scoringLens}
                className="btn-banyan-ghost text-sm mb-2"
                title="Score with Founder's Lens"
              >
                {scoringLens ? 'Scoring...' : 'Score with Lens'}
              </button>
            )}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'edit' && (
          <div className="space-y-8">
            {/* Vision */}
            <section className="bg-banyan-bg-surface rounded-lg shadow-banyan-mid border border-banyan-border-default p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-banyan-text-default">Vision</h2>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                rows={3}
                placeholder="Your aspirational end state (2-3 sentences)"
              />
              <RefinementPanel
                section="vision"
                content={framework.vision}
                onRefine={(feedback) => handleRefineSection('vision', feedback)}
                quality={sectionQualities.vision}
                isRefining={refiningSection === 'vision'}
              />
            </section>

            {/* Strategy */}
            <section className="bg-banyan-bg-surface rounded-lg shadow-banyan-mid border border-banyan-border-default p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-banyan-text-default">Strategy (How We Win)</h2>
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
              {framework.strategy.map((pillar, index) => (
                <div key={index} className="mb-3">
                  <input
                    type="text"
                    value={pillar}
                    onChange={(e) => {
                      const updated = [...framework.strategy];
                      updated[index] = e.target.value;
                      setFramework({ ...framework, strategy: updated });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Strategic pillar"
                  />
                </div>
              ))}
              <button
                onClick={() => setFramework({ ...framework, strategy: [...framework.strategy, ''] })}
                className="text-banyan-primary hover:text-banyan-primary-hover text-sm font-medium transition-colors"
              >
                + Add Strategic Pillar
              </button>
              <RefinementPanel
                section="strategy"
                content={framework.strategy}
                onRefine={(feedback) => handleRefineSection('strategy', feedback)}
                quality={sectionQualities.strategy}
                isRefining={refiningSection === 'strategy'}
              />
            </section>

            {/* Operating Principles */}
            <section className="bg-banyan-bg-surface rounded-lg shadow-banyan-mid border border-banyan-border-default p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-banyan-text-default">Operating Principles</h2>
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
              {framework.operating_principles.map((principle, index) => (
                <div key={index} className="mb-3">
                  <input
                    type="text"
                    value={principle}
                    onChange={(e) => {
                      const updated = [...framework.operating_principles];
                      updated[index] = e.target.value;
                      setFramework({ ...framework, operating_principles: updated });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Operating principle"
                  />
                </div>
              ))}
              <button
                onClick={() => setFramework({ ...framework, operating_principles: [...framework.operating_principles, ''] })}
                className="text-banyan-primary hover:text-banyan-primary-hover text-sm font-medium transition-colors"
              >
                + Add Principle
              </button>
              <RefinementPanel
                section="operating_principles"
                content={framework.operating_principles}
                onRefine={(feedback) => handleRefineSection('operating_principles', feedback)}
                quality={sectionQualities.operating_principles}
                isRefining={refiningSection === 'operating_principles'}
              />
            </section>

            {/* Near-term Bets */}
            <section className="bg-banyan-bg-surface rounded-lg shadow-banyan-mid border border-banyan-border-default p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-banyan-text-default">Near-term Bets</h2>
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
              {framework.near_term_bets.map((bet, index) => (
                <div key={index} className="mb-4 p-4 border border-banyan-border-default bg-banyan-bg-base rounded-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bet</label>
                      <input
                        type="text"
                        value={bet.bet}
                        onChange={(e) => updateBet(index, 'bet', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="What are you committing to?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                      <input
                        type="text"
                        value={bet.owner}
                        onChange={(e) => updateBet(index, 'owner', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="CEO, CTO, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Horizon</label>
                      <select
                        value={bet.horizon}
                        onChange={(e) => updateBet(index, 'horizon', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Measure</label>
                      <input
                        type="text"
                        value={bet.measure}
                        onChange={(e) => updateBet(index, 'measure', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="How will you measure success?"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeBet(index)}
                    className="mt-2 text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={addBet}
                className="text-banyan-primary hover:text-banyan-primary-hover text-sm font-medium transition-colors"
              >
                + Add Bet
              </button>
              <RefinementPanel
                section="near_term_bets"
                content={framework.near_term_bets}
                onRefine={(feedback) => handleRefineSection('near_term_bets', feedback)}
                quality={sectionQualities.near_term_bets}
                isRefining={refiningSection === 'near_term_bets'}
              />
            </section>

            {/* Metrics */}
            <section className="bg-banyan-bg-surface rounded-lg shadow-banyan-mid border border-banyan-border-default p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-banyan-text-default">Metrics</h2>
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
              {framework.metrics.map((metric, index) => (
                <div key={index} className="mb-4 p-4 border border-banyan-border-default bg-banyan-bg-base rounded-lg">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Metric</label>
                      <input
                        type="text"
                        value={metric.name}
                        onChange={(e) => updateMetric(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="What to measure"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                      <input
                        type="text"
                        value={metric.target}
                        onChange={(e) => updateMetric(index, 'target', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="Goal"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cadence</label>
                      <select
                        value={metric.cadence}
                        onChange={(e) => updateMetric(index, 'cadence', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                    onClick={() => removeMetric(index)}
                    className="mt-2 text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={addMetric}
                className="text-banyan-primary hover:text-banyan-primary-hover text-sm font-medium transition-colors"
              >
                + Add Metric
              </button>
              <RefinementPanel
                section="metrics"
                content={framework.metrics}
                onRefine={(feedback) => handleRefineSection('metrics', feedback)}
                quality={sectionQualities.metrics}
                isRefining={refiningSection === 'metrics'}
              />
            </section>

            {/* Tensions */}
            <section className="bg-banyan-bg-surface rounded-lg shadow-banyan-mid border border-banyan-border-default p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-banyan-text-default">Tensions to Watch</h2>
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
              {framework.tensions.map((tension, index) => (
                <div key={index} className="mb-3">
                  <input
                    type="text"
                    value={tension}
                    onChange={(e) => {
                      const updated = [...framework.tensions];
                      updated[index] = e.target.value;
                      setFramework({ ...framework, tensions: updated });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="E.g., premium positioning vs need for rapid growth"
                  />
                </div>
              ))}
              <button
                onClick={() => setFramework({ ...framework, tensions: [...framework.tensions, ''] })}
                className="text-banyan-primary hover:text-banyan-primary-hover text-sm font-medium transition-colors"
              >
                + Add Tension
              </button>
              <RefinementPanel
                section="tensions"
                content={framework.tensions}
                onRefine={(feedback) => handleRefineSection('tensions', feedback)}
                quality={sectionQualities.tensions}
                isRefining={refiningSection === 'tensions'}
              />
            </section>
          </div>
        )}

        {activeTab === 'onepager' && (
          <div className="bg-banyan-bg-surface rounded-lg shadow-banyan-mid border border-banyan-border-default p-8">
            <div className="prose prose-sm max-w-none">
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
                <div className="text-banyan-text-subtle">Executive one-pager will appear here after generation.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'qa' && (
          <div className="bg-banyan-bg-surface rounded-lg shadow-banyan-mid border border-banyan-border-default p-8">
            {qaResults ? (
              <div className="space-y-6">
                <div className="pb-4 border-b border-banyan-border-default">
                  <h3 className="text-xl font-bold text-banyan-text-default">Quality Assessment</h3>
                  <p className="text-2xl font-bold text-banyan-primary mt-2">{qaResults.overallScore}/10</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(qaResults).filter(([key]) => 
                    ['consistency', 'measurability', 'tensions', 'actionability', 'completeness'].includes(key)
                  ).map(([category, data]: [string, any]) => (
                    <div key={category} className="p-4 border border-banyan-border-default bg-banyan-bg-base rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-banyan-text-default capitalize">{category}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          data.pass ? 'bg-banyan-success/20 text-banyan-success' : 'bg-banyan-warning/20 text-banyan-warning'
                        }`}>
                          {data.pass ? 'Pass' : 'Review'}
                        </span>
                      </div>
                      {data.issues && data.issues.length > 0 && (
                        <ul className="text-sm text-banyan-text-subtle space-y-1 mt-2">
                          {data.issues.map((issue: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-banyan-text-subtle mt-0.5">•</span>
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {data.feedback && <p className="text-sm text-banyan-text-subtle mt-2">{data.feedback}</p>}
                      {data.score && <p className="text-sm font-medium text-banyan-text-default mt-2">Score: {data.score}/10</p>}
                    </div>
                  ))}
                </div>

                {qaResults.recommendations && qaResults.recommendations.length > 0 && (
                  <div className="mt-6 p-6 bg-banyan-bg-base rounded-lg border border-banyan-border-default">
                    <h4 className="font-semibold text-banyan-text-default mb-3">Recommendations</h4>
                    <ul className="space-y-2">
                      {qaResults.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-banyan-text-default">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-banyan-primary/20 text-banyan-primary flex items-center justify-center text-xs font-bold mt-0.5">
                            {i + 1}
                          </span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-banyan-text-subtle">QA results will appear here after generation.</p>
            )}
          </div>
        )}
      </div>
    </>
  );

  // Return with or without outer container based on embedded prop
  if (embedded) {
    return content;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {content}
    </div>
  );
}

