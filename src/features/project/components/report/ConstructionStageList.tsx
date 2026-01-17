import React from 'react';
import { CheckCircle } from 'lucide-react';
import { ConstructionStage } from '@/types';

interface ConstructionStageListProps {
  stages: ConstructionStage[];
}

export const ConstructionStageList: React.FC<ConstructionStageListProps> = ({ stages }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 print:shadow-none print:border print:border-slate-300">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
        <CheckCircle size={18} /> 상세 공정 내역
      </h3>

      {stages.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-sm">
          등록된 공사 단계가 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {stages.map((stage, idx) => (
            <div key={stage.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 print:bg-white print:border print:border-slate-100">
              <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${stage.status === 'completed' ? 'bg-green-500' :
                stage.status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-300'
                }`} />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-slate-800 text-sm">
                    <span className="text-slate-400 mr-2 text-xs">STEP {idx + 1}</span>
                    {stage.name}
                  </h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${stage.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' :
                    stage.status === 'in_progress' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                    {stage.status === 'pending' ? '대기' : stage.status === 'in_progress' ? '진행' : '완료'}
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-slate-500 mb-1">
                  <span>담당: {stage.manager}</span>
                  <span>기간: {stage.duration}</span>
                </div>
                {stage.description && (
                  <p className="text-xs text-slate-600 mt-1 pl-2 border-l-2 border-slate-200">
                    {stage.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
