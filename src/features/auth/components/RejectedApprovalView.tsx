import React from 'react';
import { LogOut, XCircle, Trash2 } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const RejectedApprovalView: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (!confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

    try {
      await authService.deleteAccount();
      toast.success('계정이 삭제되었습니다.');
      // Auto logout handled by backend destroying session usually, but frontend needs to clear state
      await logout();
      navigate('/signup');
    } catch (error) {
      console.error(error);
      toast.error('계정 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">가입 승인 거절됨</h1>
        <p className="text-slate-600 mb-6 word-keep">
          <span className="font-bold text-slate-800">{user?.companyName}</span>의 관리자가<br />
          회원님의 가입 요청을 거절했습니다.
        </p>

        <div className="bg-red-50 rounded-xl p-4 mb-8 text-sm text-red-600 text-left">
          거절 사유에 대해서는 해당 업체 관리자에게 문의해주세요. 다른 업체에 가입하시려면 계정을 삭제 후 다시 가입해주세요.
        </div>

        <div className="space-y-3">
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            로그아웃
          </button>

          <button
            onClick={handleDeleteAccount}
            className="w-full py-3 bg-red-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 hover:bg-red-700"
          >
            <Trash2 className="w-5 h-5" />
            계정 삭제하고 다시 가입하기
          </button>
        </div>
      </div>
    </div>
  );
};
