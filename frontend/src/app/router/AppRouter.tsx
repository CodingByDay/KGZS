import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProductSamplesPage } from '@/pages/ProductSamplesPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { CommissionsPage } from '@/pages/CommissionsPage';
import { EvaluationsPage } from '@/pages/EvaluationsPage';
import { EvaluationDetailPage } from '@/pages/EvaluationDetailPage';
import { ProtocolsPage } from '@/pages/ProtocolsPage';
import { AdminPage } from '@/pages/AdminPage';
import { UsersManagementPage } from '@/pages/UsersManagementPage';
import { SuperAdminsPage } from '@/pages/SuperAdminsPage';
import { ReviewersPage } from '@/pages/ReviewersPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { RegisterFarmPage } from '@/pages/RegisterFarmPage';
import { ForbiddenPage } from '@/pages/ForbiddenPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/app/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/productsamples"
          element={
            <ProtectedRoute>
              <ProductSamplesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/categories"
          element={
            <ProtectedRoute>
              <CategoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/commissions"
          element={
            <ProtectedRoute>
              <CommissionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/evaluations"
          element={
            <ProtectedRoute>
              <EvaluationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/evaluations/:id"
          element={
            <ProtectedRoute>
              <EvaluationDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/protocols"
          element={
            <ProtectedRoute>
              <ProtocolsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/admin/users"
          element={
            <ProtectedRoute>
              <UsersManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/admin/superadmins"
          element={
            <ProtectedRoute>
              <SuperAdminsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/admin/reviewers"
          element={
            <ProtectedRoute>
              <ReviewersPage />
            </ProtectedRoute>
          }
        />
        <Route path="/register-farm" element={<RegisterFarmPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
