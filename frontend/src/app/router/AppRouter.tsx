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
import { PaymentsPage } from '@/pages/PaymentsPage';
import { AdminPage } from '@/pages/AdminPage';
import { UsersManagementPage } from '@/pages/UsersManagementPage';
import { SuperAdminsPage } from '@/pages/SuperAdminsPage';
import { ReviewersPage } from '@/pages/ReviewersPage';
import { OrganizationsPage } from '@/pages/OrganizationsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { RegisterFarmPage } from '@/pages/RegisterFarmPage';
import { ForbiddenPage } from '@/pages/ForbiddenPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { RoleProtectedRoute } from '@/app/components/RoleProtectedRoute';
import { UserType } from '@/domain/enums/UserType';

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
            <RoleProtectedRoute blockedUserTypes={[UserType.OrganizationAdmin, UserType.OrganizationUser]}>
              <CategoriesPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/app/commissions"
          element={
            <RoleProtectedRoute blockedUserTypes={[UserType.OrganizationAdmin, UserType.OrganizationUser]}>
              <CommissionsPage />
            </RoleProtectedRoute>
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
          path="/app/payments"
          element={
            <ProtectedRoute>
              <PaymentsPage />
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
        <Route
          path="/app/admin/organizations"
          element={
            <ProtectedRoute>
              <OrganizationsPage />
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
