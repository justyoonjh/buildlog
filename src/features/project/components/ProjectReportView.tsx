import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, MapPin, CheckCircle, Clock, AlertCircle, Printer, FileText, DollarSign } from 'lucide-react';
import apiClient from '@/services/apiClient';
import { ConstructionStage } from '@/types';

interface ProjectReportViewProps {
  projectId: string;
}

export const ProjectReportView: React.FC<ProjectReportViewProps> = ({ projectId }) => {
  const navigate = useNavigate();
  const [project, setProject] = useState<any | null>(null);
  const [stages, setStages] = useState<ConstructionStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch Project (Estimate)
        const projectRes = await apiClient.get(`/estimates/${projectId}`);
        if (!projectRes.data.success) throw new Error('프로젝트 정보를 찾을 수 없습니다.');
        setProject(projectRes.data.estimate);

        // Fetch Stages
        const stagesRes = await apiClient.get(`/stages/${projectId}`);
        if (stagesRes.data.success) {
          setStages(stagesRes.data.stages);
        }
      } catch (err: any) {
        console.error('Failed to fetch report data:', err);
        setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const handleBack = () => {
    // Go back to main app (remove query params)
    navigate('/');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 text-sm">보고서 생성 중...</span>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <p className="text-red-500 mb-2 font-bold">오류 발생</p>
          <p className="text-slate-600 mb-4">{error || '정보를 찾을 수 없습니다.'}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  // Statistics
  const totalStages = stages.length;
  const completedStages = stages.filter(s => s.status === 'completed').length;
  const progress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 print:bg-white print:pb-0">
      {/* Header (No Print) */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 shadow-sm z-50 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-bold text-sm">돌아가기</span>
          </button>
          <h1 className="text-lg font-bold text-slate-800">종합 공사 보고서</h1>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors font-medium text-sm"
          >
            <Printer size={18} />
            인쇄/PDF 저장
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto mt-20 px-4 space-y-6 print:mt-0 print:px-0">

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

        {/* Detailed Stages List */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 print:shadow-none print:border print:border-slate-300">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
            <CheckCircle size={18} /> 상세 공정 내역
          </h3>

          {stages.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              등록된 공사 단계가 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {stages.map((stage, idx) => (
                <div key={stage.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 print:bg-white print:border print:border-slate-100">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${stage.status === 'completed' ? 'bg-green-500' :
                    stage.status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-300'
                    }`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-800 text-sm">
                        <span className="text-slate-400 mr-2 text-xs">STEP {idx + 1}</span>
                        {stage.name}
                      </h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${stage.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' :
                        stage.status === 'in_progress' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                        {stage.status === 'pending' ? '대기' : stage.status === 'in_progress' ? '진행' : '완료'}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-slate-500 mb-1">
                      <span>담당: {stage.manager}</span>
                      <span>기간: {stage.duration}</span>
                    </div>
                    {stage.description && (
                      <p className="text-xs text-slate-600 mt-1 pl-2 border-l-2 border-slate-200">
                        {stage.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Estimate Items Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 print:shadow-none print:border print:border-slate-300 print:break-inside-avoid">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
            <FileText size={18} /> 주요 견적 품목
          </h3>
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-3 py-2 rounded-l-lg">품목명</th>
                <th className="px-3 py-2">규격</th>
                <th className="px-3 py-2 text-right">수량</th>
                <th className="px-3 py-2 text-right rounded-r-lg">금액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {project.items && project.items.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="px-3 py-2 font-medium text-slate-800">{item.name}</td>
                  <td className="px-3 py-2 text-slate-500">{item.spec}</td>
                  <td className="px-3 py-2 text-right text-slate-600">{item.quantity} {item.unit}</td>
                  <td className="px-3 py-2 text-right font-medium text-slate-800">{item.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-slate-200">
              <tr>
                <td colSpan={3} className="px-3 py-4 text-right font-bold text-slate-800">합계</td>
                <td className="px-3 py-4 text-right font-bold text-blue-600 text-lg">
                  {project.totalAmount?.toLocaleString()} 원
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
