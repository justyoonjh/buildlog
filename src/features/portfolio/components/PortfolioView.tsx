import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { CheckCircle, Calendar, ArrowUpDown } from 'lucide-react';

export const PortfolioView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [completedProjects, setCompletedProjects] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    fetchCompletedProjects();
  }, []);

  const fetchCompletedProjects = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/estimates');
      if (res.data.success) {
        const completed = res.data.estimates.filter((e: any) => e.status === 'completed');
        setCompletedProjects(completed);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const sortedProjects = [...completedProjects].sort((a, b) => {
    const dateA = a.startDate || '';
    const dateB = b.startDate || '';
    return sortOrder === 'desc' ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB);
  });

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-bold text-slate-900">포트폴리오</h1>
        <button
          onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
          className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded"
        >
          <ArrowUpDown size={14} />
          {sortOrder === 'desc' ? '최신순' : '오래된순'}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center py-10 text-slate-400 text-sm">로딩 중...</div>
        ) : sortedProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg shadow-sm p-6 text-center text-slate-500 border border-slate-100 border-dashed">
            <CheckCircle size={40} className="mb-2 opacity-20" />
            <p>완료된 프로젝트가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedProjects.map(project => (
              <div key={project.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100">
                {project.generatedImage && (
                  <img src={project.generatedImage} alt="Completed Project" className="w-full h-40 object-cover" />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 text-lg mb-1">{project.siteAddress}</h3>
                  <div className="flex items-center text-xs text-slate-500 mb-2">
                    <Calendar size={14} className="mr-1" />
                    {project.startDate} ~ {project.endDate}
                  </div>
                  {project.modelImage ? (
                    <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">
                      AI 시공 모델링 포함
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
