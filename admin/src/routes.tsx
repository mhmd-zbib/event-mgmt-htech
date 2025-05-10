import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';

// Lazy load page components from the pages directory
const HeroPage = lazy(() => import('./pages/landing/HeroPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const AdminLayout = lazy(() => import('./components/layout/AdminLayout').then(module => ({ default: module.AdminLayout })));

// Events pages
const EventsListPage = lazy(() => import('./pages/events/EventsListPage'));
const EventDetailPage = lazy(() => import('./pages/events/EventDetailPage'));
const EventCreatePage = lazy(() => import('./pages/events/EventCreatePage'));
const EventEditPage = lazy(() => import('./pages/events/EventEditPage'));

// Categories pages
const CategoriesListPage = lazy(() => import('./pages/categories/CategoriesListPage'));
const CategoryCreatePage = lazy(() => import('./pages/categories/CategoryCreatePage'));
const CategoryEditPage = lazy(() => import('./pages/categories/CategoryEditPage'));

// Tags pages
const TagsListPage = lazy(() => import('./pages/tags/TagsListPage'));
const TagCreatePage = lazy(() => import('./pages/tags/TagCreatePage'));
const TagEditPage = lazy(() => import('./pages/tags/TagEditPage'));

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-2">
      <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Protected route component that redirects to login if not authenticated
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Public route component that redirects to events if already authenticated
function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/events" replace />;
  }
  
  return <>{children}</>;
}

// Main Routes component
export function Routes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <RouterRoutes>
            {/* Public routes */}
            <Route path="/" element={<HeroPage />} />
            <Route path="/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              {/* Events routes */}
              <Route path="events" element={<EventsListPage />} />
              <Route path="events/create" element={<EventCreatePage />} />
              <Route path="events/:id" element={<EventDetailPage />} />
              <Route path="events/:id/edit" element={<EventEditPage />} />
              
              {/* Categories routes */}
              <Route path="categories" element={<CategoriesListPage />} />
              <Route path="categories/create" element={<CategoryCreatePage />} />
              <Route path="categories/:id/edit" element={<CategoryEditPage />} />
              
              {/* Tags routes */}
              <Route path="tags" element={<TagsListPage />} />
              <Route path="tags/create" element={<TagCreatePage />} />
              <Route path="tags/:id/edit" element={<TagEditPage />} />
            </Route>
            
            {/* Redirect /admin paths to /events for backward compatibility */}
            <Route path="/admin" element={<Navigate to="/events" replace />} />
            <Route path="/admin/events" element={<Navigate to="/events" replace />} />
            <Route path="/admin/events/:id" element={<Navigate to="/events/:id" replace />} />
            
            {/* 404 route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </RouterRoutes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}