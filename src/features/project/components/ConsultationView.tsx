import React, { useState } from 'react';
import { Plus, Check, Clock } from 'lucide-react';
import { ConsultationModal } from '@/features/home/components/ConsultationModal';
import apiClient from '@/services/apiClient';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';

interface ConsultationViewProps {
  projects: any[];
  onSelectProject?: (id: string) => void;
}

import { useNavigate } from 'react-router-dom';

export const ConsultationView: React.FC<ConsultationViewProps> = ({ projects, onSelectProject }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle Proceed (Status -> negotiating)
  const handleProceed = async (id: string) => {
    if (!window.confirm('이 상담을 식제로 진행하시겠습니까?\n진행 시 견적 탭으로 이동합니다.')) return;
    try {
      const res = await apiClient.put(`/estimates/${id}`, { status: 'negotiating' });
      if (res.data.success) {
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.estimates.all });
        // Navigate to Estimate Tab with initial data
        const projectToProceed = projects.find(p => p.id === id);
        navigate('/?tab=project&project_tab=estimate', {
          state: {
            consultationData: projectToProceed
          }
        });
      }
    } catch (error) {
      console.error('Failed to proceed consultation:', error);
      alert('진행 처리에 실패했습니다.');
    }
  };

  // Handle Drop (Delete)
  const handleDrop = async (id: string) => {
    if (!window.confirm('이 상담을 미진행(삭제) 처리하시겠습니까?')) return;
    try {
      const res = await apiClient.delete(`/estimates/${id}`);
      if (res.data.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.estimates.all });
      }
    } catch (error) {
      console.error('Failed to drop consultation:', error);
      alert('삭제 처리에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-sm font-semibold text-slate-500">상담 목록</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded"
        >
          <Plus size={14} />
          새 상담
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white m-1">
          <p className="mb-2">진행 중인 상담이 없습니다.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold"
          >
            상담 일정 등록하기
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-slate-900 text-lg">{item.clientName}</div>
                  <div className="text-xs text-slate-500">{item.siteAddress || '주소 미정'}</div>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                  <Clock size={12} />
                  <span>{item.startDate || '일정 미정'}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-50">
                <button
                  onClick={() => handleDrop(item.id)}
                  className="flex-1 bg-slate-100 text-slate-500 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
                >
                  미진행
                </button>
                <button
                  onClick={() => handleProceed(item.id)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                >
                  <Check size={16} />
                  진행
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
