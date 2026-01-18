import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ConstructionStage } from '@/types';
import { useCompanyMembers } from '@/features/company/hooks/useCompanyMembers';

interface StageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<ConstructionStage>;
  onSave: (data: Partial<ConstructionStage>) => Promise<void>;
  title: string;
}

export const StageFormModal: React.FC<StageFormModalProps> = ({ isOpen, onClose, initialData, onSave, title }) => {
  const { approvedMembers, boss } = useCompanyMembers();

  // Combine Boss + Approved Employees
  const eligibleManagers = [boss, ...approvedMembers].filter(Boolean);

  const [formData, setFormData] = useState<Partial<ConstructionStage>>({
    name: '',
    manager: '',
    duration: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || { name: '', manager: '', duration: '', description: '' });
    }
  }, [isOpen, initialData]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.manager) {
      alert('단계명과 담당직원은 필수입니다.');
      return;
    }
    await onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white p-4 rounded-xl border-2 border-blue-100 shadow-sm animate-in fade-in slide-in-from-bottom-2 fixed bottom-4 left-4 right-4 z-50 md:relative md:bottom-auto md:left-auto md:right-auto md:z-auto shadow-2xl md:shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-slate-800">{title}</h4>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">단계명 <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            placeholder="예: 철거 공사"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">담당직원 <span className="text-red-500">*</span></label>
            {eligibleManagers.length > 0 ? (
              <select
                value={formData.manager || ''}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="">담당자 선택</option>
                {eligibleManagers.map(member => (
                  <option key={member?.id} value={member?.name}>
                    {member?.name} {member?.position ? `(${member.position})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData.manager || ''}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                placeholder="이름 입력"
              />
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">소요기간</label>
            <input
              type="text"
              value={formData.duration || ''}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              placeholder="예: 3일"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">상세설명</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none h-20"
            placeholder="작업 내용 상세 입력"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors mt-2"
        >
          {title.includes('수정') ? '수정완료' : '추가하기'}
        </button>
      </div>
    </div>
  );
};
