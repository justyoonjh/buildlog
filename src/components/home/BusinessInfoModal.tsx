import React, { useState } from 'react';
import { X, Building2, User, Calendar, MapPin, Copy, Check } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';

interface BusinessInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BusinessInfoModal: React.FC<BusinessInfoModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !user) return null;

  const businessInfo: any = user.businessInfo || {};

  const handleCopyCode = async () => {
    if (!user.companyCode) return;

    const text = user.companyCode;
    let success = false;

    // Try Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        success = true;
      } catch (err) {
        console.warn('Clipboard API failed, trying fallback:', err);
      }
    }

    // Fallback: textarea + execCommand
    if (!success) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // Ensure textarea is not visible but part of DOM
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);

        textArea.focus();
        textArea.select();

        success = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
    }

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      alert('코드를 복사하지 못했습니다. 직접 선택해서 복사해주세요.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Building2 size={20} className="text-blue-400" />
            업체 정보
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Company Name */}
          <div className="text-center pb-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">{user.companyName || '상호명 없음'}</h2>
            <p className="text-sm text-slate-500 mt-1">
              {user.role === 'boss' ? '관리자 (대표)' : '직원 (팀원)'}
            </p>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <span className="text-xs text-slate-500 block">대표자</span>
                <span className="text-sm font-medium text-slate-900">{businessInfo.c_nm || user.name}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <span className="text-xs text-slate-500 block">사업자등록번호</span>
                <span className="text-sm font-medium text-slate-900">{businessInfo.b_no || '-'}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <span className="text-xs text-slate-500 block">개업일자</span>
                <span className="text-sm font-medium text-slate-900">{businessInfo.start_dt || '-'}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <span className="text-xs text-slate-500 block">사업장 주소</span>
                <span className="text-sm font-medium text-slate-900">{user.address?.address || '-'} {user.address?.detailAddress}</span>
              </div>
            </div>
          </div>

          {/* Company Code (Only for Boss) */}
          {user.role === 'boss' && user.companyCode && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block mb-1">직원 초대용 업체 코드</span>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900 font-mono tracking-wider">
                    {user.companyCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    {copied ? '복사됨' : '복사'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
