import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/services/apiClient';
import { ConstructionStage } from '@/types';
import { ReportHeader } from './report/ReportHeader';
import { ReportOverview } from './report/ReportOverview';
import { ConstructionStageList } from './report/ConstructionStageList';
import { EstimateItemTable } from './report/EstimateItemTable';
import { ReportContractSection } from './report/ReportContractSection';

interface ProjectReportViewProps {
  projectId: string;
}

import { authService } from '@/features/auth/services/authService';

export const ProjectReportView: React.FC<ProjectReportViewProps> = ({ projectId }) => {
  const navigate = useNavigate();
  const [project, setProject] = useState<any | null>(null);
  const [stages, setStages] = useState<ConstructionStage[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch User Info
        try {
          const storedUser = await authService.checkSession();
          setUser(storedUser);
        } catch (e) {
          console.warn('Failed to fetch user info for report:', e);
        }

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

  // Statistics Calculation
  const totalStages = stages.length;
  const completedStages = stages.filter(s => s.status === 'completed').length;
  const progress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 print:bg-white print:pb-0">

      <ReportHeader onBack={handleBack} onPrint={handlePrint} />

      <div className="max-w-4xl mx-auto mt-20 px-4 space-y-6 print:mt-0 print:px-0">

        <ReportOverview
          project={project}
          stages={stages}
          progress={progress}
        />

        <div className="break-inside-avoid">
          <ReportContractSection project={project} user={user} />
        </div>

        <ConstructionStageList stages={stages} />

        <EstimateItemTable
          items={project.items || []}
          totalAmount={project.totalAmount || 0}
        />

      </div>
    </div>
  );
};
