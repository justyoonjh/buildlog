import React from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { X, Building2, User, FileText, MapPin, Calendar } from 'lucide-react';

interface BusinessInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BusinessInfoModal: React.FC<BusinessInfoModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();

  if (!isOpen || !user) return null;

  const businessInfo = user.businessInfo || {};
  const addressInfo = user.address || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="bg-white w-[320px] rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <Building2 size={32} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">{user.companyName || '상호명 없음'}</h2>
          <span className="text-sm text-slate-500 font-medium mt-1">사업자 정보</span>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
            <User size={18} className="text-slate-400 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-xs text-slate-400">대표자</span>
              <span className="text-sm font-medium text-slate-900">{businessInfo.c_nm || user.name}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
            <FileText size={18} className="text-slate-400 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-xs text-slate-400">사업자등록번호</span>
              <span className="text-sm font-medium text-slate-900">{businessInfo.b_no || '정보 없음'}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
            <Calendar size={18} className="text-slate-400 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-xs text-slate-400">개업일자</span>
              <span className="text-sm font-medium text-slate-900">{businessInfo.start_dt || '정보 없음'}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
            <MapPin size={18} className="text-slate-400 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-xs text-slate-400">사업장 주소</span>
              <span className="text-sm font-medium text-slate-900">
                {addressInfo.address ? `${addressInfo.address} ${addressInfo.detailAddress || ''}` : '주소 정보 없음'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
