import React from 'react';
import { X, Building2, Shield } from 'lucide-react';
import { User } from '@/types';
import { ROLES } from '@/shared/constants/auth';

interface CompanyHeaderProps {
  boss: User | null;
  currentUser: User | null;
  onClose: () => void;
}

export const CompanyHeader: React.FC<CompanyHeaderProps> = ({ boss, currentUser, onClose }) => {
  const companyName = boss?.companyName || boss?.businessInfo?.s_nm || '업체명 미등록';
  const businessNumber = boss?.businessNumber || boss?.businessInfo?.b_no || '-';
  const isBoss = currentUser?.role === ROLES.BOSS;

  const handleCopyCode = () => {
    const text = currentUser?.companyCode;
    if (!text) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => alert("업체 코드가 복사되었습니다."))
        .catch(() => alert("복사에 실패했습니다."));
    } else {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        alert("업체 코드가 복사되었습니다. (HTTP)");
      } catch (err) {
        alert("이 브라우저에서는 복사를 지원하지 않습니다.");
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="bg-slate-900 px-6 py-5 text-white flex justify-between items-start shrink-0">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold">{companyName}</h2>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-slate-400 text-sm">사업자번호: {businessNumber}</p>
          {isBoss && currentUser?.companyCode && (
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 text-xs text-yellow-500 hover:text-yellow-400 transition-colors bg-white/10 px-2 py-1 rounded w-fit mt-1"
            >
              <Shield className="w-3 h-3" />
              <span>코드: {currentUser.companyCode} (복사)</span>
            </button>
          )}
        </div>
      </div>
      <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
        <X className="w-6 h-6" />
      </button>
    </div>
  );
};
