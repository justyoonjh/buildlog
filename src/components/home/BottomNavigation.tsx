import React from 'react';
import { Home, FolderKanban, BarChart3 } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[60px] bg-white border-t border-slate-200 flex items-center justify-around z-30 pb-safe">
      <button
        onClick={() => onTabChange('project')}
        className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'project' ? 'text-slate-900' : 'text-slate-400'}`}
      >
        <FolderKanban size={24} strokeWidth={activeTab === 'project' ? 2.5 : 2} />
        <span className="text-[10px] font-medium mt-1">프로젝트</span>
      </button>

      <button
        onClick={() => onTabChange('home')}
        className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'home' ? 'text-slate-900' : 'text-slate-400'}`}
      >
        <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
        <span className="text-[10px] font-medium mt-1">홈</span>
      </button>

      <button
        onClick={() => onTabChange('analysis')}
        className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'analysis' ? 'text-slate-900' : 'text-slate-400'}`}
      >
        <BarChart3 size={24} strokeWidth={activeTab === 'analysis' ? 2.5 : 2} />
        <span className="text-[10px] font-medium mt-1">분석</span>
      </button>
    </nav>
  );
};
