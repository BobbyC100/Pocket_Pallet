'use client'

import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [wineCount, setWineCount] = useState<number>(0)
  const [loadingCount, setLoadingCount] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchWineCount()
    }
  }, [user])

  async function fetchWineCount() {
    try {
      const response = await axios.get(`${API_URL}/api/v1/wines/count`)
      setWineCount(response.data)
    } catch (err) {
      console.error('Failed to fetch wine count:', err)
    } finally {
      setLoadingCount(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-wine-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-wine-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-800">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-wine-50">
      {/* Clean, minimal navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-full bg-wine-600 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
              </div>
              <span className="text-lg font-normal text-gray-900">
                Pocket Pallet
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.username || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 text-sm text-gray-700 hover:text-gray-900 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content - module-focused */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome section */}
        <div className="mb-10">
          <h1 className="text-2xl font-normal text-gray-900">
            Welcome back, {user.username || 'friend'}
          </h1>
          <p className="mt-1.5 text-sm text-gray-700">
            Your palate is ready to grow
          </p>
        </div>

        {/* Core modules - clean, confident layout */}
        <div className="space-y-4">
          {/* Journal - Quick entry */}
          <button className="w-full bg-white rounded-lg border border-gray-200 p-6 hover:border-wine-300 hover:shadow-sm transition-all text-left group">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="h-11 w-11 rounded-lg bg-wine-50 flex items-center justify-center group-hover:bg-wine-100 transition-colors">
                  <svg
                    className="h-6 w-6 text-wine-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-900">Journal</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Capture a bottle — photo, note, vibe
                  </p>
                </div>
              </div>
              <svg
                className="h-5 w-5 text-gray-400 group-hover:text-wine-600 transition-colors"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </div>
          </button>

          {/* Discovery */}
          <button className="w-full bg-white rounded-lg border border-gray-200 p-6 hover:border-wine-300 hover:shadow-sm transition-all text-left group">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="h-11 w-11 rounded-lg bg-clay-50 flex items-center justify-center group-hover:bg-clay-100 transition-colors">
                  <svg
                    className="h-6 w-6 text-clay-700"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-900">Discovery</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Bottles chosen for your palate
                  </p>
                </div>
              </div>
              <svg
                className="h-5 w-5 text-gray-400 group-hover:text-clay-700 transition-colors"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </div>
          </button>

          {/* Companion View */}
          <button className="w-full bg-white rounded-lg border border-gray-200 p-6 hover:border-wine-300 hover:shadow-sm transition-all text-left group">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="h-11 w-11 rounded-lg bg-sage-50 flex items-center justify-center group-hover:bg-sage-100 transition-colors">
                  <svg
                    className="h-6 w-6 text-sage-700"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-900">Companion</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Scan, identify, decide — in the moment
                  </p>
                </div>
              </div>
              <svg
                className="h-5 w-5 text-gray-400 group-hover:text-sage-700 transition-colors"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </div>
          </button>
        </div>

        {/* Palate overview - minimal stats */}
        <div className="mt-10 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-700">Your Collection</h2>
            {wineCount > 0 && (
              <button
                onClick={() => router.push('/wines')}
                className="text-xs text-wine-600 hover:text-wine-700 font-medium"
              >
                View all →
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-light text-gray-900">
                {loadingCount ? '—' : wineCount}
              </div>
              <div className="text-xs text-gray-500 mt-1">Bottles</div>
            </div>
            <div>
              <div className="text-2xl font-light text-gray-900">0</div>
              <div className="text-xs text-gray-500 mt-1">Favorites</div>
            </div>
            <div>
              <div className="text-2xl font-light text-gray-900">—</div>
              <div className="text-xs text-gray-500 mt-1">Taste profile</div>
            </div>
          </div>
          {wineCount === 0 ? (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-3">
                Start by importing bottles you&apos;ve enjoyed. Your palate will begin to take shape.
              </p>
              <button
                onClick={() => router.push('/imports/new')}
                className="text-sm text-wine-600 hover:text-wine-700 font-medium"
              >
                Import wines →
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push('/wines')}
              className="mt-4 w-full py-2 text-sm text-wine-600 hover:text-wine-700 border border-wine-200 hover:border-wine-300 rounded-md transition-colors"
            >
              Browse your collection
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
