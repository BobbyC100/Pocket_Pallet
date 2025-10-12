"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CsvUpload from "@/app/components/CsvUpload";

export default function ImportNewPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wine-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wine-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-wine-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-xl font-semibold">Pocket Pallet</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-sm text-wine-600 hover:text-wine-700"
              >
                ← Back to Dashboard
              </button>
              <span className="text-sm text-gray-600">{user.username}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Import Wines
          </h1>
          <p className="text-gray-700">
            Upload a CSV file to add wines to your collection. The file should include columns for name, price, region, grapes, vintage, and notes.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <CsvUpload />
        </div>

        <div className="mt-6 p-4 bg-wine-50 rounded-lg border border-wine-200">
          <h3 className="font-medium text-wine-900 mb-2">CSV Format</h3>
          <p className="text-sm text-wine-700 mb-2">
            Your CSV should have the following columns:
          </p>
          <ul className="text-sm text-wine-600 space-y-1 ml-4">
            <li>• <strong>name</strong> (required)</li>
            <li>• price_usd (optional)</li>
            <li>• url (optional)</li>
            <li>• region (optional)</li>
            <li>• grapes (optional)</li>
            <li>• vintage (optional)</li>
            <li>• notes (optional)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

