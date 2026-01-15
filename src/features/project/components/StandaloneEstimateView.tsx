import React, { useEffect, useState } from 'react';
import { EstimatePreview } from './EstimatePreview';
import apiClient from '@/services/apiClient';

interface StandaloneEstimateViewProps {
  projectId: string;
}

export const StandaloneEstimateView: React.FC<StandaloneEstimateViewProps> = ({ projectId }) => {
  const [project, setProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/estimates/${projectId}`);
        if (res.data.success) {
          setProject(res.data.estimate);
        } else {
          setError('프로젝트를 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('Failed to fetch project:', err);
        setError('데이터를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 text-sm">견적서 정보를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <p className="text-red-500 mb-2 font-bold">오류 발생</p>
          <p className="text-slate-600 mb-4">{error || '프로젝트 정보가 없습니다.'}</p>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
          >
            창 닫기
          </button>
        </div>
      </div>
    );
  }

  // Reuse existing EstimatePreview, but override onBack to close window
  return (
    <EstimatePreview
      project={project}
      onBack={() => window.close()}
    />
  );
};
