import React from 'react';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { Estimate } from '@/types';

interface CompletedListProps {
  projects: Estimate[];
  onSelect: (id: string) => void;
}

export const CompletedList: React.FC<CompletedListProps> = ({ projects, onSelect }) => {
  return (
    <div className="space-y-4 pb-20">
      {projects.length === 0 ? (
        <EmptyState message="완료된 프로젝트가 없습니다." />
      ) : (
        projects.map(est => (
          <div
            key={est.id}
            onClick={() => onSelect(est.id)}
            className="bg-white p-4 rounded text-slate-500 border border-slate-100 cursor-pointer hover:border-blue-300 hover:text-blue-600 transition-colors"
          >
            <span className="font-bold text-slate-700">{est.siteAddress}</span> (완료)
          </div>
        ))
      )}
    </div>
  );
};
