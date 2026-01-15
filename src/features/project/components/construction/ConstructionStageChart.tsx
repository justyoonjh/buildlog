import React from 'react';
import { User, Clock } from 'lucide-react';
import { ConstructionStage } from '@/types';

interface ConstructionStageChartProps {
  stages: ConstructionStage[];
  aiSchedule: any[];
  onGenerateAiSchedule: () => void;
  isGenerating: boolean;
}

export const ConstructionStageChart: React.FC<ConstructionStageChartProps> = ({
  stages,
  aiSchedule,
  onGenerateAiSchedule,
  isGenerating
}) => {
  const displayStages = aiSchedule.length > 0 ? aiSchedule : stages;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[300px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-800">전체 공정 시각화</h3>
        <button
          onClick={onGenerateAiSchedule}
          disabled={isGenerating || stages.length === 0}
          className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 transition-colors disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <span className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              분석 중...
            </>
          ) : (
            <>
              <span className="text-lg">✨</span>
              AI 일정 분석
            </>
          )}
        </button>
      </div>

      {stages.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-sm">
          시각화할 데이터가 없습니다. 단계를 먼저 추가해주세요.
        </div>
      ) : (
        <div className="relative pl-4 border-l-2 border-slate-200 space-y-8 my-4">
          {displayStages.map((stage, index) => (
            <div key={index} className="relative animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${index * 50}ms` }}>
              {/* Timeline Dot */}
              <div className={`absolute -left-[21px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${stage.status === 'completed' ? 'bg-green-500' :
                stage.status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-300'
                }`} />

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">STEP {index + 1}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${stage.status === 'completed' ? 'bg-green-100 text-green-700' :
                    stage.status === 'in_progress' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                    {stage.status === 'pending' ? '대기' : stage.status === 'in_progress' ? '진행' : '완료'}
                  </span>
                </div>

                <h4 className="font-bold text-slate-800">{stage.name}</h4>

                {/* Display Date Range if AI generated */}
                {stage.startDate && stage.endDate && (
                  <div className="flex items-center gap-2 mt-1 mb-1">
                    <div className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      {stage.startDate} ~ {stage.endDate}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                  <div className="flex items-center gap-1">
                    <User size={12} />
                    {stage.manager}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    {stage.duration}
                  </div>
                </div>

                {stage.description && (
                  <p className="text-xs text-slate-400 mt-1 bg-slate-50 p-2 rounded">
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
