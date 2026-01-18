import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ConstructionContractViewProps {
  project: any;
}

export const ConstructionContractView: React.FC<ConstructionContractViewProps> = ({ project }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
      <div className="text-center py-8">
        <CheckCircle className="mx-auto text-green-500 mb-3" size={48} />
        <h2 className="text-xl font-bold text-slate-800 mb-2">계약이 완료된 프로젝트입니다</h2>
        <p className="text-slate-500 text-sm mb-6">
          계약 일자: {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '-'}
        </p>
        <div className="bg-slate-50 p-4 rounded-lg text-left text-sm space-y-2">
          <div className="flex justified-between">
            <span className="text-slate-500">고객명</span>
            <span className="font-medium ml-auto flex-1 text-right">{project.clientName}</span>
          </div>
          <div className="flex justified-between">
            <span className="text-slate-500">총 공사금액</span>
            <span className="font-bold text-blue-600 ml-auto flex-1 text-right">
              {project.totalAmount ? project.totalAmount.toLocaleString() : '0'} 원
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
