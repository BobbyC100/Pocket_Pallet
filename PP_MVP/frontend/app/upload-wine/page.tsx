'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadWinePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to existing CSV import page
    router.replace('/imports/new');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-wine-50">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-wine-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-800">Redirecting...</p>
      </div>
    </div>
  );
}

