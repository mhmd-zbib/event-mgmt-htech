// filepath: /home/zbib/Development/projects/htech-assesment/admin/src/routes/index.tsx
import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { publicRoutes } from './publicRoutes';
import { protectedRoutes } from './protectedRoutes';

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-2">
      <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

/**
 * Main router component that combines all routes
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            {publicRoutes}
            
            {/* Protected routes */}
            {protectedRoutes}
            
            {/* 404 route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}