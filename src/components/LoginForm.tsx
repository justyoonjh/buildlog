import React, { useState } from 'react';
import { BossSignupForm } from './BossSignupForm';
import { EmployeeSignupForm } from './EmployeeSignupForm';
import { AuthLayout } from './AuthLayout';
import { LoginView } from './LoginView';
import { SignupSelectionView } from './SignupSelectionView';
import { useAuthStore } from '../stores/useAuthStore';
import { authService } from '../services/authService';

interface LoginAttempt {
  count: number;
  lockUntil: number | null;
}

export const LoginForm: React.FC = () => {
  const [view, setView] = useState<'login' | 'signup-select' | 'signup-boss' | 'signup-employee'>('login');
  const { login, isLoading, error: storeError, clearError } = useAuthStore();

  // Local state for lockout logic (client-side security layer)
  const [loginAttempts, setLoginAttempts] = useState<Record<string, LoginAttempt>>({});
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (id: string, password: string) => {
    clearError();
    setLocalError(null);
    const trimmedId = id.trim().toLowerCase();

    // Check Lockout
    const currentAttempt = loginAttempts[trimmedId];
    if (currentAttempt?.lockUntil && Date.now() < currentAttempt.lockUntil) {
      const remainingMinutes = Math.ceil((currentAttempt.lockUntil - Date.now()) / 1000 / 60);
      setLocalError(`로그인 시도 횟수 초과로 계정이 잠겼습니다. ${remainingMinutes}분 후에 다시 시도해주세요.`);
      return;
    }

    setIsSubmitting(true);

    // Attempt Login via Store
    try {
      const result = await authService.login(trimmedId, password);
      if (result) {
        login(result);
        // Clear attempts on success
        const newAttempts = { ...loginAttempts };
        delete newAttempts[trimmedId];
        setLoginAttempts(newAttempts);
      } else {
        const newAttempts = { ...loginAttempts };
        const currentCount = (newAttempts[trimmedId]?.count || 0) + 1;
        let lockTime: number | null = null;

        if (currentCount > 5) {
          lockTime = Date.now() + 30 * 60 * 1000;
          setLocalError('비밀번호를 5회 이상 틀려 30분간 접속이 제한됩니다.');
        } else {
          setLocalError('아이디 또는 비밀번호가 올바르지 않습니다.');
        }

        setLoginAttempts({
          ...newAttempts,
          [trimmedId]: { count: currentCount, lockUntil: lockTime }
        });
      }
    } catch (err) {
      setLocalError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    switch (view) {
      case 'login': return '공사_log';
      case 'signup-select': return '공사_log';
      case 'signup-boss': return '공사_log';
      case 'signup-employee': return '공사_log';
      default: return '공사_log';
    }
  };

  const getSubtitle = () => {
    switch (view) {
      case 'login': return '현장 관리 시스템에 접속하세요';
      case 'signup-select': return '회원가입 유형을 선택하세요';
      case 'signup-boss': return '업체 등록을 시작합니다';
      case 'signup-employee': return '직원 등록을 시작합니다';
      default: return undefined;
    }
  };

  return (
    <AuthLayout title={getTitle()} subtitle={getSubtitle()}>
      {view === 'login' && (
        <LoginView
          onSubmit={handleLoginSubmit}
          onSignupClick={() => setView('signup-select')}
          isLoading={isLoading || isSubmitting}
          error={localError || storeError}
        />
      )}

      {view === 'signup-select' && (
        <SignupSelectionView
          onSelectBoss={() => setView('signup-boss')}
          onSelectEmployee={() => setView('signup-employee')}
          onBack={() => setView('login')}
        />
      )}

      {view === 'signup-boss' && (
        <BossSignupForm
          onCancel={() => setView('signup-select')}
          onComplete={() => setView('login')}
        />
      )}

      {view === 'signup-employee' && (
        <EmployeeSignupForm
          onCancel={() => setView('signup-select')}
          onComplete={() => setView('login')}
        />
      )}
    </AuthLayout>
  );
};
