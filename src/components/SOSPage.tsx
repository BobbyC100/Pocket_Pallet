'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import VisionFrameworkV2Page from '@/components/VisionFrameworkV2Page';
import VcSummaryDisplay from '@/components/VcSummaryDisplay';
import LensBadge from '@/components/LensBadge';
import LensDashboardWidget from '@/components/LensDashboardWidget';
import { VcSummary, validateVcSummary } from '@/lib/vc-summary-schema';
import { exportToPDF, exportToMarkdown } from '@/lib/pdf-export';
import { exportFrameworkToPDF, exportBriefToPDF, exportCompleteToPDF } from '@/lib/pdf-export-v2';

type DocType = 'vision-v2' | 'executive-onepager' | 'founder-brief' | 'vc-summary' | 'qa-results';

interface Document {
  id: DocType;
  title: string;
  icon: string;
  status: 'complete' | 'draft' | 'empty';
  lastUpdated?: string;
  completionPercent?: number;
}

export default function SOSPage() {
  // Check if we just created V2 framework and should show it
  const [activeDoc, setActiveDoc] = useState<DocType>('vision-v2');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for V2 framework data on mount
    if (typeof window !== 'undefined') {
      const hasV2 = sessionStorage.getItem('visionFrameworkV2Draft');
      if (hasV2) {
        setActiveDoc('vision-v2');
      } else {
        setActiveDoc('founder-brief');
      }
    }
  }, []);

  // Export handlers
  const handleExportCurrent = async () => {
    const currentDoc = documents.find(doc => doc.id === activeDoc);
    if (!currentDoc) return;

    try {
      if (activeDoc === 'vision-v2') {
        // Export Vision Framework as PDF
        const draftData = sessionStorage.getItem('visionFrameworkV2Draft');
        if (!draftData) {
          alert('No Vision Framework data found');
          return;
        }
        
        const parsed = JSON.parse(draftData);
        if (!parsed.framework) {
          alert('Framework data is incomplete');
          return;
        }

        console.log('📄 Exporting Vision Framework to PDF...');
        exportFrameworkToPDF(parsed.framework, `vision-framework-${Date.now()}.pdf`);
        console.log('✅ Vision Framework PDF exported successfully');
        
      } else if (activeDoc === 'founder-brief') {
        // Export Vision Statement as PDF
        const briefData = sessionStorage.getItem('lastGeneratedBrief');
        if (!briefData) {
          alert('No Vision Statement data found');
          return;
        }
        
        const parsed = JSON.parse(briefData);
        if (!parsed.founderBriefMd) {
          alert('Vision Statement data is incomplete');
          return;
        }

        // Parse markdown sections
        const cleanText = (md: string) => {
          return md
            .replace(/#{1,6}\s/g, '')
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .replace(/\*(.+?)\*/g, '$1')
            .replace(/\[(.+?)\]\(.+?\)/g, '$1')
            .trim();
        };

        console.log('📄 Exporting Vision Statement to PDF...');
        exportBriefToPDF({
          problem: cleanText(parsed.founderBriefMd.split('## Problem')[1]?.split('##')[0] || ''),
          solution: cleanText(parsed.founderBriefMd.split('## Solution')[1]?.split('##')[0] || ''),
          market: cleanText(parsed.founderBriefMd.split('## Market')[1]?.split('##')[0] || ''),
          uniqueValue: cleanText(parsed.founderBriefMd.split('## What Makes Us Different')[1]?.split('##')[0] || ''),
          targetCustomer: cleanText(parsed.founderBriefMd.split('## Target Customer')[1]?.split('##')[0] || ''),
          businessModel: cleanText(parsed.founderBriefMd.split('## Business Model')[1]?.split('##')[0] || ''),
          traction: cleanText(parsed.founderBriefMd.split('## Current Traction')[1]?.split('##')[0] || ''),
          team: cleanText(parsed.founderBriefMd.split('## Team')[1]?.split('##')[0] || ''),
          competition: cleanText(parsed.founderBriefMd.split('## Competition')[1]?.split('##')[0] || ''),
          name: 'Vision Statement',
          createdAt: new Date().toISOString()
        }, `vision-statement-${Date.now()}.pdf`);
        console.log('✅ Vision Statement PDF exported successfully');
        
      } else {
        // Fallback: Export as text for other document types
        const element = document.getElementById('document-content');
        if (!element) return;

        const content = element.innerText;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentDoc.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('❌ Export failed:', error);
      alert('Failed to export document. Please try again.');
    }
  };

  const handleExportAll = async () => {
    // Export all documents as separate files
    for (const doc of documents) {
      setActiveDoc(doc.id);
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for render
      
      const element = document.getElementById('document-content');
      if (!element) continue;

      const content = element.innerText;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait between downloads
    }
  };
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'vision-v2',
      title: 'Vision Framework',
      icon: '',
      status: 'complete',
      lastUpdated: 'Today',
      completionPercent: 100
    },
    {
      id: 'executive-onepager',
      title: 'Executive One-Pager',
      icon: '',
      status: 'complete',
      lastUpdated: 'Today',
      completionPercent: 100
    },
    {
      id: 'founder-brief',
      title: 'Vision Statement',
      icon: '',
      status: 'complete',
      lastUpdated: 'Today',
      completionPercent: 100
    },
    {
      id: 'vc-summary',
      title: 'VC Summary',
      icon: '',
      status: 'complete',
      lastUpdated: 'Today',
      completionPercent: 100
    },
    {
      id: 'qa-results',
      title: 'QA Results',
      icon: '',
      status: 'complete',
      lastUpdated: 'Today',
      completionPercent: 100
    }
  ]);

  const [briefContent, setBriefContent] = useState<{founderBrief?: string; vcSummary?: string; vcSummaryStructured?: VcSummary; vcSummaryScores?: any; vcLensScores?: any} | null>(null);
  const [visionV2Content, setVisionV2Content] = useState<{executiveOnePager?: string; qaResults?: any; lensScores?: any} | null>(null);
  const [scoringVcLens, setScoringVcLens] = useState(false);

  // Check for data in session storage to update document statuses and load content
  useEffect(() => {
    const briefData = sessionStorage.getItem('lastGeneratedBrief');
    const visionV2Data = sessionStorage.getItem('visionFrameworkV2Draft');
    
    // Load brief content if available
    if (briefData) {
      try {
        const parsed = JSON.parse(briefData);
        console.log('📄 Loaded brief data:', {
          hasFounderBrief: !!parsed.founderBriefMd,
          hasVcSummary: !!parsed.vcSummaryMd,
          founderBriefLength: parsed.founderBriefMd?.length,
          vcSummaryLength: parsed.vcSummaryMd?.length
        });
        // Validate structured VC Summary if available
        let vcSummaryStructured = undefined;
        if (parsed.vcSummaryStructured) {
          const validation = validateVcSummary(parsed.vcSummaryStructured);
          if (validation.success) {
            vcSummaryStructured = validation.data;
            console.log('✅ Structured VC Summary loaded and validated');
          } else {
            console.warn('⚠️ VC Summary validation failed:', validation.errors);
          }
        }
        
        // Load VC Summary scores if available
        const vcSummaryScores = parsed.vcSummaryScores;
        if (vcSummaryScores) {
          console.log('✅ VC Summary scores loaded');
        }
        
        // Load VC Lens scores if available
        const vcLensScores = parsed.vcLensScores;
        if (vcLensScores) {
          console.log('✅ VC Lens scores loaded');
        }
        
        setBriefContent({
          founderBrief: parsed.founderBriefMd,
          vcSummary: parsed.vcSummaryMd,
          vcSummaryStructured,
          vcSummaryScores,
          vcLensScores
        });
      } catch (error) {
        console.error('Error parsing brief data:', error);
      }
    } else {
      console.log('⚠️ No brief data in session storage');
    }
    
    // Load Vision V2 content if available
    if (visionV2Data) {
      try {
        const parsed = JSON.parse(visionV2Data);
        console.log('🎯 Loaded Vision V2 data:', {
          hasOnePager: !!parsed.executiveOnePager,
          hasQA: !!parsed.metadata?.qaChecks,
          hasLensScores: !!parsed.lensScores
        });
        setVisionV2Content({
          executiveOnePager: parsed.executiveOnePager,
          qaResults: parsed.metadata?.qaChecks,
          lensScores: parsed.lensScores
        });
      } catch (error) {
        console.error('Error parsing Vision V2 data:', error);
      }
    }
    
    setDocuments(prev => prev.map(doc => {
      if (doc.id === 'founder-brief' && briefData) {
        return { ...doc, status: 'complete' as const };
      }
      if (doc.id === 'vision-v2' && visionV2Data) {
        return { ...doc, status: 'complete' as const };
      }
      if (doc.id === 'vc-summary' && briefData) {
        return { ...doc, status: 'complete' as const };
      }
      return doc;
    }));
  }, []);

  const handleScoreVcWithLens = async () => {
    if (!briefContent?.vcSummaryStructured) return;
    
    setScoringVcLens(true);
    
    try {
      // Convert structured VC summary to text for scoring
      const summary = briefContent.vcSummaryStructured;
      const content = `
What & Why Now: ${summary.whatWhyNow}

Market: ${summary.market}

Solution & Differentiation:
${summary.solutionDiff.map((d: string, i: number) => `${i + 1}. ${d}`).join('\n')}

Traction:
${summary.traction.map((t: any, i: number) => `${i + 1}. ${t.metric}: ${t.value} (${t.timeframe})`).join('\n')}

Business Model: ${summary.businessModel}

Go-to-Market: ${summary.gtm}

Team: ${summary.team}

Ask & Use of Funds: ${summary.ask.amount}
${summary.ask.useOfFunds.map((u: string, i: number) => `${i + 1}. ${u}`).join('\n')}

Risks & Mitigations:
${summary.risks.map((r: any, i: number) => `${i + 1}. Risk: ${r.risk} | Mitigation: ${r.mitigation}`).join('\n')}

KPIs (6 months):
${summary.kpis6mo.map((k: string, i: number) => `${i + 1}. ${k}`).join('\n')}
      `.trim();

      const response = await fetch('/api/lens/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          documentId: 'vc-summary',
          documentType: 'vc_summary'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to score VC summary');
      }

      const result = await response.json();
      
      // Update briefContent with lens scores
      setBriefContent(prev => prev ? { ...prev, vcLensScores: result } : null);
      
      // Store in session storage
      const briefData = JSON.parse(sessionStorage.getItem('lastGeneratedBrief') || '{}');
      briefData.vcLensScores = result;
      sessionStorage.setItem('lastGeneratedBrief', JSON.stringify(briefData));
      
      console.log('✅ VC Summary lens scored:', result);
    } catch (error) {
      console.error('❌ VC Summary lens scoring failed:', error);
    } finally {
      setScoringVcLens(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-banyan-success/20 text-banyan-success';
      case 'draft': return 'bg-banyan-warning/20 text-banyan-warning';
      case 'empty': return 'bg-banyan-bg-base text-banyan-text-subtle';
      default: return 'bg-banyan-bg-base text-banyan-text-subtle';
    }
  };

  return (
    <div className="min-h-screen bg-banyan-bg-base">
      {/* Header */}
      <div className="bg-banyan-bg-surface border-b border-banyan-border-default sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-banyan-text-default">
                Strategic Operating System
              </h1>
              <p className="text-sm text-banyan-text-subtle mt-1">
                Your living documentation hub
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-banyan-text-subtle">Last updated: Today</span>
              <button 
                onClick={handleExportCurrent}
                className="btn-banyan-ghost flex items-center gap-2"
                title="Download current document as PDF"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Export PDF
              </button>
              <button 
                onClick={handleExportAll}
                className="btn-banyan-primary"
              >
                Export All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Lens Dashboard Widget */}
        <LensDashboardWidget 
          visionLensScores={visionV2Content?.lensScores}
          vcLensScores={briefContent?.vcLensScores}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-banyan-bg-surface rounded-lg shadow-banyan-mid border border-banyan-border-default p-4 sticky top-24">
              <h2 className="text-sm font-semibold text-banyan-text-default mb-3 uppercase tracking-wide">
                Documents
              </h2>
              <nav className="space-y-2">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setActiveDoc(doc.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      activeDoc === doc.id
                        ? 'bg-banyan-primary/10 border-2 border-banyan-primary text-banyan-primary'
                        : 'bg-banyan-bg-base border border-banyan-border-default text-banyan-text-default hover:bg-banyan-mist'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{doc.icon}</span>
                        <div>
                          <div className="font-medium text-sm">{doc.title}</div>
                          {doc.lastUpdated && (
                            <div className="text-xs text-banyan-text-subtle mt-0.5">
                              {doc.lastUpdated}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                        {doc.completionPercent !== undefined && (
                          <span className="text-xs text-banyan-text-subtle">
                            {doc.completionPercent}%
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div id="document-content" className="lg:col-span-3">
            {activeDoc === 'vision-v2' && (
              <VisionFrameworkV2Page companyId="demo-company" embedded={true} editOnly={true} />
            )}
            
            {activeDoc === 'executive-onepager' && (
              <div className="bg-banyan-bg-surface rounded-lg shadow-banyan-mid border border-banyan-border-default p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-banyan-text-default">Executive One-Pager</h2>
                </div>
                {visionV2Content?.executiveOnePager ? (
                  <>
                    <div className="prose prose-sm max-w-none">
                      <div 
                        className="whitespace-pre-wrap text-banyan-text-default leading-relaxed text-sm"
                        dangerouslySetInnerHTML={{ 
                          __html: visionV2Content.executiveOnePager
                           .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                           .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
                           .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-4 mb-2">$1</h3>')
                           .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
                           .replace(/(<li[\s\S]*?<\/li>)/g, '<ul class="list-disc ml-6 space-y-1">$1</ul>')
                           .replace(/\n\n/g, '<br/><br/>')
                        }}
                      />
                    </div>
                    <div className="mt-6 pt-6 border-t border-banyan-border-default">
                      <p className="text-sm text-banyan-text-subtle">
                        <strong>Purpose:</strong> Quick reference for team / board / advisors
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-banyan-text-subtle">
                      Your executive one-pager will appear here. Generate a Vision Framework first.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {activeDoc === 'founder-brief' && (
              <div className="bg-banyan-bg-surface rounded-lg shadow-banyan-mid border border-banyan-border-default p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-banyan-text-default">Vision Statement</h2>
                </div>
                {briefContent?.founderBrief ? (
                  <>
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-banyan-text-default leading-relaxed">
                        <ReactMarkdown>{briefContent.founderBrief}</ReactMarkdown>
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-banyan-border-default">
                      <p className="text-sm text-banyan-text-subtle">
                        <strong>Purpose:</strong> Internal narrative for founders, team, and advisors
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-banyan-text-subtle">
                      Your Vision Statement will appear here. Generate one from the{' '}
                      <a href="/new" className="link-underline text-banyan-primary">
                        Start Building
                      </a>{' '}
                      page.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {activeDoc === 'vc-summary' && (
              <div className="bg-banyan-bg-surface rounded-lg shadow-banyan-mid border border-banyan-border-default p-8">
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-banyan-text-default">VC Summary</h2>
                  </div>
                  {briefContent?.vcSummaryStructured && (
                    <button
                      onClick={handleScoreVcWithLens}
                      disabled={scoringVcLens}
                      className="btn-banyan-ghost text-sm"
                      title="Score with Founder's Lens"
                    >
                      {scoringVcLens ? 'Scoring...' : 'Score with Lens'}
                    </button>
                  )}
                </div>
                
                {/* Lens Badge */}
                {briefContent?.vcLensScores && (
                  <div className="mb-6">
                    <LensBadge
                      clarity={briefContent.vcLensScores.scores?.clarity}
                      alignment={briefContent.vcLensScores.scores?.alignment}
                      actionability={briefContent.vcLensScores.scores?.actionability}
                      overall={briefContent.vcLensScores.scores?.overall}
                      badge={briefContent.vcLensScores.badge}
                      message={briefContent.vcLensScores.message}
                      feedback={briefContent.vcLensScores.scores?.feedback}
                    />
                  </div>
                )}
                
                {briefContent?.vcSummaryStructured ? (
                  <>
                    <VcSummaryDisplay 
                      summary={briefContent.vcSummaryStructured} 
                      scores={briefContent.vcSummaryScores}
                    />
                    <div className="mt-6 pt-6 border-t border-banyan-border-default">
                      <p className="text-sm text-banyan-text-subtle">
                        <strong>Purpose:</strong> Investor pitch deck companion / email intro
                      </p>
                    </div>
                  </>
                ) : briefContent?.vcSummary ? (
                  <>
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-banyan-text-default leading-relaxed">
                        <ReactMarkdown>{briefContent.vcSummary}</ReactMarkdown>
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-banyan-border-default">
                      <p className="text-sm text-banyan-text-subtle">
                        <strong>Purpose:</strong> Investor pitch deck companion / email intro
                      </p>
                      <p className="text-xs text-banyan-text-subtle mt-2">
                        Note: Using fallback markdown format. Generate a new brief for structured format.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-banyan-text-subtle">
                      Your VC summary will appear here. Generate one from the{' '}
                      <a href="/new" className="link-underline text-banyan-primary">
                        Start Building
                      </a>{' '}
                      page.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {activeDoc === 'qa-results' && (
              <div className="bg-banyan-bg-surface rounded-lg shadow-banyan-mid border border-banyan-border-default p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-banyan-text-default">QA Results</h2>
                </div>
                {visionV2Content?.qaResults ? (
                  <div className="space-y-6">
                    {/* Overall Score */}
                    <div className="bg-banyan-bg-base rounded-lg p-6 border border-banyan-border-default">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-banyan-text-default">Overall Quality</h3>
                        <span className="text-3xl font-bold text-banyan-success">
                          {visionV2Content.qaResults.overallScore || 'N/A'}%
                        </span>
                      </div>
                      {visionV2Content.qaResults.summary && (
                        <p className="text-banyan-text-default">{visionV2Content.qaResults.summary}</p>
                      )}
                    </div>

                    {/* Issues Found */}
                    {visionV2Content.qaResults.issues && visionV2Content.qaResults.issues.length > 0 && (
                      <div className="bg-banyan-bg-base rounded-lg p-6 border border-banyan-border-default">
                        <h3 className="text-xl font-semibold text-banyan-text-default mb-4">Issues Found</h3>
                        <div className="space-y-3">
                          {visionV2Content.qaResults.issues.map((issue: any, idx: number) => (
                            <div key={idx} className="border-l-4 border-banyan-warning pl-4 py-2 bg-banyan-bg-surface rounded">
                              <p className="text-sm font-medium text-banyan-warning">{issue.severity || 'Warning'}</p>
                              <p className="text-banyan-text-default mt-1">{issue.description || issue}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {visionV2Content.qaResults.recommendations && visionV2Content.qaResults.recommendations.length > 0 && (
                      <div className="bg-banyan-bg-base rounded-lg p-6 border border-banyan-border-default">
                        <h3 className="text-xl font-semibold text-banyan-text-default mb-4">Recommendations</h3>
                        <div className="space-y-3">
                          {visionV2Content.qaResults.recommendations.map((rec: any, idx: number) => (
                            <div key={idx} className="border-l-4 border-banyan-primary pl-4 py-2 bg-banyan-bg-surface rounded">
                              <p className="text-banyan-text-default">{rec.text || rec}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-banyan-text-subtle">
                      QA results will appear here. Generate a Vision Framework first.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

