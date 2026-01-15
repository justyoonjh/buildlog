import React from 'react';
import { User, Settings, List, Calendar as CalendarIcon } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';

interface HomeHeaderProps {
  onTodayClick: () => void;
  onUserClick: () => void;
  onBusinessInfoClick: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ onTodayClick, onUserClick, onBusinessInfoClick }) => {
  const { user } = useAuthStore();

  return (
    <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-slate-100 sticky top-0 z-10">
      {/* Left: Business Info Button */}
      <button
        onClick={onBusinessInfoClick}
        className="flex flex-col items-start hover:opacity-70 transition-opacity"
      >
        <span className="text-xs text-slate-500 font-medium">업체 정보</span>
        <div className="flex items-center gap-1">
          <h1 className="text-lg font-bold text-slate-900 leading-tight">
            {user?.companyName || user?.businessInfo?.s_nm || '업체 정보'}
          </h1>
          <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-medium">보기</span>
        </div>
      </button>

      {/* Right: User Info & Settings */}
      <div className="flex items-center gap-3">
        <button
          onClick={onTodayClick}
          className="px-3 py-1.5 bg-slate-100 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
        >
          오늘
        </button>

        <div
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onUserClick}
        >
          <div className="flex flex-col items-end mr-1">
            <span className="text-xs font-bold text-slate-900">{user?.name}</span>
            <span className="text-[10px] text-slate-500">내 정보</span>
          </div>
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            <span className="text-xs font-bold text-slate-900">{user?.name?.[0]}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
