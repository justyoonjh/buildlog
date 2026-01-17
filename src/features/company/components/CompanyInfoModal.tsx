import React from 'react';
import { User, MapPin } from 'lucide-react';
import { ROLES } from '@/shared/constants/auth';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useCompanyMembers } from '@/features/company/hooks/useCompanyMembers';
import { CompanyHeader } from './company-info-modal/CompanyHeader';
import { PendingMemberList } from './company-info-modal/PendingMemberList';
import { ApprovedMemberList } from './company-info-modal/ApprovedMemberList';

interface CompanyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompanyInfoModal: React.FC<CompanyInfoModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();

  // Use custom hook
  const {
    boss,
    approvedMembers,
    pendingMembers,
    approveUser,
    rejectUser,
    isLoading
  } = useCompanyMembers();

  // Conditionally fetch or mount only when open? 
  // The hook already fetches, so just return null if closed
  if (!isOpen) return null;

  const bossName = boss?.businessInfo?.p_nm || boss?.name || '-';
  const address = boss?.address ? `${boss.address.address} ${boss.address.detailAddress || ''}` : (boss?.businessInfo?.address || '-');
  const isBoss = user?.role === ROLES.BOSS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-xl animate-in zoom-in-95 duration-200 flex flex-col">

        <CompanyHeader
          boss={boss}
          currentUser={user}
          onClose={onClose}
        />

        {/* Scrollable Content */}
        <div className="overflow-y-auto custom-scrollbar flex-1">

          {/* Company Details (Common) */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex flex-col gap-2">
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span className="text-xs text-slate-500 block">대표자</span>
                <span className="text-sm font-medium text-slate-700">{bossName}</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span className="text-xs text-slate-500 block">주소</span>
                <span className="text-sm font-medium text-slate-700">{address}</span>
              </div>
            </div>
          </div>

          {/* Pending Approvals (Boss Only) */}
          {isBoss && (
            <PendingMemberList
              members={pendingMembers}
              onApprove={approveUser}
              onReject={rejectUser}
            />
          )}

          {/* Members List */}
          <ApprovedMemberList
            members={approvedMembers}
            boss={boss}
            currentUser={user}
            loading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
