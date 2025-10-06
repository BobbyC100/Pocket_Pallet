"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

type DocumentType = 'brief' | 'vision_statement' | 'vision_framework_v2' | 'executive_onepager' | 'vc_summary';

interface Document {
  id: string;
  type: DocumentType;
  title: string;
  contentJson: any;
  metadata?: any;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
}

const documentTypeLabels: Record<DocumentType, { label: string; icon: string; route: string }> = {
  'brief': { label: 'Brief', icon: '📝', route: '/results' },
  'vision_statement': { label: 'Vision Statement', icon: '💡', route: '/results' },
  'vision_framework_v2': { label: 'Vision Framework', icon: '🎯', route: '/vision-framework-v2' },
  'executive_onepager': { label: 'Executive One-Pager', icon: '📄', route: '/vision-framework-v2#onepager' },
  'vc_summary': { label: 'VC Summary', icon: '💼', route: '/results' },
};

export default function Dashboard() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/login?redirect_url=/dashboard');
      return;
    }

    if (isLoaded && isSignedIn) {
      fetchDocuments();
    }
  }, [isLoaded, isSignedIn, router]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/documents');
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      setDeleting(docId);
      const response = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      // Remove from local state
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Failed to delete document. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="text-center">
          <p className="text-banyan-text-subtle">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-banyan-text-default">Dashboard</h1>
          <p className="text-sm sm:text-base text-banyan-text-subtle mt-1">Manage your strategic documents</p>
        </div>
        <a href="/new" className="btn-banyan-primary">
          <svg className="w-4 h-4 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Document
        </a>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-banyan-bg-surface rounded-lg border border-banyan-border-default p-6">
          <div className="text-3xl font-bold text-banyan-text-default">{documents.length}</div>
          <div className="text-sm text-banyan-text-subtle mt-1">Total Documents</div>
        </div>
        <div className="bg-banyan-bg-surface rounded-lg border border-banyan-border-default p-6">
          <div className="text-3xl font-bold text-banyan-text-default">
            {documents.filter(d => d.type === 'vision_framework_v2').length}
          </div>
          <div className="text-sm text-banyan-text-subtle mt-1">Vision Frameworks</div>
        </div>
        <div className="bg-banyan-bg-surface rounded-lg border border-banyan-border-default p-6">
          <div className="text-3xl font-bold text-banyan-text-default">
            {documents.filter(d => d.updatedAt && new Date(d.updatedAt).toDateString() === new Date().toDateString()).length}
          </div>
          <div className="text-sm text-banyan-text-subtle mt-1">Updated Today</div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700 p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          <button 
            onClick={fetchDocuments}
            className="mt-2 text-sm text-red-700 dark:text-red-300 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-banyan-primary border-r-transparent"></div>
          <p className="text-banyan-text-subtle mt-4">Loading your documents...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && documents.length === 0 && (
        <div className="rounded-2xl border border-banyan-border-default bg-banyan-bg-surface pt-6 px-8 pb-8 text-center shadow-banyan-mid">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-banyan-text-default mb-2">No documents yet</h2>
          <p className="text-banyan-text-subtle mb-6">Create your first Vision Statement to get started.</p>
          <a href="/new" className="btn-banyan-primary inline-block">Start Building</a>
        </div>
      )}

      {/* Documents Grid */}
      {!loading && documents.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-banyan-text-default">Your Documents</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map(doc => {
              const typeInfo = documentTypeLabels[doc.type] || { label: doc.type, icon: '📄', route: '/sos' };
              return (
                <div 
                  key={doc.id} 
                  className="rounded-lg border border-banyan-border-default bg-banyan-bg-surface pt-3 px-4 pb-4 shadow-banyan-mid hover:shadow-banyan-high transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{typeInfo.icon}</span>
                      <div>
                        <div className="font-medium text-banyan-text-default line-clamp-1">{doc.title}</div>
                        <div className="text-xs text-banyan-text-subtle">{typeInfo.label}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-banyan-text-subtle mb-4">
                    Updated {formatDate(doc.updatedAt)}
                  </div>

                  <div className="flex gap-2">
                    <a 
                      href={typeInfo.route}
                      className="btn-banyan-ghost flex-1 text-center text-sm py-2"
                    >
                      View
                    </a>
                    <button 
                      onClick={() => handleDelete(doc.id)}
                      disabled={deleting === doc.id}
                      className="btn-banyan-ghost text-sm py-2 px-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete document"
                    >
                      {deleting === doc.id ? '...' : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Strategic Tools CTA */}
      {!loading && documents.length > 0 && (
        <div className="mt-12 rounded-xl border border-banyan-border-default bg-gradient-to-br from-banyan-bg-surface to-banyan-mist p-8 text-center">
          <h2 className="text-xl font-semibold text-banyan-text-default mb-2">Ready for more?</h2>
          <p className="text-banyan-text-subtle mb-6">
            Generate Vision Frameworks, run QA checks, and explore strategic tools.
          </p>
          <a href="/new" className="btn-banyan-primary">
            Create New Document
          </a>
        </div>
      )}
    </main>
  );
}
