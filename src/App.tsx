import React from 'react';
import { LoginForm } from './components/LoginForm';
import { HomeView } from './components/home/HomeView';
import { useAuthStore } from './stores/useAuthStore';
import { ErrorBoundary } from './components/common/ErrorBoundary';

function App() {
  const { user, checkLoginStatus, isLoading } = useAuthStore();

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

  return (
    <ErrorBoundary>
      <HomeView />
    </ErrorBoundary>
  );
}

export default App;