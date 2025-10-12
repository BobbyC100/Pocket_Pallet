import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pocket Pallet - Wine Management',
  description: 'Your personal wine collection management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="antialiased">
      <body className={`${inter.className} bg-wine-50 text-gray-800`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

