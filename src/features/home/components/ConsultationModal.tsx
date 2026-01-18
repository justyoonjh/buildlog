import React, { useState } from 'react';
import { X, Calendar, User, Phone, MapPin } from 'lucide-react';
import apiClient from '@/services/apiClient';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

import DaumPostcode from 'react-daum-postcode';

export const ConsultationModal: React.FC<ConsultationModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    siteAddress: '',
    detailAddress: '',
    consultationDate: '',
    memo: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAddressSearchOpen, setIsAddressSearchOpen] = useState(false);

  if (!isOpen) return null;

  const handleAddressComplete = (data: any) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
      }
      fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
    }

    setFormData(prev => ({ ...prev, siteAddress: fullAddress }));
    setIsAddressSearchOpen(false);
  };

  const handleSubmit = async () => {
    if (!formData.clientName || !formData.siteAddress) {
      alert('고객명과 현장 주소를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const fullSiteAddress = formData.detailAddress
        ? `${formData.siteAddress} ${formData.detailAddress}`
        : formData.siteAddress;

      // Create new project with status 'consultation'
      const payload = {
        ...formData,
        siteAddress: fullSiteAddress,
        status: 'consultation',
        startDate: formData.consultationDate,
        totalAmount: 0
      };

      const res = await apiClient.post('/estimates', payload);
      if (res.data.success) {
        alert('상담 일정이 등록되었습니다.');
        onClose();
        // Trigger refresh
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.estimates.all });
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
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 relative">
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
            <div
              className="flex items-center bg-slate-50 rounded-lg px-3 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => setIsAddressSearchOpen(true)}
            >
              <MapPin size={18} className="text-slate-400 mr-2" />
              <input
                type="text"
                value={formData.siteAddress}
                readOnly
                className="bg-transparent w-full text-sm outline-none cursor-pointer"
                placeholder="주소 검색 (클릭)"
              />
            </div>

            {formData.siteAddress && (
              <div className="flex items-center bg-slate-50 rounded-lg px-3 py-3 animate-in fade-in slide-in-from-top-1 duration-200">
                <input
                  type="text"
                  value={formData.detailAddress}
                  onChange={e => setFormData(prev => ({ ...prev, detailAddress: e.target.value }))}
                  className="bg-transparent w-full text-sm outline-none"
                  placeholder="상세 주소 입력 (동, 호수 등)"
                />
              </div>
            )}
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

        {/* Address Search Overlay */}
        {isAddressSearchOpen && (
          <div className="absolute inset-0 z-50 bg-white flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold">주소 검색</h3>
              <button
                type="button"
                onClick={() => setIsAddressSearchOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1">
              <DaumPostcode
                onComplete={handleAddressComplete}
                autoClose={false}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
