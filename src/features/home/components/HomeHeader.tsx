import React from 'react';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useUIStore } from '@/shared/stores/useUIStore';

interface HomeHeaderProps {
  onTodayClick?: () => void;
  showTodayButton?: boolean;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ onTodayClick, showTodayButton = true }) => {
  const { user } = useAuthStore();
  const { openProfile, openCompanyInfo } = useUIStore();

  return (
    <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-slate-100 sticky top-0 z-10 w-full">
      {/* Left: Business Info Button */}
      <button
        onClick={openCompanyInfo}
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
        {showTodayButton && onTodayClick && (
          <button
            onClick={onTodayClick}
            className="px-3 py-1.5 bg-slate-100 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            오늘
          </button>
        )}

        <div
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={openProfile}
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
