import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Wine, Upload, ListChecks, LogOut, Search, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const Layout: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  if (!isAuthenticated) {
    return <Outlet />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <Wine className="h-6 w-6 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">Pocket Pallet</span>
              </Link>
              
              <nav className="flex space-x-4">
                <Link
                  to="/producers"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100"
                >
                  <Users className="h-4 w-4" />
                  <span>Producers</span>
                </Link>
                
                <Link
                  to="/wines"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100"
                >
                  <Search className="h-4 w-4" />
                  <span>Wines</span>
                </Link>
                
                <Link
                  to="/imports"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100"
                >
                  <Upload className="h-4 w-4" />
                  <span>Imports</span>
                </Link>
                
                <Link
                  to="/review-queue"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100"
                >
                  <ListChecks className="h-4 w-4" />
                  <span>Review Queue</span>
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/wines/new"
                className="btn-primary px-4 py-2"
              >
                New Wine
              </Link>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-sm text-gray-700 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

