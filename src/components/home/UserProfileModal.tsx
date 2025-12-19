import React from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { X, LogOut, User, Phone, Building } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore();

  if (!isOpen || !user) return null;

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      logout();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="bg-white w-[320px] rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-white shadow-md mb-3">
            <span className="text-3xl font-bold text-slate-900">{user.name?.[0]}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
          <span className="text-sm text-slate-500 font-medium mt-1">
            {user.role === 'boss' ? '관리자' : '작업자'}
          </span>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <Building size={20} className="text-slate-400" />
            <div className="flex flex-col">
              <span className="text-xs text-slate-400">소속</span>
              <span className="text-sm font-medium text-slate-900">{user.companyName || '소속 없음'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <Phone size={20} className="text-slate-400" />
            <div className="flex flex-col">
              <span className="text-xs text-slate-400">전화번호</span>
              <span className="text-sm font-medium text-slate-900">{user.phone || '번호 없음'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
        >
          <LogOut size={20} />
          로그아웃
        </button>
      </div>
    </div>
  );
};
