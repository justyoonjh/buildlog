import React from 'react';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { Estimate } from '@/types';

interface CompletedListProps {
  projects: Estimate[];
}

export const CompletedList: React.FC<CompletedListProps> = ({ projects }) => {
  return (
    <div className="space-y-4 pb-20">
      {projects.length === 0 ? (
        <EmptyState message="완료된 프로젝트가 없습니다." />
      ) : (
        projects.map(est => (
          <div key={est.id} className="bg-white p-4 rounded text-slate-500 border border-slate-100">
            <span className="font-bold text-slate-700">{est.siteAddress}</span> (완료)
          </div>
        ))
      )}
    </div>
  );
};
