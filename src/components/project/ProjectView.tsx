import React, { useState, useEffect } from 'react';
import { FileText, Hammer, CheckCircle, Plus, Calendar, MapPin, BadgeAlert } from 'lucide-react';
import { EstimateForm } from '../estimate/EstimateForm';
import ConstructionDetail from './ConstructionDetail';
import apiClient from '../../services/apiClient';

type Tab = 'estimate' | 'construction' | 'completed';

interface Estimate {
  id: string;
  clientName: string;
  clientPhone: string;
  siteAddress: string;
  startDate: string;
  endDate: string;
  status: string;
  totalAmount: number;
  createdAt: number;
}

interface ProjectViewProps {
  initialProjectId?: string;
}

export const ProjectView: React.FC<ProjectViewProps> = ({ initialProjectId }) => {
  const [activeTab, setActiveTab] = useState<Tab>('estimate');
  const [isCreatingEstimate, setIsCreatingEstimate] = useState(false);
  // Store the estimate being edited
  const [editingEstimate, setEditingEstimate] = useState<Estimate | null>(null);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Estimate | null>(null);

  // Fetch estimates
  const fetchEstimates = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/estimates');
      if (res.data.success) {
        setEstimates(res.data.estimates);
      }
    } catch (error) {
      console.error('Failed to fetch estimates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimates();

    // Handle Deep Link
    if (initialProjectId) {
      const loadInitialProject = async () => {
        try {
          const res = await apiClient.get(`/estimates/${initialProjectId}`);
          if (res.data.success) {
            const project = res.data.estimate;
            if (project.status === 'contracted') {
              setActiveTab('construction');
              setSelectedProject(project);
            } else {
              setActiveTab('estimate');
              setEditingEstimate(project);
            }
          }
        } catch (error) {
          console.error('Failed to load initial project:', error);
        }
      };
      loadInitialProject();
    }
  }, [initialProjectId]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'estimate', label: '견적', icon: <FileText size={18} /> },
    { id: 'construction', label: '시공', icon: <Hammer size={18} /> },
    { id: 'completed', label: '완료', icon: <CheckCircle size={18} /> },
  ];

  // Render Form (Create or Edit)
  if (isCreatingEstimate || editingEstimate) {
    return (
      <EstimateForm
        initialData={editingEstimate || undefined}
        onBack={() => {
          setIsCreatingEstimate(false);
          setEditingEstimate(null);
        }}
        onComplete={(result) => {
          setIsCreatingEstimate(false);
          setEditingEstimate(null);

          if (result && result.status === 'contracted') {
            setActiveTab('construction');
            // Immediately select the project to show the ConstructionDetail view
            setSelectedProject(result);
          } else {
            // Check if we need to switch tabs or stay on estimate
            setActiveTab('estimate');
          }

          fetchEstimates();
        }}
      />
    );
  }

  // Filter Logic
  // Show both 'draft' (legacy) and 'negotiating' in the Estimate tab
  const negotiatingEstimates = estimates.filter(e => e.status === 'draft' || e.status === 'negotiating');
  const contractedEstimates = estimates.filter(e => e.status === 'contracted');

  // Helper to simplify address for Project Title
  const getProjectTitle = (address: string) => {
    if (!address) return '새 프로젝트';
    const parts = address.split(' ');
    if (parts.length > 3) {
      return parts.slice(0, 3).join(' ') + ' 프로젝트';
    }
    return address + ' 프로젝트';
  };

  // Handle edit click - fetch full details including items
  const handleEditEstimate = async (id: string, isReadOnly: boolean = false) => {
    try {
      setIsLoading(true);
      const res = await apiClient.get(`/estimates/${id}`);
      if (res.data.success) {
        if (isReadOnly) {
          setSelectedProject(res.data.estimate);
        } else {
          setEditingEstimate(res.data.estimate);
        }
      }
    } catch (error) {
      console.error('Failed to fetch estimate details:', error);
      alert('견적 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEstimateCard = (est: Estimate, isConstruction: boolean = false) => (
    <div
      key={est.id}
      onClick={() => handleEditEstimate(est.id, isConstruction)}
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

      {/* Project Name (Simplified Address) */}
      <h3 className="text-lg font-bold text-slate-900 mb-1 pr-20 truncate">
        {getProjectTitle(est.siteAddress)}
      </h3>

      {/* Address */}
      <div className="flex items-center text-slate-500 text-sm mb-3">
        <MapPin size={14} className="mr-1" />
        <span className="truncate">{est.siteAddress || '주소 미입력'}</span>
      </div>

      <div className="border-t border-slate-100 my-3" />

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-y-2 text-xs">
        <div className="flex flex-col">
          <span className="text-slate-400 mb-0.5">공사 기간</span>
          <div className="flex items-center text-slate-700 font-medium">
            <Calendar size={12} className="mr-1 text-slate-400" />
            {est.startDate && est.endDate ? `${est.startDate} ~ ${est.endDate}` : '미정'}
          </div>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-slate-400 mb-0.5">고객 정보</span>
          <span className="text-slate-700 font-medium">
            {est.clientName} ({est.clientPhone})
          </span>
        </div>
      </div>
    </div>
  );

  // Render Construction Detail View
  if (selectedProject) {
    return (
      <ConstructionDetail
        project={selectedProject}
        onBack={() => {
          setSelectedProject(null);
          fetchEstimates();
        }}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 h-full relative">
      {/* Top Tab Navigation */}
      <div className="bg-white border-b border-slate-100 flex sticky top-0 z-10 pr-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center py-3 text-sm font-medium transition-colors relative
              ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}
            `}
          >
            <div className="flex items-center gap-1.5">
              {tab.icon}
              <span>{tab.label}</span>
            </div>
            {/* Active Indicator */}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'estimate' && (
          <div className="space-y-4 pb-20">
            {isLoading ? (
              <div className="text-center py-10 text-slate-400 text-sm">로딩 중...</div>
            ) : negotiatingEstimates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white rounded-lg border border-slate-100 border-dashed relative">
                <div className="text-center">
                  <p>작성된 견적서가 없습니다.</p>
                  <button
                    onClick={() => setIsCreatingEstimate(true)}
                    className="mt-4 px-6 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg text-sm hover:bg-blue-100 transition-colors"
                  >
                    + 새 견적서 작성하기
                  </button>
                </div>
              </div>
            ) : (
              negotiatingEstimates.map(est => renderEstimateCard(est, false))
            )}


          </div>
        )}

        {/* Construction Tab */}
        {activeTab === 'construction' && (
          <div className="space-y-4 pb-20">
            {isLoading ? (
              <div className="text-center py-10 text-slate-400 text-sm">로딩 중...</div>
            ) : contractedEstimates.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-slate-400 bg-white rounded-lg border border-slate-100 border-dashed">
                진행 중인 시공 목록이 없습니다.
              </div>
            ) : (
              contractedEstimates.map(est => renderEstimateCard(est, true))
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="flex items-center justify-center h-64 text-slate-400 bg-white rounded-lg border border-slate-100 border-dashed">
            완료된 프로젝트가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};
