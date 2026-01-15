import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { ConsultationModal } from '@/features/home/components/ConsultationModal';
import apiClient from '@/services/apiClient';

interface ConsultationViewProps {
  onSelectProject?: (id: string) => void;
}

export const ConsultationView: React.FC<ConsultationViewProps> = ({ onSelectProject }) => {
  // Fetch projects with status 'consultation'
  const [consultations, setConsultations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchConsultations = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get('/estimates');
        if (res.data.success) {
          setConsultations(res.data.estimates.filter((e: any) => e.status === 'consultation'));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConsultations();
  }, []);

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

      {consultations.length === 0 ? (
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
          {consultations.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="font-bold text-slate-900">{item.clientName}</div>
              <div className="text-xs text-slate-500">{item.siteAddress || '주소 미정'}</div>
              <div className="text-xs text-slate-400 mt-1">{item.clientPhone}</div>
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
