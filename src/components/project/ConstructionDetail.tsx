import React, { useState } from 'react';
import { ArrowLeft, Hammer, FileText, ChevronRight, Trash2, CheckCircle } from 'lucide-react';
import { EstimatePreview } from './EstimatePreview';
import apiClient from '../../services/apiClient';

interface ConstructionDetailProps {
  project: any;
  onBack: () => void;
}

const ConstructionDetail: React.FC<ConstructionDetailProps> = ({ project, onBack }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'modeling' | 'contract'>('overview');

  const handleDelete = async () => {
    if (window.confirm('정말로 이 프로젝트를 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.')) {
      try {
        const res = await apiClient.delete(`/estimates/${project.id}`);
        if (res.data.success) {
          alert('프로젝트가 삭제되었습니다.');
          onBack(); // Go back and refresh list
        } else {
          alert('삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('오류가 발생했습니다.');
      }
    }
  };

  if (showPreview) {
    return <EstimatePreview project={project} onBack={() => setShowPreview(false)} />;
  }

  const getProjectTitle = (address: string) => {
    if (!address) return '새 프로젝트';
    const parts = address.split(' ');
    if (parts.length > 3) {
      return parts.slice(0, 3).join(' ') + ' 프로젝트';
    }
    return address + ' 프로젝트';
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-slate-100 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 -ml-1 text-slate-600 active:scale-90 transition-transform">
            <ArrowLeft size={24} />
          </button>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-slate-800">
              {getProjectTitle(project.siteAddress)}
            </span>
            <span className="text-xs text-slate-500">시공 현황</span>
          </div>
        </div>
        <button onClick={handleDelete} className="p-2 text-slate-400 hover:text-red-500 rounded-full">
          <Trash2 size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100 flex">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
        >
          개요
        </button>
        <button
          onClick={() => setActiveTab('modeling')}
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'modeling' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
        >
          모델링/도면
        </button>
        <button
          onClick={() => setActiveTab('contract')}
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'contract' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
        >
          계약서
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Hammer size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">시공 준비 중</h3>
            <p className="text-slate-400 text-sm mt-1">곧 현장 관리 기능이 업데이트됩니다.</p>

            <button
              onClick={() => setShowPreview(true)}
              className="mt-6 w-full max-w-xs bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <FileText className="text-blue-500" size={20} />
                <div className="text-left">
                  <div className="text-xs text-slate-500">견적서 확인</div>
                  <div className="font-bold text-slate-800">상세 견적 보기</div>
                </div>
              </div>
              <ChevronRight className="text-slate-300" size={20} />
            </button>
          </div>
        )}

        {activeTab === 'modeling' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-500 rounded-full" />
                생성된 AI 모델링
              </h3>
              {project.generatedImage || project.modelImage ? (
                <div className="rounded-lg overflow-hidden border border-slate-200">
                  <img
                    src={project.generatedImage || project.modelImage}
                    alt="모델링 이미지"
                    className="w-full h-auto object-cover"
                  />
                </div>
              ) : (
                <div className="h-40 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 text-sm border border-dashed border-slate-200">
                  등록된 모델링 이미지가 없습니다.
                </div>
              )}
              {project.styleDescription && (
                <div className="mt-4 bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
                  <p className="text-xs text-slate-400 mb-1">요청 스타일</p>
                  {project.styleDescription}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'contract' && (
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <div className="text-center py-8">
              <CheckCircle className="mx-auto text-green-500 mb-3" size={48} />
              <h2 className="text-xl font-bold text-slate-800 mb-2">계약이 완료된 프로젝트입니다</h2>
              <p className="text-slate-500 text-sm mb-6">
                계약 일자: {new Date(project.createdAt).toLocaleDateString()}
              </p>
              <div className="bg-slate-50 p-4 rounded-lg text-left text-sm space-y-2">
                <div className="flex justified-between">
                  <span className="text-slate-500">고객명</span>
                  <span className="font-medium ml-auto">{project.clientName}</span>
                </div>
                <div className="flex justified-between">
                  <span className="text-slate-500">총 공사금액</span>
                  <span className="font-bold text-blue-600 ml-auto">
                    {project.totalAmount?.toLocaleString()} 원
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConstructionDetail;
