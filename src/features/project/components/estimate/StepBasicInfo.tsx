import React, { useState } from 'react';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { Calendar as CalendarIcon, MapPin, Phone, User, Search } from 'lucide-react';
import { useDaumPostcodePopup } from 'react-daum-postcode';

interface StepBasicInfoProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

export const StepBasicInfo: React.FC<StepBasicInfoProps> = ({ data, onChange }) => {
  const { user } = useAuthStore();
  const open = useDaumPostcodePopup();

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

    onChange('siteAddress', fullAddress);
  };

  const handleAddressClick = () => {
    open({ onComplete: handleAddressComplete });
  };

  return (
    <div className="space-y-6">
      {/* 0. Provider Info (Read-only Card) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">공급자 (나)</h3>
        <div className="flex flex-col gap-1">
          <span className="font-bold text-slate-800 text-lg">{user?.companyName || '상호명 미입력'}</span>
          <span className="text-sm text-slate-600">{user?.name} 대표</span>
          <span className="text-xs text-slate-400 mt-1">{user?.businessNumber || '사업자 번호 없음'}</span>
        </div>
      </div>

      {/* 1. Date & Period */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">언제 공사하시나요?</label>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">시작일</label>
            <div className="relative">
              <input
                type="date"
                value={data.startDate || ''}
                onChange={(e) => onChange('startDate', e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all"
              />
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">종료일</label>
            <div className="relative">
              <input
                type="date"
                value={data.endDate || ''}
                onChange={(e) => onChange('endDate', e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all"
              />
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Client Info */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-4">누구에게 견적을 보내시나요?</label>

        <div className="space-y-4">
          {/* Client Name */}
          <div className="relative">
            <input
              type="text"
              placeholder="고객명 또는 상호명"
              value={data.clientName || ''}
              onChange={(e) => onChange('clientName', e.target.value)}
              className="w-full pl-10 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg font-medium transition-all placeholder:text-slate-300"
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          </div>

          {/* Client Phone */}
          <div className="relative">
            <input
              type="tel"
              placeholder="연락처 (010-0000-0000)"
              value={data.clientPhone || ''}
              onChange={(e) => {
                // Auto formatting 010-xxxx-xxxx
                let val = e.target.value.replace(/[^0-9]/g, '');
                if (val.length > 3 && val.length <= 7) {
                  val = val.slice(0, 3) + '-' + val.slice(3);
                } else if (val.length > 7) {
                  val = val.slice(0, 3) + '-' + val.slice(3, 7) + '-' + val.slice(7, 11);
                }
                onChange('clientPhone', val);
              }}
              maxLength={13}
              className="w-full pl-10 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg font-medium transition-all placeholder:text-slate-300"
            />
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          </div>

          {/* Site Address (with Daum Postcode) */}
          <div className="relative cursor-pointer" onClick={handleAddressClick}>
            <input
              type="text"
              placeholder="클릭하여 현장 주소 검색"
              value={data.siteAddress || ''}
              readOnly
              className="w-full pl-10 pr-10 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base transition-all placeholder:text-slate-300 cursor-pointer text-ellipsis overflow-hidden whitespace-nowrap"
            />
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};
