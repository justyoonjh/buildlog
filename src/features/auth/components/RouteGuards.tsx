import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { Loader2 } from 'lucide-react';
import { STATUS } from '@/shared/constants/auth';


export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, checkLoginStatus } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Status Checks
  if (user?.status === STATUS.PENDING) {
    return <Navigate to="/approval/pending" replace />;
  }

  if (user?.status === STATUS.REJECTED) {
    return <Navigate to="/approval/rejected" replace />;
  }

  if (!user) return null; // Will redirect

  return <>{children}</>;
};

export const PendingRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.status === STATUS.PENDING) return <>{children}</>;
  // If not pending, go home (which handles other cases)
  return <Navigate to="/" replace />;
};

export const RejectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.status === STATUS.REJECTED) return <>{children}</>;
  // If not rejected, go home
  return <Navigate to="/" replace />;
};

export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, checkLoginStatus } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  useEffect(() => {
    if (!isLoading && user) {
      if (user.status === STATUS.PENDING) {
        navigate('/approval/pending', { replace: true });
      } else if (user.status === STATUS.REJECTED) {
        navigate('/approval/rejected', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isLoading, user, navigate]);

  if (isLoading) return null; // or spinner

  return <>{children}</>;
};

const LoadingScreen = () => (
  <div className="flex h-screen items-center justify-center bg-slate-50">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
  </div>
);
