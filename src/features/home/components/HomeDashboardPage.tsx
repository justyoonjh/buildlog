import React from 'react';
import { BusinessInfoModal } from './BusinessInfoModal';
import { ConsultationModal } from './ConsultationModal';
import { useHomeLogic } from '@/features/home/hooks/useHomeLogic';
import { HomeDashboard } from './HomeDashboard';

export const HomeDashboardPage: React.FC = () => {
  const {
    selectedDate,
    setSelectedDate,
    isSheetExpanded,
    setIsSheetExpanded,
    estimates,
    handleProjectClick,
    isBusinessInfoOpen,
    setIsBusinessInfoOpen,
    isConsultationModalOpen,
    setIsConsultationModalOpen,
  } = useHomeLogic();

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50">
      {/* Global Modals (Specific to Home or Legacy?) 
          BusinessInfoModal seems distinct from CompanyInfoModal. 
          ConsultationModal is triggered by FAB. 
      */}

      <BusinessInfoModal
        isOpen={isBusinessInfoOpen}
        onClose={() => setIsBusinessInfoOpen(false)}
      />

      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
      />

      {/* Dashboard Content */}
      <HomeDashboard
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        isSheetExpanded={isSheetExpanded}
        onToggleSheet={() => setIsSheetExpanded(prev => !prev)}
        projects={estimates}
        onProjectClick={handleProjectClick}
        onFabClick={() => setIsConsultationModalOpen(true)}
      />
    </div>
  );
};
