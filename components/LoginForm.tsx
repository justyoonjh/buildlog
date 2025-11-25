import React, { useState } from 'react';
import { User } from '../types';
import { verifyPassword } from '../utils/security';
import { BossSignupForm } from './BossSignupForm';
import { EmployeeSignupForm } from './EmployeeSignupForm';
import { AuthLayout } from './AuthLayout';
import { LoginView } from './LoginView';
import { SignupSelectionView } from './SignupSelectionView';

interface LoginFormProps {
  onLogin: (user: User) => void;
}

interface LoginAttempt {
  count: number;
  lockUntil: number | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [view, setView] = useState<'login' | 'signup-select' | 'signup-boss' | 'signup-employee'>('login');

  // Login State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState<Record<string, LoginAttempt>>({});

  const handleLoginSubmit = async (id: string, password: string) => {
    setError(null);
    const trimmedId = id.trim().toLowerCase();

    // Check Lockout
    const currentAttempt = loginAttempts[trimmedId];
    if (currentAttempt?.lockUntil && Date.now() < currentAttempt.lockUntil) {
      const remainingMinutes = Math.ceil((currentAttempt.lockUntil - Date.now()) / 1000 / 60);
      setError(`로그인 시도 횟수 초과로 계정이 잠겼습니다. ${remainingMinutes}분 후에 다시 시도해주세요.`);
      return;
    }

    setIsLoading(true);

    setTimeout(async () => {
      if (!trimmedId || !password) {
        setError('아이디와 비밀번호를 모두 입력해주세요.');
        setIsLoading(false);
        return;
      }

      let isValidUser = false;
      let userName = '';
      let userRole: 'admin' | 'user' = 'user';

      // 1. Check Hardcoded Admin
      if (trimmedId === 'admin' && password === 'password123!') {
        isValidUser = true;
        userName = '현장 관리자';
        userRole = 'admin';
      }
      // 2. Check Registered Users (LocalStorage)
      else {
        try {
          const storedUsersJSON = localStorage.getItem('demo_users');
          if (storedUsersJSON) {
            const users = JSON.parse(storedUsersJSON);
            const user = users[trimmedId];

            if (user && user.passwordHash && user.passwordSalt) {
              const isMatch = await verifyPassword(password, user.passwordHash, user.passwordSalt);
              if (isMatch) {
                isValidUser = true;
                userName = user.name;
                userRole = user.role || 'user';
              }
            }
          }
        } catch (err) {
          console.error("Local storage error", err);
        }
      }

      if (!isValidUser) {
        const newAttempts = { ...loginAttempts };
        const currentCount = (newAttempts[trimmedId]?.count || 0) + 1;
        let lockTime: number | null = null;
        let errorMessage = '아이디 또는 비밀번호가 올바르지 않습니다.';

        if (currentCount > 5) {
          lockTime = Date.now() + 30 * 60 * 1000;
          errorMessage = '비밀번호를 5회 이상 틀려 30분간 접속이 제한됩니다.';
        }

        setLoginAttempts({
          ...newAttempts,
          [trimmedId]: { count: currentCount, lockUntil: lockTime }
        });
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      const newAttempts = { ...loginAttempts };
      delete newAttempts[trimmedId];
      setLoginAttempts(newAttempts);

      onLogin({ id: trimmedId, name: userName, role: userRole });
      setIsLoading(false);
    }, 1000);
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
          isLoading={isLoading}
          error={error}
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
