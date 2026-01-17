import React from 'react';
import { Shield } from 'lucide-react';
import { User } from '@/types';

interface PendingMemberListProps {
  members: User[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const PendingMemberList: React.FC<PendingMemberListProps> = ({ members, onApprove, onReject }) => {
  if (members.length === 0) return null;

  return (
    <div className="px-6 py-5 border-b border-slate-100 bg-yellow-50/50">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-yellow-600" />
        <h3 className="font-bold text-slate-800">가입 승인 대기 <span className="text-red-500 ml-1">{members.length}</span></h3>
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-3 p-3 bg-white border border-yellow-200 rounded-xl shadow-sm">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500">
              {member.name.substring(0, 1)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">{member.name}</span>
                <span className="text-xs text-slate-500">{member.department || '부서미정'} {member.position || ''}</span>
              </div>
              <div className="text-xs text-slate-400">{member.phone}</div>
            </div>
            <button
              onClick={() => onApprove(member.id)}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition"
            >
              승인
            </button>
            <button
              onClick={() => onReject(member.id)}
              className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-bold rounded-lg hover:bg-red-200 transition"
            >
              거절
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
