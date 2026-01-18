import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, useParams, useNavigate, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute, PendingRoute, RejectedRoute } from '@/features/auth/components/RouteGuards';
import { ErrorBoundary } from '@/shared/components/ui/ErrorBoundary';
import { Loading } from '@/shared/components/ui/Loading';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { useLogin } from '@/features/auth/hooks/useLogin';

// Lazy Load Components
const MainLayout = lazy(() => import('@/components/layout/MainLayout').then(module => ({ default: module.MainLayout })));
const HomeDashboardPage = lazy(() => import('@/features/home/components/HomeDashboardPage').then(module => ({ default: module.HomeDashboardPage })));
// Project Pages
const ProjectLayout = lazy(() => import('@/features/project/components/ProjectLayout').then(module => ({ default: module.ProjectLayout })));
const ConsultationPage = lazy(() => import('@/features/project/components/pages/ConsultationPage').then(module => ({ default: module.ConsultationPage })));
const EstimateListPage = lazy(() => import('@/features/project/components/pages/EstimateListPage').then(module => ({ default: module.EstimateListPage })));
const EstimateFormPage = lazy(() => import('@/features/project/components/pages/EstimateFormPage').then(module => ({ default: module.EstimateFormPage })));
const ContractPage = lazy(() => import('@/features/project/components/pages/ContractPage').then(module => ({ default: module.ContractPage })));
const ConstructionListPage = lazy(() => import('@/features/project/components/pages/ConstructionListPage').then(module => ({ default: module.ConstructionListPage })));
const ConstructionDetailPage = lazy(() => import('@/features/project/components/pages/ConstructionDetailPage').then(module => ({ default: module.ConstructionDetailPage })));
const CompletedListPage = lazy(() => import('@/features/project/components/pages/CompletedListPage').then(module => ({ default: module.CompletedListPage })));

const ProjectReportView = lazy(() => import('@/features/project/components/ProjectReportView').then(module => ({ default: module.ProjectReportView })));

const LoginView = lazy(() => import('@/features/auth/components/LoginView').then(module => ({ default: module.LoginView })));
const SignupSelectionView = lazy(() => import('@/features/auth/components/SignupSelectionView').then(module => ({ default: module.SignupSelectionView })));
const BossSignupForm = lazy(() => import('@/features/auth/components/BossSignupForm').then(module => ({ default: module.BossSignupForm })));
const EmployeeSignupForm = lazy(() => import('@/features/auth/components/EmployeeSignupForm').then(module => ({ default: module.EmployeeSignupForm })));
const PendingApprovalView = lazy(() => import('@/features/auth/components/PendingApprovalView').then(module => ({ default: module.PendingApprovalView })));
const RejectedApprovalView = lazy(() => import('@/features/auth/components/RejectedApprovalView').then(module => ({ default: module.RejectedApprovalView })));

// Loading Wrapper
const SuspenseLayout = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Loading />}>{children}</Suspense>
);

// Wrappers for Auth Pages
const LoginPage = () => (
  <PublicRoute>
    <AuthLayout title="공사_log" subtitle="현장 관리 시스템에 접속하세요">
      <SuspenseLayout><LoginViewWrapper /></SuspenseLayout>
    </AuthLayout>
  </PublicRoute>
);

const SignupSelectPage = () => (
  <PublicRoute>
    <AuthLayout title="공사_log" subtitle="회원가입 유형을 선택하세요">
      <SuspenseLayout><SignupSelectionViewWrapper /></SuspenseLayout>
    </AuthLayout>
  </PublicRoute>
);

const BossSignupPage = () => (
  <PublicRoute>
    <AuthLayout title="공사_log" subtitle="업체 등록을 시작합니다">
      <SuspenseLayout><BossSignupFormWrapper /></SuspenseLayout>
    </AuthLayout>
  </PublicRoute>
);

const EmployeeSignupPage = () => (
  <PublicRoute>
    <AuthLayout title="공사_log" subtitle="직원 등록을 시작합니다">
      <SuspenseLayout><EmployeeSignupFormWrapper /></SuspenseLayout>
    </AuthLayout>
  </PublicRoute>
);

// Wrappers for Approval Pages
const PendingPage = () => (
  <PendingRoute>
    <SuspenseLayout><PendingApprovalView /></SuspenseLayout>
  </PendingRoute>
);

const RejectedPage = () => (
  <RejectedRoute>
    <SuspenseLayout><RejectedApprovalView /></SuspenseLayout>
  </RejectedRoute>
);

const LoginViewWrapper = () => {
  const navigate = useNavigate();
  const { handleLoginSubmit, isLoading, error } = useLogin();
  return (
    <LoginView
      onSubmit={handleLoginSubmit}
      onSignupClick={() => navigate('/signup')}
      isLoading={isLoading}
      error={error}
    />
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <ErrorBoundary>
          <SuspenseLayout>
            <MainLayoutWrapper />
          </SuspenseLayout>
        </ErrorBoundary>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <HomeDashboardPageWrapper />
      },
      {
        path: 'project',
        element: <ProjectLayoutWrapper />,
        children: [
          { index: true, element: <Navigate to="consultation" replace /> },
          { path: 'consultation', element: <ConsultationPageWrapper /> },
          { path: 'estimate', element: <EstimateListPageWrapper /> },
          { path: 'estimate/new', element: <EstimateFormPageWrapper /> },
          { path: 'estimate/:id', element: <EstimateFormPageWrapper /> },
          { path: 'contract', element: <ContractPageWrapper /> },
          { path: 'construction', element: <ConstructionListPageWrapper /> },
          { path: 'construction/:id', element: <ConstructionDetailPageWrapper /> },
          { path: 'completed', element: <CompletedListPageWrapper /> },
        ]
      },
      {
        path: 'portfolio',
        element: <div className="p-4">Portfolio (Coming Soon)</div> // Placeholder or separate view
      }
    ]
  },
  {
    path: '/approval/pending',
    element: <PendingPage />,
  },
  {
    path: '/approval/rejected',
    element: <RejectedPage />,
  },
  {
    path: '/report/:id',
    element: (
      <ProtectedRoute>
        <ErrorBoundary>
          <SuspenseLayout>
            <ProjectReportViewWrapper />
          </SuspenseLayout>
        </ErrorBoundary>
      </ProtectedRoute>
    ),
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupSelectPage />,
  },
  {
    path: '/signup/boss',
    element: <BossSignupPage />,
  },
  {
    path: '/signup/employee',
    element: <EmployeeSignupPage />,
  },
]);

function MainLayoutWrapper() {
  return <MainLayout />;
}
function HomeDashboardPageWrapper() {
  return <HomeDashboardPage />;
}
function ProjectLayoutWrapper() {
  return <ProjectLayout />;
}
function ConsultationPageWrapper() {
  return <ConsultationPage />;
}
function EstimateListPageWrapper() {
  return <EstimateListPage />;
}
function EstimateFormPageWrapper() {
  return <EstimateFormPage />;
}
function ContractPageWrapper() {
  return <ContractPage />;
}
function ConstructionListPageWrapper() {
  return <ConstructionListPage />;
}
function ConstructionDetailPageWrapper() {
  return <ConstructionDetailPage />;
}
function CompletedListPageWrapper() {
  return <CompletedListPage />;
}
function ProjectReportViewWrapper() {
  const { id } = useParams();
  return <ProjectReportView projectId={id!} />;
}

function SignupSelectionViewWrapper() {
  const navigate = useNavigate();
  return <SignupSelectionView onSelectBoss={() => navigate('/signup/boss')} onSelectEmployee={() => navigate('/signup/employee')} onBack={() => navigate('/login')} />;
}

function BossSignupFormWrapper() {
  const navigate = useNavigate();
  return <BossSignupForm onCancel={() => navigate('/signup')} onComplete={() => navigate('/login')} />;
}

function EmployeeSignupFormWrapper() {
  const navigate = useNavigate();
  return <EmployeeSignupForm onCancel={() => navigate('/signup')} onComplete={() => navigate('/login')} />;
}
