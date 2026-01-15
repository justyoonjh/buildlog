import { useState } from 'react';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { authService } from '@/features/auth/services/authService';

interface LoginAttempt {
  count: number;
  lockUntil: number | null;
}

export const useLogin = () => {
  const { login, isLoading: storeLoading, error: storeError, clearError } = useAuthStore();
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
      return false;
    }

    setIsSubmitting(true);

    try {
      const result = await authService.login(trimmedId, password);
      if (result) {
        login(result);
        const newAttempts = { ...loginAttempts };
        delete newAttempts[trimmedId];
        setLoginAttempts(newAttempts);
        return true;
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
        return false;
      }
    } catch (err) {
      setLocalError('로그인 중 오류가 발생했습니다.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleLoginSubmit,
    isLoading: storeLoading || isSubmitting,
    error: localError || storeError
  };
};
