import React from 'react';
import { MapPin, Calendar } from 'lucide-react';

export interface ProjectCardProps {
  id: string;
  clientName: string;
  clientPhone: string;
  siteAddress: string;
  startDate?: string;
  endDate?: string;
  status: string;
  onClick: () => void;
  type?: 'estimate' | 'construction' | 'completed';
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  clientName, clientPhone, siteAddress, startDate, endDate, onClick, type = 'estimate'
}) => {

  const getProjectTitle = (address: string) => {
    if (!address) return '새 프로젝트';
    const parts = address.split(' ');
    if (parts.length > 3) {
      return parts.slice(0, 3).join(' ') + ' 프로젝트';
    }
    return address + ' 프로젝트';
  };

  const isConstruction = type === 'construction';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative active:scale-[0.99] transition-transform cursor-pointer hover:border-blue-300"
    >
      {/* Badge */}
      {!isConstruction ? (
        <div className="absolute top-4 right-4 bg-purple-50 text-purple-600 text-[10px] font-bold px-2 py-1 rounded-full border border-purple-100 flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
          견적 중
        </div>
      ) : (
        <div className="absolute top-4 right-4 bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-full border border-blue-100 flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
          시공 중
        </div>
      )}

      {/* Project Name */}
      <h3 className="text-lg font-bold text-slate-900 mb-1 pr-20 truncate">
        {getProjectTitle(siteAddress)}
      </h3>

      {/* Address */}
      <div className="flex items-center text-slate-500 text-sm mb-3">
        <MapPin size={14} className="mr-1" />
        <span className="truncate">{siteAddress || '주소 미입력'}</span>
      </div>

      <div className="border-t border-slate-100 my-3" />

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-y-2 text-xs">
        <div className="flex flex-col">
          <span className="text-slate-400 mb-0.5">공사 기간</span>
          <div className="flex items-center text-slate-700 font-medium">
            <Calendar size={12} className="mr-1 text-slate-400" />
            {startDate && endDate ? `${startDate} ~ ${endDate}` : '미정'}
          </div>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-slate-400 mb-0.5">고객 정보</span>
          <span className="text-slate-700 font-medium">
            {clientName} ({clientPhone})
          </span>
        </div>
      </div>
    </div>
  );
};
