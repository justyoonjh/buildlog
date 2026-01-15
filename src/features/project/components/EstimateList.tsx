import React from 'react';
import { ProjectCard } from '@/features/project/components/ProjectCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Plus } from 'lucide-react';
import { Estimate } from '@/types';

interface EstimateListProps {
  estimates: Estimate[];
  isLoading: boolean;
  onCreate: () => void;
  onEdit: (id: string) => void;
}

export const EstimateList: React.FC<EstimateListProps> = ({ estimates, isLoading, onCreate, onEdit }) => {
  return (
    <div className="space-y-4 pb-20">
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : estimates.length === 0 ? (
        <EmptyState
          message="진행 중인 견적이 없습니다."
          actionLabel="+ 새 견적서 작성하기"
          onAction={onCreate}
        />
      ) : (
        estimates.map(est => (
          <ProjectCard
            key={est.id}
            id={est.id}
            clientName={est.clientName}
            clientPhone={est.clientPhone}
            siteAddress={est.siteAddress}
            startDate={est.startDate}
            endDate={est.endDate}
            status={est.status}
            type="estimate"
            onClick={() => onEdit(est.id)}
          />
        ))
      )}

      {/* Floating Add Button */}
      {estimates.length > 0 && (
        <div className="fixed bottom-20 right-4 z-20">
          <button
            onClick={onCreate}
            className="w-12 h-12 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>
      )}
    </div>
  );
};
