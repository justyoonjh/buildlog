import React from 'react';
import { LoginForm } from './components/LoginForm';
import { HomeView } from './components/home/HomeView';
import { useAuthStore } from './stores/useAuthStore';
import { ErrorBoundary } from './components/common/ErrorBoundary';

import { setupInterceptors } from './services/apiClientInterceptor';

// Initialize Axios Interceptor
setupInterceptors();

import { StandaloneEstimateView } from './components/project/StandaloneEstimateView';
import { ProjectReportView } from './components/project/ProjectReportView';

// Initialize Axios Interceptor
setupInterceptors();

function App() {
  const { user, checkLoginStatus, isLoading } = useAuthStore();

  // Check for standalone view (URL Routing)
  const searchParams = new URLSearchParams(window.location.search);
  const viewType = searchParams.get('view');
  const viewId = searchParams.get('id');

  // If viewing a standalone estimate, render it directly (bypass auth check for now if needed, or keep auth?)
  // User asked to "view in new page", usually implies authenticated context.
  // Note: We still check auth below. If not logged in, it shows Login. 
  // Ideally, after login, it should redirect back here.

  React.useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-50">Loading...</div>;
  }

  if (!user) {
    return (
      <ErrorBoundary>
        <LoginForm />
      </ErrorBoundary>
    );
  }

  if (viewType === 'estimate' && viewId) {
    return (
      <ErrorBoundary>
        <StandaloneEstimateView projectId={viewId} />
      </ErrorBoundary>
    );
  }

  if (viewType === 'report' && viewId) {
    return (
      <ErrorBoundary>
        <ProjectReportView projectId={viewId} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <HomeView />
    </ErrorBoundary>
  );
}

export default App;