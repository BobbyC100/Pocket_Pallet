import Link from 'next/link'

interface TopNavProps {
  showDashboard?: boolean;
}

export default function TopNav({ showDashboard = false }: TopNavProps) {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-primary-600">
            Banyan
          </Link>
          
          <div className="flex items-center space-x-4">
            {showDashboard && (
              <Link 
                href="/dashboard" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
            )}
            <Link 
              href="/new" 
              className="btn-primary text-sm"
            >
              New Brief
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

