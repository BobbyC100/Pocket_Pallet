import Link from 'next/link'

interface TopNavProps {
  showDashboard?: boolean;
}

export default function TopNav({ showDashboard = false }: TopNavProps) {
  return (
    <nav className="bg-banyan-bg-surface border-b border-banyan-border-default">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-banyan-primary">
            Banyan
          </Link>
          
          <div className="flex items-center space-x-4">
            {showDashboard && (
              <Link 
                href="/dashboard" 
                className="text-banyan-text-subtle hover:text-banyan-text-default transition-colors"
              >
                Dashboard
              </Link>
            )}
            <Link 
              href="/new" 
              className="btn-banyan-primary text-sm"
            >
              New Brief
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

