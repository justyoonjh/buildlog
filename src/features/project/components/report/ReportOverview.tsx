import React from 'react';
import { User, DollarSign, Clock } from 'lucide-react';
import { ConstructionStage } from '@/types';

interface ReportOverviewProps {
  project: any;
  stages: ConstructionStage[];
  progress: number;
}

export const ReportOverview: React.FC<ReportOverviewProps> = ({ project, stages, progress }) => {
  const totalStages = stages.length;

  return (
    <>
      {/* Title Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 print:shadow-none print:border-none">
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded mb-2">
              PROJECT REPORT
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">{project.siteAddress} 프로젝트</h2>
            <p className="text-slate-500 text-sm">작성일: {new Date().toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500 mb-1">총 공사금액</div>
            <div className="text-xl font-bold text-blue-600">{project.totalAmount?.toLocaleString()} 원</div>
          </div>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 print:shadow-none print:border print:border-slate-300">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
            <User size={18} /> 고객 정보
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">고객명</span>
              <span className="font-medium text-slate-900">{project.clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">연락처</span>
              <span className="font-medium text-slate-900">{project.clientPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">현장 주소</span>
              <span className="font-medium text-slate-900 text-right max-w-[60%]">{project.siteAddress}</span>
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 print:shadow-none print:border print:border-slate-300">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
            <DollarSign size={18} /> 대금 지급 조건
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">계약금 (선금)</span>
              <span className="font-medium text-slate-900">
                {project.downPayment ? project.downPayment.toLocaleString() : '0'} 원
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">중도금 (진행)</span>
              <span className="font-medium text-slate-900">
                {project.progressPayment ? project.progressPayment.toLocaleString() : '0'} 원
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-100 pt-2 mt-2">
              <span className="text-slate-500">잔금 (완료)</span>
              <span className="font-bold text-blue-600">
                {project.balancePayment ? project.balancePayment.toLocaleString() : '0'} 원
              </span>
            </div>
          </div>
        </div>

        {/* Construction Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 print:shadow-none print:border print:border-slate-300">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
            <Clock size={18} /> 공사 진행 현황
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">전체 공정률</span>
                <span className="font-bold text-blue-600">{progress}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <div className="flex flex-col items-center">
                <span className="font-bold text-slate-800 text-lg">{stages.filter(s => s.status === 'pending').length}</span>
                <span>대기</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-blue-600 text-lg">{stages.filter(s => s.status === 'in_progress').length}</span>
                <span>진행중</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-green-600 text-lg">{stages.filter(s => s.status === 'completed').length}</span>
                <span>완료</span>
              </div>
              <div className="flex flex-col items-center border-l pl-4">
                <span className="font-bold text-slate-800 text-lg">{totalStages}</span>
                <span>전체 단계</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
