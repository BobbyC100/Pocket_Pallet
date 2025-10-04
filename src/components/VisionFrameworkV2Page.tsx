'use client';

import { useState, useEffect } from 'react';
import { VisionFrameworkV2, NearTermBet, Metric } from '@/lib/vision-framework-schema-v2';

interface VisionFrameworkV2PageProps {
  companyId?: string;
}

export default function VisionFrameworkV2Page({ companyId = 'demo-company' }: VisionFrameworkV2PageProps) {
  const [framework, setFramework] = useState<VisionFrameworkV2 | null>(null);
  const [executiveOnePager, setExecutiveOnePager] = useState<string>('');
  const [qaResults, setQaResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'onepager' | 'qa'>('edit');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load framework from session storage on mount
  useEffect(() => {
    const draftData = sessionStorage.getItem('visionFrameworkV2Draft');
    console.log('🔍 Session storage raw data:', draftData ? draftData.substring(0, 200) : 'null');
    
    if (draftData) {
      try {
        const parsed = JSON.parse(draftData);
        console.log('📦 Parsed data:', parsed);
        console.log('🎯 Framework:', parsed.framework);
        
        setFramework(parsed.framework || null);
        setExecutiveOnePager(parsed.executiveOnePager || '');
        setQaResults(parsed.metadata?.qaChecks || null);
        console.log('✅ Loaded Vision Framework V2 from session');
      } catch (error) {
        console.error('❌ Failed to parse draft data:', error);
      }
    } else {
      console.log('⚠️ No visionFrameworkV2Draft in session storage');
    }
  }, []);

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

      setMessage({ type: 'success', text: '✅ Vision Framework saved!' });
      
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Vision Framework...</p>
        </div>
      </div>
    );
  }

  if (!framework) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Vision Framework Found</h2>
          <p className="text-gray-600 mb-6">
            Create a brief first, then generate your Vision Framework from there.
          </p>
          <a
            href="/new"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create a Brief
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <a href="/new" className="text-sm text-gray-500 hover:text-gray-700 mb-2 block">
                ← Back to Brief
              </a>
              <h1 className="text-2xl font-bold text-gray-900">Vision Framework</h1>
              <p className="text-sm text-gray-500 mt-1">Your strategic operating system</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4`}>
          <div className={`rounded-lg p-4 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2 font-medium ${activeTab === 'edit' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Edit Framework
          </button>
          <button
            onClick={() => setActiveTab('onepager')}
            className={`px-4 py-2 font-medium ${activeTab === 'onepager' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Executive One-Pager
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`px-4 py-2 font-medium ${activeTab === 'qa' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            QA Results
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'edit' && (
          <div className="space-y-8">
            {/* Vision */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Vision</h2>
              <textarea
                value={framework.vision}
                onChange={(e) => setFramework({ ...framework, vision: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Your aspirational end state (2-3 sentences)"
              />
            </section>

            {/* Strategy */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Strategy (How We Win)</h2>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Strategic pillar"
                  />
                </div>
              ))}
              <button
                onClick={() => setFramework({ ...framework, strategy: [...framework.strategy, ''] })}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add Strategic Pillar
              </button>
            </section>

            {/* Operating Principles */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Operating Principles</h2>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Operating principle"
                  />
                </div>
              ))}
              <button
                onClick={() => setFramework({ ...framework, operating_principles: [...framework.operating_principles, ''] })}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add Principle
              </button>
            </section>

            {/* Near-term Bets */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Near-term Bets</h2>
              {framework.near_term_bets.map((bet, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bet</label>
                      <input
                        type="text"
                        value={bet.bet}
                        onChange={(e) => updateBet(index, 'bet', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="What are you committing to?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                      <input
                        type="text"
                        value={bet.owner}
                        onChange={(e) => updateBet(index, 'owner', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="CEO, CTO, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Horizon</label>
                      <select
                        value={bet.horizon}
                        onChange={(e) => updateBet(index, 'horizon', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add Bet
              </button>
            </section>

            {/* Metrics */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Metrics</h2>
              {framework.metrics.map((metric, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Metric</label>
                      <input
                        type="text"
                        value={metric.name}
                        onChange={(e) => updateMetric(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="What to measure"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                      <input
                        type="text"
                        value={metric.target}
                        onChange={(e) => updateMetric(index, 'target', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Goal"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cadence</label>
                      <select
                        value={metric.cadence}
                        onChange={(e) => updateMetric(index, 'cadence', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add Metric
              </button>
            </section>

            {/* Tensions */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tensions to Watch</h2>
              <p className="text-sm text-gray-600 mb-4">Known contradictions or trade-offs in your strategy</p>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="E.g., premium positioning vs need for rapid growth"
                  />
                </div>
              ))}
              <button
                onClick={() => setFramework({ ...framework, tensions: [...framework.tensions, ''] })}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add Tension
              </button>
            </section>
          </div>
        )}

        {activeTab === 'onepager' && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-gray-800">
                {executiveOnePager || 'Executive one-pager will appear here after generation.'}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'qa' && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            {qaResults ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Overall Score: {qaResults.overallScore}/10</h3>
                </div>
                
                {Object.entries(qaResults).filter(([key]) => 
                  ['consistency', 'measurability', 'tensions', 'actionability', 'completeness'].includes(key)
                ).map(([category, data]: [string, any]) => (
                  <div key={category} className="border-l-4 border-gray-200 pl-4">
                    <h4 className="font-bold text-gray-900 capitalize mb-2">
                      {category} {data.pass ? '✅' : '⚠️'}
                    </h4>
                    {data.issues && data.issues.length > 0 && (
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {data.issues.map((issue: string, i: number) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    )}
                    {data.feedback && <p className="text-sm text-gray-700 mt-2">{data.feedback}</p>}
                    {data.score && <p className="text-sm text-gray-600 mt-1">Score: {data.score}/10</p>}
                  </div>
                ))}

                {qaResults.recommendations && qaResults.recommendations.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-2">Recommendations</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {qaResults.recommendations.map((rec: string, i: number) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">QA results will appear here after generation.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

