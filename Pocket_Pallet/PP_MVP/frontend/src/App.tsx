import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Layout } from '@/components/Layout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { WineList } from '@/pages/WineList';
import { WineForm } from '@/pages/WineForm';
import { ImportList } from '@/pages/ImportList';
import { ReviewQueue } from '@/pages/ReviewQueue';
import { ProducerList } from '@/pages/ProducerList';
import { useAuth } from '@/hooks/useAuth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/login" element={<Login />} />
            
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/wines"
              element={
                <ProtectedRoute>
                  <WineList />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/wines/new"
              element={
                <ProtectedRoute>
                  <WineForm />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/wines/:id"
              element={
                <ProtectedRoute>
                  <WineForm />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/imports"
              element={
                <ProtectedRoute>
                  <ImportList />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/review-queue"
              element={
                <ProtectedRoute>
                  <ReviewQueue />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/producers"
              element={
                <ProtectedRoute>
                  <ProducerList />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;

