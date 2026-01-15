import React from 'react';
import { ProjectCard } from './ProjectCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Estimate } from '@/types';

interface ConstructionListProps {
  projects: Estimate[];
  isLoading: boolean;
  onSelect: (id: string) => void;
}

export const ConstructionList: React.FC<ConstructionListProps> = ({ projects, isLoading, onSelect }) => {
  return (
    <div className="space-y-4 pb-20">
      {isLoading ? (
        <div className="text-center py-10 text-slate-400 text-sm">로딩 중...</div>
      ) : projects.length === 0 ? (
        <EmptyState message="진행 중인 시공 목록이 없습니다." />
      ) : (
        projects.map(est => (
          <ProjectCard
            key={est.id}
            id={est.id}
            clientName={est.clientName}
            clientPhone={est.clientPhone}
            siteAddress={est.siteAddress}
            startDate={est.startDate}
            endDate={est.endDate}
            status={est.status}
            type="construction"
            onClick={() => onSelect(est.id)}
          />
        ))
      )}
    </div>
  );
};
