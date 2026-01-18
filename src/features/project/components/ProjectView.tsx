import React from 'react';
import { EstimateForm } from './estimate/EstimateForm';
import ConstructionDetail from './ConstructionDetail';
import { ConsultationView } from './ConsultationView';
import { ContractView } from './ContractView';
import { useProjectLogic } from '@/features/project/hooks/useProjectLogic';
import { ProjectNavBar } from './ProjectNavBar';
import { EstimateList } from './EstimateList';
import { ConstructionList } from './ConstructionList';
import { CompletedList } from './CompletedList';
import { Tab } from '@/types';

interface ProjectViewProps {
  initialProjectId?: string;
  initialTab?: Tab;
}

import { useNavigate, useLocation } from 'react-router-dom';

export const ProjectView: React.FC<ProjectViewProps> = ({ initialProjectId, initialTab }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    activeTab,
    setActiveTab,
    isCreatingEstimate,
    setIsCreatingEstimate,
    editingEstimate,
    setEditingEstimate,
    estimates,
    isLoading,
    selectedProject,
    setSelectedProject,
    fetchEstimates,
    handleEditEstimate,

    // Filtered Lists
    consultationProjects,
    negotiatingEstimates,
    contractedEstimates,
    completedProjects
  } = useProjectLogic(initialProjectId, initialTab);

  // Handle Navigation State from ConsultationView
  React.useEffect(() => {
    if (location.state && location.state.consultationData) {
      const data = location.state.consultationData;
      // Pre-fill EstimateForm
      setEditingEstimate({
        ...data,
        id: data.id, // Keep ID to update existing record instead of creating new
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        clientName: data.clientName || '',
        clientPhone: data.clientPhone || '',
        siteAddress: data.siteAddress || '',
      });
      setIsCreatingEstimate(true);
      // Clear state to prevent re-triggering? 
      // Actually navigate replace might be better but for now this works.
      // We should probably remove the state so refresh doesn't trigger it again?
      // history.replaceState({}, document.title)
    }
  }, [location.state, setEditingEstimate, setIsCreatingEstimate]);

  // Render Form (Create or Edit Estimate)
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

          fetchEstimates();
          if (result?.status === 'contract_ready') {
            setActiveTab('contract');
          } else if (result?.status === 'contracted') {
            setActiveTab('construction');
            setSelectedProject(result);
          }
        }}
      />
    );
  }

  // Render Construction Detail View
  if (selectedProject) {
    return (
      <ConstructionDetail
        project={selectedProject}
        onBack={() => {
          setSelectedProject(null);
          fetchEstimates();
          if (initialProjectId) {
            // Check if we have history, but safely just go to project list
            // We use window.location or navigate to force the tab
            // Since we are inside Router, use imported navigate if possible or throw?
            // ProjectView doesn't have navigate. useProjectLogic has it but doesn't expose it for this.
            // Let's use window.location.href as a fallback or pass a callback?
            // actually useProjectLogic returns nothing helpful for navigation.
            // We can import useNavigate here.
          }
        }}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 h-full relative">
      {/* Top Tab Navigation */}
      <ProjectNavBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content Area */}
      <div className="flex-1 p-4 overflow-y-auto">

        {/* Consultation Tab */}
        {activeTab === 'consultation' && (
          <ConsultationView
            projects={consultationProjects}
            onSelectProject={(id: string) => {
              // Future: move to estimate
            }}
          />
        )}

        {/* Estimate Tab */}
        {activeTab === 'estimate' && (
          <EstimateList
            estimates={negotiatingEstimates}
            isLoading={isLoading}
            onCreate={() => setIsCreatingEstimate(true)}
            onEdit={handleEditEstimate}
          />
        )}

        {/* Contract Tab */}
        {activeTab === 'contract' && (
          <ContractView
            onSelectProject={(id) => {
              if (id === 'SWITCH_TO_CONSTRUCTION') {
                setActiveTab('construction');
                fetchEstimates();
              } else {
                handleEditEstimate(id);
              }
            }}
          />
        )}

        {/* Construction Tab */}
        {activeTab === 'construction' && (
          <ConstructionList
            projects={contractedEstimates}
            isLoading={isLoading}
            onSelect={(id) => handleEditEstimate(id, true)}
          />
        )}

        {/* Completed Tab */}
        {activeTab === 'completed' && (
          <CompletedList
            projects={completedProjects}
            onSelect={(id) => {
              // Open Report
              window.open(`/report/${id}`, '_blank');
            }}
          />
        )}
      </div>
    </div>
  );
};
