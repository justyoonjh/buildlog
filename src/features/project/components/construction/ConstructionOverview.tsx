import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { ConstructionStage } from '@/types';
import { ConstructionStageList } from './ConstructionStageList';
import { ConstructionStageChart } from './ConstructionStageChart';
import { StageFormModal } from './StageFormModal';

interface ConstructionOverviewProps {
  stages: ConstructionStage[];
  aiSchedule: any[];
  isGenerating: boolean;
  onAiAnalysis: () => void;
  onSaveStage: (data: Partial<ConstructionStage>) => Promise<void>;
  onStatusToggle: (stage: ConstructionStage) => Promise<void>;
  onDeleteStage: (id: string) => Promise<void>;
}

export const ConstructionOverview: React.FC<ConstructionOverviewProps> = ({
  stages,
  aiSchedule,
  isGenerating,
  onAiAnalysis,
  onSaveStage,
  onStatusToggle,
  onDeleteStage
}) => {
  const [overviewTab, setOverviewTab] = useState<'list' | 'chart'>('list');
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ConstructionStage>>({
    name: '',
    manager: '',
    duration: '',
    description: ''
  });

  const handleEditClick = (stage: ConstructionStage) => {
    setEditingId(stage.id);
    setFormData({
      name: stage.name,
      manager: stage.manager,
      duration: stage.duration,
      description: stage.description
    });
    setIsAddingStage(true);
  };

  const handleCancel = () => {
    setIsAddingStage(false);
    setEditingId(null);
    setFormData({ name: '', manager: '', duration: '', description: '' });
  };

  const handleSaveWrapper = async (data: Partial<ConstructionStage>) => {
    // Inject editingId if needed, but parent handles create/update based on logic or we pass it?
    // Actually parent `handleSaveStage` uses `editingId` state from parent.
    // Wait, if I move state here, parent doesn't know about editingId.
    // So I should pass `editingId` to parent or handle logic here?
    // Let's handle logic here if possible, BUT the `updateStage` mutation is from parent hook.
    // Better: Allow parent to handle the actual API call, but we manage the form state here.
    // We need to pass `editingId` to `onSaveStage` or have `onSaveStage` accept (id, data).
    // Let's update the interface to simplify.
    // Actually, let's keep it simple: Pass `editingId` to parent? No, `onSaveStage` in parent used parent state.
    // I will refactor `onSaveStage` to accept `id` (optional) and `data`.
    await onSaveStage(data, editingId);
    handleCancel();
  };

  return (
    <div className="space-y-4">
      {/* Overview Sub-tabs */}
      <div className="flex p-1 bg-slate-100 rounded-lg mb-4">
        <button
          onClick={() => setOverviewTab('list')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${overviewTab === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
        >
          단계 목록
        </button>
        <button
          onClick={() => setOverviewTab('chart')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${overviewTab === 'chart' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
        >
          진행 시각화
        </button>
      </div>

      {/* Header / Add Button (Only show in list mode) */}
      {overviewTab === 'list' && (
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-slate-800">공사 단계 현황</h3>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ name: '', manager: '', duration: '', description: '' });
              setIsAddingStage(true);
            }}
            className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 transition-colors"
          >
            <Plus size={16} />
            단계 추가
          </button>
        </div>
      )}

      {/* Stages List or Chart */}
      {overviewTab === 'list' ? (
        <ConstructionStageList
          stages={stages}
          onEdit={handleEditClick}
          onDelete={onDeleteStage}
          onStatusToggle={onStatusToggle}
        />
      ) : (
        <ConstructionStageChart
          stages={stages}
          aiSchedule={aiSchedule}
          onGenerateAiSchedule={onAiAnalysis}
          isGenerating={isGenerating}
        />
      )}

      {/* Form Modal */}
      <StageFormModal
        isOpen={isAddingStage}
        onClose={handleCancel}
        initialData={formData}
        onSave={handleSaveWrapper}
        title={editingId ? '단계 수정' : '새 단계 추가'}
      />
    </div>
  );
};
