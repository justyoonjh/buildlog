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

export const ProjectView: React.FC<ProjectViewProps> = ({ initialProjectId, initialTab }) => {
  const {
    activeTab,
    setActiveTab,
    isCreatingEstimate,
    setIsCreatingEstimate,
    editingEstimate,
    setEditingEstimate,
    estimates, // pass if needed, but lists use filtered ones
    isLoading,
    selectedProject,
    setSelectedProject,
    fetchEstimates,
    handleEditEstimate,

    // Filtered Lists
    negotiatingEstimates,
    contractedEstimates,
    completedProjects
  } = useProjectLogic(initialProjectId, initialTab);

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
          // Refresh data in case status changed in detail view?
          fetchEstimates();
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
          <CompletedList projects={completedProjects} />
        )}
      </div>
    </div>
  );
};
