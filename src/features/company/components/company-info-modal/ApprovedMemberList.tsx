import React from 'react';
import { Users } from 'lucide-react';
import { User } from '@/types';

interface ApprovedMemberListProps {
  members: User[];
  boss: User | null;
  currentUser: User | null;
  loading: boolean;
}

export const ApprovedMemberList: React.FC<ApprovedMemberListProps> = ({ members, boss, currentUser, loading }) => {
  return (
    <div className="px-6 py-5">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-slate-800">구성원 목록 <span className="text-blue-600 ml-1">{members.length + (boss ? 1 : 0)}</span></h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Boss Card */}
          {boss && (
            <div className="flex items-center gap-3 p-3 bg-white border border-yellow-200 rounded-xl">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-yellow-100 text-yellow-700 border-2 border-yellow-200">
                {boss.name.substring(0, 1)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{boss.name}</span>
                  <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded">사장</span>
                  {boss.id === currentUser?.id && (
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-medium rounded">ME</span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{boss.phone}</div>
              </div>
            </div>
          )}

          {/* Approved Members */}
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-blue-100 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-blue-50 text-blue-600 border-2 border-blue-100">
                {member.name.substring(0, 1)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{member.name}</span>
                  {member.id === currentUser?.id && (
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-medium rounded">ME</span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 flex flex-col gap-0.5">
                  <div className="flex gap-1 text-slate-700 font-medium">
                    {member.department && <span>{member.department}</span>}
                    {member.position && <span>{member.position}</span>}
                  </div>
                  <span>{member.phone || '연락처 없음'}</span>
                </div>
              </div>
            </div>
          ))}

          {members.length === 0 && !boss && (
            <div className="text-center py-8 text-slate-400 text-sm">
              등록된 구성원이 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
