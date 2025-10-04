'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import VisionFrameworkV2Page from '@/components/VisionFrameworkV2Page';

type DocType = 'vision-v2' | 'founder-brief' | 'vc-summary';

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
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'vision-v2',
      title: 'Vision Framework V2',
      icon: '🎯',
      status: 'complete',
      lastUpdated: 'Today',
      completionPercent: 100
    },
    {
      id: 'founder-brief',
      title: 'Founder Brief',
      icon: '📄',
      status: 'complete',
      lastUpdated: 'Today',
      completionPercent: 100
    },
    {
      id: 'vc-summary',
      title: 'VC Summary',
      icon: '📊',
      status: 'complete',
      lastUpdated: 'Today',
      completionPercent: 100
    }
  ]);

  const [briefContent, setBriefContent] = useState<{founderBrief?: string; vcSummary?: string} | null>(null);

  // Check for data in session storage to update document statuses and load content
  useEffect(() => {
    const briefData = sessionStorage.getItem('lastGeneratedBrief');
    const visionV2Data = sessionStorage.getItem('visionFrameworkV2Draft');
    
    // Load brief content if available
    if (briefData) {
      try {
        const parsed = JSON.parse(briefData);
        setBriefContent({
          founderBrief: parsed.founderBriefMd,
          vcSummary: parsed.vcSummaryMd
        });
      } catch (error) {
        console.error('Error parsing brief data:', error);
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
                🌳 Strategic Operating System
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Your living documentation hub
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Last updated: Today</span>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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

              <button className="w-full mt-4 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors text-sm font-medium">
                + Add Document
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {activeDoc === 'vision-v2' && (
              <VisionFrameworkV2Page companyId="demo-company" embedded={true} />
            )}
            
            {activeDoc === 'founder-brief' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Founder Brief</h2>
                {briefContent?.founderBrief ? (
                  <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700">
                    <ReactMarkdown>{briefContent.founderBrief}</ReactMarkdown>
                  </div>
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">VC Summary</h2>
                {briefContent?.vcSummary ? (
                  <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700">
                    <ReactMarkdown>{briefContent.vcSummary}</ReactMarkdown>
                  </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}

