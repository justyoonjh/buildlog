import React from 'react';
import { LogOut, Clock, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useNavigate } from 'react-router-dom';

export const PendingApprovalView: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">가입 승인 대기 중</h1>
        <p className="text-slate-600 mb-6 word-keep">
          <span className="font-bold text-slate-800">{user?.companyName}</span>의 관리자가<br />
          회원님의 가입 요청을 검토하고 있습니다.
        </p>

        <div className="bg-slate-50 rounded-xl p-4 mb-8 text-left text-sm text-slate-500">
          <p className="mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            가입 승인 후 서비스를 이용하실 수 있습니다.
          </p>
          <p className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            문의사항은 해당 업체 관리자에게 연락해주세요.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          로그아웃
        </button>
      </div>
    </div>
  );
};
