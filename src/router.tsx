import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, useParams, useNavigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from '@/features/auth/components/RouteGuards';
import { ErrorBoundary } from '@/shared/components/ui/ErrorBoundary';
import { Loading } from '@/shared/components/ui/Loading';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { useLogin } from '@/features/auth/hooks/useLogin';

// Lazy Load Components
const HomeView = lazy(() => import('@/features/home/components/HomeView').then(module => ({ default: module.HomeView })));
const ProjectView = lazy(() => import('@/features/project/components/ProjectView').then(module => ({ default: module.ProjectView })));
const ProjectReportView = lazy(() => import('@/features/project/components/ProjectReportView').then(module => ({ default: module.ProjectReportView })));

const LoginView = lazy(() => import('@/features/auth/components/LoginView').then(module => ({ default: module.LoginView })));
const SignupSelectionView = lazy(() => import('@/features/auth/components/SignupSelectionView').then(module => ({ default: module.SignupSelectionView })));
const BossSignupForm = lazy(() => import('@/features/auth/components/BossSignupForm').then(module => ({ default: module.BossSignupForm })));
const EmployeeSignupForm = lazy(() => import('@/features/auth/components/EmployeeSignupForm').then(module => ({ default: module.EmployeeSignupForm })));

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
            <HomeView />
          </SuspenseLayout>
        </ErrorBoundary>
      </ProtectedRoute>
    ),
  },
  {
    path: '/projects/:id',
    element: (
      <ProtectedRoute>
        <ErrorBoundary>
          <SuspenseLayout>
            <ProjectViewWrapper />
          </SuspenseLayout>
        </ErrorBoundary>
      </ProtectedRoute>
    ),
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

function ProjectViewWrapper() {
  const { id } = useParams();
  return <ProjectView initialProjectId={id} />;
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
