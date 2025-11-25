
import React, { useState } from 'react';
import { Hammer, HardHat, Construction, ArrowLeft } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { User } from '../types';
import { verifyPassword } from '../utils/security';
import { BossSignupForm } from './BossSignupForm';
import { EmployeeSignupForm } from './EmployeeSignupForm';

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
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState<Record<string, LoginAttempt>>({});

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const renderLoginView = () => (
    <form className="space-y-6" onSubmit={handleLoginSubmit}>
      <div className="relative flex justify-center items-center mb-6">
        <span className="text-slate-400 font-medium text-sm bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
          공사_log
        </span>
      </div>
      <div className="space-y-4">
        <Input id="user-id" label="아이디" type="text" placeholder="User ID" value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" required />
        <Input id="password" label="비밀번호" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
      </div>
      {error && <div className="rounded-md bg-red-50 p-3"><div className="text-sm text-red-700">{error}</div></div>}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center">
          <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded" />
          <label htmlFor="remember-me" className="ml-2 block text-slate-900">로그인 유지</label>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => { setId(''); setPassword(''); setError(null); setView('signup-select'); }} className="font-medium text-blue-600 hover:text-blue-500 transition-colors">회원 가입</button>
          <span className="text-slate-300">|</span>
          <a href="#" className="font-medium text-blue-600 hover:text-blue-500">비밀번호 찾기</a>
        </div>
      </div>
      <Button type="submit" fullWidth isLoading={isLoading} className="h-11 text-base shadow-blue-200">로그인</Button>
    </form>
  );

  const renderSignupSelectView = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-6 pt-2">
        <Button fullWidth className="h-14 text-lg font-bold bg-slate-800 hover:bg-slate-900 shadow-lg border-none" onClick={() => setView('signup-boss')}>사장으로 가입</Button>
        <div className="text-center space-y-1 py-2">
          <p className="text-sm font-medium text-slate-500">더 나은 업체 운영,</p>
          <p className="text-sm font-medium text-slate-500">효율적인 업무 분배</p>
        </div>
        <Button fullWidth className="h-14 text-lg font-bold shadow-lg" onClick={() => setView('signup-employee')}>직원으로 가입</Button>
      </div>
      <div className="flex justify-center pt-2">
        <button type="button" onClick={() => setView('login')} className="flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" /> 로그인 화면으로 돌아가기
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 transform -rotate-12"><Hammer size={120} /></div>
        <div className="absolute bottom-10 right-10 transform rotate-12"><Construction size={120} /></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-slate-100">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg mb-4">
              <HardHat className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">공사_log</h2>
            <p className="mt-2 text-sm text-slate-500">
              {view === 'login' && '현장 관리 시스템에 접속하세요'}
              {view === 'signup-select' && '회원가입 유형을 선택하세요'}
              {view === 'signup-boss' && '업체 등록을 시작합니다'}
              {view === 'signup-employee' && '직원 등록을 시작합니다'}
            </p>
          </div>

          {view === 'login' && renderLoginView()}
          {view === 'signup-select' && renderSignupSelectView()}
          {view === 'signup-boss' && <BossSignupForm onCancel={() => setView('signup-select')} onComplete={() => setView('login')} />}
          {view === 'signup-employee' && <EmployeeSignupForm onCancel={() => setView('signup-select')} onComplete={() => setView('login')} />}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">시스템 문의</span></div>
            </div>
            <div className="mt-6 text-center space-y-2">
              <div className="text-xs text-slate-400">&copy; 2024 Gongsa_log System. All rights reserved.</div>
              <button
                onClick={() => {
                  if (window.confirm('모든 회원가입 데이터를 초기화하시겠습니까?')) {
                    localStorage.removeItem('demo_users');
                    window.location.reload();
                  }
                }}
                className="text-xs text-red-400 hover:text-red-600 underline"
              >
                [테스트용] 데이터 초기화
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
