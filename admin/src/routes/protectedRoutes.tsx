// filepath: /home/zbib/Development/projects/htech-assesment/admin/src/routes/protectedRoutes.tsx
import { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Lazy load protected admin page components
const AdminLayout = lazy(() => import('@/pages/dashboard/AdminLayout'));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));

/**
 * Protected routes that require authentication
 */
export const protectedRoutes = [
  <Route 
    key="admin" 
    path="/admin" 
    element={
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    }
  >
    <Route index element={<Navigate to="/admin/dashboard" replace />} />
    <Route path="dashboard" element={<DashboardPage />} />
    {/* Add more admin routes here as needed */}
  </Route>
];