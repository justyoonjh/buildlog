import React, { useState } from 'react';
import { HomeHeader } from './HomeHeader';
import { UserProfileModal } from './UserProfileModal';
import { BusinessInfoModal } from './BusinessInfoModal';
import { ConsultationModal } from './ConsultationModal';
import { CompanyInfoModal } from '@/features/company/components/CompanyInfoModal';
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
    isProfileOpen,
    setIsProfileOpen,
    isBusinessInfoOpen,
    setIsBusinessInfoOpen,
    isConsultationModalOpen,
    setIsConsultationModalOpen,
  } = useHomeLogic();

  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50">
      {/* Header */}
      <HomeHeader
        onTodayClick={() => setSelectedDate(new Date())}
        onUserClick={() => setIsProfileOpen(true)}
        onBusinessInfoClick={() => setIsCompanyModalOpen(true)}
      />

      {/* Global Modals */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <BusinessInfoModal
        isOpen={isBusinessInfoOpen}
        onClose={() => setIsBusinessInfoOpen(false)}
      />

      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
      />

      <CompanyInfoModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
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
