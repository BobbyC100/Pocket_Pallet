'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import VisionFrameworkV2Page from '@/components/VisionFrameworkV2Page';
import { exportToPDF, exportToMarkdown } from '@/lib/pdf-export';

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
  const [activeDoc, setActiveDoc] = useState<DocType>(() => {
    if (typeof window !== 'undefined') {
      const hasV2 = sessionStorage.getItem('visionFrameworkV2Draft');
      return hasV2 ? 'vision-v2' : 'founder-brief';
    }
    return 'vision-v2';
  });

  // Export handlers
  const handleExportCurrent = async () => {
    // For now, just download the HTML content as a text file
    // You can enhance this to use proper PDF export later
    const currentDoc = documents.find(doc => doc.id === activeDoc);
    if (!currentDoc) return;

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
      title: 'Founder Brief',
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

  const [briefContent, setBriefContent] = useState<{founderBrief?: string; vcSummary?: string} | null>(null);
  const [visionV2Content, setVisionV2Content] = useState<{executiveOnePager?: string; qaResults?: any} | null>(null);

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
        setBriefContent({
          founderBrief: parsed.founderBriefMd,
          vcSummary: parsed.vcSummaryMd
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
          hasQA: !!parsed.metadata?.qaChecks
        });
        setVisionV2Content({
          executiveOnePager: parsed.executiveOnePager,
          qaResults: parsed.metadata?.qaChecks
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'empty': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Strategic Operating System
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Your living documentation hub
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Last updated: Today</span>
              <button 
                onClick={handleExportCurrent}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Export Current
              </button>
              <button 
                onClick={handleExportAll}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Export All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
              <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Documents
              </h2>
              <nav className="space-y-2">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setActiveDoc(doc.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      activeDoc === doc.id
                        ? 'bg-blue-50 border-2 border-blue-500 text-blue-900'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{doc.icon}</span>
                        <div>
                          <div className="font-medium text-sm">{doc.title}</div>
                          {doc.lastUpdated && (
                            <div className="text-xs text-gray-500 mt-0.5">
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
                          <span className="text-xs text-gray-500">
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
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Executive One-Pager</h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    Gemini 2.5 Flash
                  </span>
                </div>
                {visionV2Content?.executiveOnePager ? (
                  <>
                    <div className="prose prose-sm max-w-none">
                      <div 
                        className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm"
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
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <p className="text-sm text-gray-500">
                        <strong>Purpose:</strong> Quick reference for team / board / advisors
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-600">
                      Your executive one-pager will appear here. Generate a Vision Framework first.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {activeDoc === 'founder-brief' && (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Founder Brief</h2>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    GPT-4 Generated
                  </span>
                </div>
                {briefContent?.founderBrief ? (
                  <>
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        <ReactMarkdown>{briefContent.founderBrief}</ReactMarkdown>
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <p className="text-sm text-gray-500">
                        <strong>Purpose:</strong> Internal narrative for founders, team, and advisors
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-600">
                      Your founder brief will appear here. Generate a brief from the{' '}
                      <a href="/new" className="text-blue-600 hover:text-blue-700">
                        Create Brief
                      </a>{' '}
                      page.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {activeDoc === 'vc-summary' && (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">VC Summary</h2>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    GPT-4 Generated
                  </span>
                </div>
                {briefContent?.vcSummary ? (
                  <>
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        <ReactMarkdown>{briefContent.vcSummary}</ReactMarkdown>
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <p className="text-sm text-gray-500">
                        <strong>Purpose:</strong> Investor pitch deck companion / email intro
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-600">
                      Your VC summary will appear here. Generate a brief from the{' '}
                      <a href="/new" className="text-blue-600 hover:text-blue-700">
                        Create Brief
                      </a>{' '}
                      page.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {activeDoc === 'qa-results' && (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">QA Results</h2>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                    Gemini 2.5 Pro
                  </span>
                </div>
                {visionV2Content?.qaResults ? (
                  <div className="space-y-6">
                    {/* Overall Score */}
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">Overall Quality</h3>
                        <span className="text-3xl font-bold text-green-600">
                          {visionV2Content.qaResults.overallScore || 'N/A'}%
                        </span>
                      </div>
                      {visionV2Content.qaResults.summary && (
                        <p className="text-gray-700">{visionV2Content.qaResults.summary}</p>
                      )}
                    </div>

                    {/* Issues Found */}
                    {visionV2Content.qaResults.issues && visionV2Content.qaResults.issues.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Issues Found</h3>
                        <div className="space-y-3">
                          {visionV2Content.qaResults.issues.map((issue: any, idx: number) => (
                            <div key={idx} className="border-l-4 border-yellow-500 pl-4 py-2 bg-white rounded">
                              <p className="text-sm font-medium text-yellow-700">{issue.severity || 'Warning'}</p>
                              <p className="text-gray-700 mt-1">{issue.description || issue}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {visionV2Content.qaResults.recommendations && visionV2Content.qaResults.recommendations.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Recommendations</h3>
                        <div className="space-y-3">
                          {visionV2Content.qaResults.recommendations.map((rec: any, idx: number) => (
                            <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2 bg-white rounded">
                              <p className="text-gray-700">{rec.text || rec}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-600">
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

