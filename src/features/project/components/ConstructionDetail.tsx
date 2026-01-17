import React, { useState } from 'react';
import { ArrowLeft, FileText, Trash2, Plus } from 'lucide-react';
import { EstimatePreview } from './EstimatePreview';
import apiClient from '@/services/apiClient';
import { useConstructionStages } from '@/features/project/hooks/useConstructionStages';
import { ConstructionStage } from '@/types';

// Sub-components
import { ConstructionModelingView } from './construction/ConstructionModelingView';
import { ConstructionContractView } from './construction/ConstructionContractView';
import { ConstructionOverview } from './construction/ConstructionOverview';

interface ConstructionDetailProps {
  project: any;
  onBack: () => void;
}

const ConstructionDetail: React.FC<ConstructionDetailProps> = ({ project, onBack }) => {
  // React Query Hook
  const { stages, createStage, updateStage, deleteStage } = useConstructionStages(project.id);

  // Local UI State
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'modeling' | 'contract'>('overview');
  const [aiSchedule, setAiSchedule] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAiAnalysis = async () => {
    if (stages.length === 0) {
      alert('분석할 공사 단계가 없습니다. 먼저 단계를 추가해주세요.');
      return;
    }

    setIsGenerating(true);
    setAiSchedule([]);
    try {
      const res = await apiClient.post('/ai/visualize-schedule', { stages });
      if (res.data.success) {
        setAiSchedule(res.data.schedule);
      } else {
        alert('일정 생성에 실패했습니다: ' + res.data.error);
      }
    } catch (error) {
      console.error('AI Schedule Error:', error);
      alert('AI 일정 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveStage = async (data: Partial<ConstructionStage>, id?: string | null) => {
    try {
      if (id) {
        await updateStage({ id, data });
      } else {
        await createStage(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusToggle = async (stage: ConstructionStage) => {
    const nextStatusMap: Record<string, string> = {
      pending: 'in_progress',
      in_progress: 'completed',
      completed: 'pending'
    };
    const currentStatus = stage.status || 'pending';
    const nextStatus = nextStatusMap[currentStatus] as 'pending' | 'in_progress' | 'completed';

    try {
      await updateStage({ id: stage.id, data: { status: nextStatus } });
    } catch (error) {
      console.error(error);
    }
  };


  const handleDelete = async () => {
    if (window.confirm('정말로 이 프로젝트를 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.')) {
      try {
        const res = await apiClient.delete(`/estimates/${project.id}`);
        if (res.data.success) {
          alert('프로젝트가 삭제되었습니다.');
          onBack();
        } else {
          alert('삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('오류가 발생했습니다.');
      }
    }
  };

  if (showPreview) {
    return <EstimatePreview project={project} onBack={() => setShowPreview(false)} />;
  }

  const getProjectTitle = (address: string) => {
    if (!address) return '새 프로젝트';
    const parts = address.split(' ');
    if (parts.length > 3) {
      return parts.slice(0, 3).join(' ') + ' 프로젝트';
    }
    return address + ' 프로젝트';
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-slate-100 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 -ml-1 text-slate-600 active:scale-90 transition-transform">
            <ArrowLeft size={24} />
          </button>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-slate-800">
              {getProjectTitle(project.siteAddress)}
            </span>
            <span className="text-xs text-slate-500">시공 현황</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open(`/report/${project.id}`, '_blank')}
            className="p-2 text-slate-400 hover:text-blue-600 rounded-full transition-colors"
            title="종합 보고서 보기"
          >
            <FileText size={20} />
          </button>
          <button onClick={handleDelete} className="p-2 text-slate-400 hover:text-red-500 rounded-full">
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100 flex">
        {['overview', 'modeling', 'contract'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'
              }`}
          >
            {tab === 'overview' ? '개요' : tab === 'modeling' ? '모델링/도면' : '계약서'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && (
          <ConstructionOverview
            stages={stages}
            aiSchedule={aiSchedule}
            isGenerating={isGenerating}
            onAiAnalysis={handleAiAnalysis}
            onSaveStage={handleSaveStage}
            onStatusToggle={handleStatusToggle}
            onDeleteStage={handleDeleteStage}
          />
        )}

        {activeTab === 'modeling' && (
          <ConstructionModelingView project={project} />
        )}

        {activeTab === 'contract' && (
          <ConstructionContractView project={project} />
        )}
      </div>
    </div>
  );
};

export default ConstructionDetail;
