import React, { useState } from 'react';
import { X, Calendar, User, Phone, MapPin } from 'lucide-react';
import apiClient from '@/services/apiClient';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    siteAddress: '',
    consultationDate: '',
    memo: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.clientName || !formData.siteAddress) {
      alert('고객명과 현장 주소를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // Create new project with status 'consultation'
      // Assuming backend accepts these fields. 
      // If startDate/endDate is required, we might set them to consultationDate or null.
      const payload = {
        ...formData,
        status: 'consultation',
        startDate: formData.consultationDate, // Map to startDate for now or add specific field
        totalAmount: 0
      };

      const res = await apiClient.post('/estimates', payload);
      if (res.data.success) {
        alert('상담 일정이 등록되었습니다.');
        onClose();
        // Trigger refresh? Ideally via context or forcing reload. 
        // Since HomeView fetches estimates on mount or we can add a callback prop if needed.
        // For now, reloading page or relying on user interaction is fallback. 
        // Better: reload or context. Detailed solution requires Context update.
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
      alert('등록에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">새 상담 일정</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">고객명</label>
            <div className="flex items-center bg-slate-50 rounded-lg px-3 py-3">
              <User size={18} className="text-slate-400 mr-2" />
              <input
                type="text"
                value={formData.clientName}
                onChange={e => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                className="bg-transparent w-full text-sm outline-none"
                placeholder="고객 이름"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">연락처</label>
            <div className="flex items-center bg-slate-50 rounded-lg px-3 py-3">
              <Phone size={18} className="text-slate-400 mr-2" />
              <input
                type="tel"
                value={formData.clientPhone}
                onChange={e => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                className="bg-transparent w-full text-sm outline-none"
                placeholder="010-0000-0000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">현장 주소</label>
            <div className="flex items-center bg-slate-50 rounded-lg px-3 py-3">
              <MapPin size={18} className="text-slate-400 mr-2" />
              <input
                type="text"
                value={formData.siteAddress}
                onChange={e => setFormData(prev => ({ ...prev, siteAddress: e.target.value }))}
                className="bg-transparent w-full text-sm outline-none"
                placeholder="서울시 강남구..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">상담 예정일</label>
            <div className="flex items-center bg-slate-50 rounded-lg px-3 py-3">
              <Calendar size={18} className="text-slate-400 mr-2" />
              <input
                type="date"
                value={formData.consultationDate}
                onChange={e => setFormData(prev => ({ ...prev, consultationDate: e.target.value }))}
                className="bg-transparent w-full text-sm outline-none"
              />
            </div>
          </div>

          <button
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors mt-2"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? '저장 중...' : '일정 등록하기'}
          </button>
        </div>
      </div>
    </div>
  );
};
