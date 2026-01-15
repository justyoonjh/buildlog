import React, { useEffect, useState } from 'react';
import { FileSignature } from 'lucide-react';
import apiClient from '@/services/apiClient';
import { ContractForm } from './ContractForm';

interface ContractViewProps {
  onSelectProject?: (id: string) => void;
}

export const ContractView: React.FC<ContractViewProps> = ({ onSelectProject }) => {
  const [contracts, setContracts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  const fetchContracts = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/estimates');
      if (res.data.success) {
        setContracts(res.data.estimates.filter((e: any) => e.status === 'contract_ready'));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  if (selectedProject) {
    return (
      <ContractForm
        project={selectedProject}
        onBack={() => {
          setSelectedProject(null);
          fetchContracts();
        }}
        onComplete={() => {
          setSelectedProject(null);
          fetchContracts();
          // Ideally refresh parent or move user to Construction tab. 
          // But for now staying here or relying on user to switch tab.
          // Or we can use onSelectProject callback if it was intended to switch tabs?
          // The prompt said: "moves to Contract Tab where procedures are done" then "moves to Construction"
          // EstimateForm calls onComplete passing the new project, ProjectView handles tab switch.
          // We should propagate this up.
          if (onSelectProject) {
            onSelectProject('SWITCH_TO_CONSTRUCTION'); // Hacky signal or just let ProjectView handle re-fetch
          }
        }}
      />
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-sm font-semibold text-slate-500">계약 대기 목록</h2>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-slate-400 text-sm">로딩 중...</div>
      ) : contracts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white m-1">
          <FileSignature size={32} className="mb-2 opacity-50" />
          <p>계약 대기 중인 프로젝트가 없습니다.</p>
          <p className="text-xs mt-1">견적 탭에서 '견적 완료'를 선택하면 이곳에 표시됩니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-900">{item.siteAddress || '주소 미정'}</div>
                <div className="text-xs text-slate-500">{item.clientName}</div>
              </div>
              <button
                onClick={() => setSelectedProject(item)}
                className="bg-blue-600 text-white text-xs px-3 py-2 rounded-lg font-bold hover:bg-blue-700"
              >
                계약서 작성
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
