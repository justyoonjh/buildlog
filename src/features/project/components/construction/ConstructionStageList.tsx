import React from 'react';
import { Briefcase, User, Clock, Pencil, Trash2 } from 'lucide-react';
import { ConstructionStage } from '@/types';

interface ConstructionStageListProps {
  stages: ConstructionStage[];
  onEdit: (stage: ConstructionStage) => void;
  onDelete: (id: string) => void;
  onStatusToggle: (stage: ConstructionStage) => void;
}

export const ConstructionStageList: React.FC<ConstructionStageListProps> = ({
  stages,
  onEdit,
  onDelete,
  onStatusToggle
}) => {
  if (stages.length === 0) {
    return (
      <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <Briefcase className="mx-auto text-slate-300 mb-2" size={32} />
        <p className="text-slate-500 text-sm">등록된 공사 단계가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {stages.map((stage, index) => (
        <div key={stage.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                {index + 1}
              </span>
              <h4 className="font-bold text-slate-800">{stage.name}</h4>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusToggle(stage);
                }}
                className={`text-xs px-2 py-1 rounded-full transition-colors hover:opacity-80 ${stage.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}
              >
                {stage.status === 'pending' ? '대기중' : stage.status === 'in_progress' ? '진행중' : '완료'}
              </button>

              <div className="flex items-center gap-1 ml-1">
                <button
                  onClick={() => onEdit(stage)}
                  className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => onDelete(stage.id)}
                  className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 mb-3">
            <div className="flex items-center gap-1.5">
              <User size={14} className="text-slate-400" />
              <span>{stage.manager}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-slate-400" />
              <span>{stage.duration}</span>
            </div>
          </div>
          {stage.description && (
            <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg">
              {stage.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
