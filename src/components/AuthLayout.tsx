import React from 'react';
import { Hammer, HardHat, Construction } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title = "공사_log", subtitle }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Icons */}
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
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h2>
            {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
          </div>

          {children}

          {/* Footer Section */}
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
                    import('../services/authService').then(({ authService }) => {
                      authService.resetData();
                    });
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
