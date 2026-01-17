import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

interface LoginViewProps {
  onSubmit: (id: string, password: string) => void;
  onSignupClick: () => void;
  isLoading: boolean;
  error: string | null;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSubmit, onSignupClick, isLoading, error }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(id, password);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="relative flex justify-center items-center mb-6">
        <span className="text-slate-400 font-medium text-sm bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
          공사_log
        </span>
      </div>
      <div className="space-y-4">
        <Input
          id="user-id"
          label="아이디"
          type="text"
          placeholder="User ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          autoComplete="username"
          required
        />
        <Input
          id="password"
          label="비밀번호"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-slate-900">로그인 유지</label>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSignupClick}
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            회원 가입
          </button>
          <span className="text-slate-300">|</span>
          <a href="#" className="font-medium text-blue-600 hover:text-blue-500">비밀번호 찾기</a>
        </div>
      </div>

      <Button
        type="submit"
        fullWidth
        isLoading={isLoading}
        className="h-11 text-base shadow-blue-200"
      >
        로그인
      </Button>

      {/* Dev Only: Data Reset */}
      <div className="pt-4 text-center">
        <button
          type="button"
          onClick={async () => {
            if (confirm('모든 데이터를 초기화하시겠습니까?')) {
              try {
                console.log('Resetting data...');
                // Use standard import if possible, or keep dynamic if circular dep issue
                const { authService } = await import('@/features/auth/services/authService');
                await authService.resetData();
                console.log('Reset command sent.');
              } catch (e) {
                console.error('Reset Error:', e);
                alert('초기화 중 오류 발생: ' + e);
              }
            }
          }}
          className="text-xs text-slate-300 hover:text-red-400 transition-colors"
        >
          [개발용] 데이터 초기화
        </button>
      </div>
    </form>
  );
};
