// filepath: /home/zbib/Development/projects/htech-assesment/admin/src/routes/publicRoutes.tsx
import { lazy } from 'react';
import { Route } from 'react-router-dom';

// Lazy load public page components
const LandingPage = lazy(() => import('@/pages/landing/LandingPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));

/**
 * Public routes accessible without authentication
 */
export const publicRoutes = [
  <Route key="landing" path="/" element={<LandingPage />} />,
  <Route key="login" path="/login" element={<LoginPage />} />,
];