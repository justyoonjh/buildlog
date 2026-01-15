import React from 'react';
import { MessageCircle, FileText, FileSignature, Hammer, CheckCircle } from 'lucide-react';
import { Tab } from '@/types';

interface ProjectNavBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const ProjectNavBar: React.FC<ProjectNavBarProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'consultation', label: '상담', icon: <MessageCircle size={16} /> },
    { id: 'estimate', label: '견적', icon: <FileText size={16} /> },
    { id: 'contract', label: '계약', icon: <FileSignature size={16} /> },
    { id: 'construction', label: '시공', icon: <Hammer size={16} /> },
    { id: 'completed', label: '완료', icon: <CheckCircle size={16} /> },
  ];

  return (
    <div className="bg-white border-b border-slate-100 flex overflow-x-auto no-scrollbar sticky top-0 z-10">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex-none px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap
            ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}
          `}
        >
          <div className="flex items-center gap-1.5">
            {tab.icon}
            <span>{tab.label}</span>
          </div>
          {/* Active Indicator */}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
          )}
        </button>
      ))}
    </div>
  );
};
