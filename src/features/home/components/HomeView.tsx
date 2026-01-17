import React, { useState } from 'react';
import { HomeHeader } from './HomeHeader';
import { BottomNavigation } from './BottomNavigation';
import { UserProfileModal } from './UserProfileModal';
import { BusinessInfoModal } from './BusinessInfoModal';
import { ProjectView } from '@/features/project/components/ProjectView';
import { PortfolioView } from '@/features/portfolio/components/PortfolioView';
import { ConsultationModal } from './ConsultationModal';
import { CompanyInfoModal } from '@/features/company/components/CompanyInfoModal';
import { useHomeLogic } from '@/features/home/hooks/useHomeLogic';
import { HomeDashboard } from './HomeDashboard';

export const HomeView: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedDate,
    setSelectedDate,
    isSheetExpanded,
    setIsSheetExpanded,
    estimates,
    targetProjectId,
    handleProjectClick,
    isProfileOpen,
    setIsProfileOpen,
    isBusinessInfoOpen,
    setIsBusinessInfoOpen,
    isConsultationModalOpen,
    setIsConsultationModalOpen
  } = useHomeLogic();

  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
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

      {/* Added CompanyInfoModal */}
      <CompanyInfoModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative pb-[60px]">
        {activeTab === 'home' && (
          <HomeDashboard
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            isSheetExpanded={isSheetExpanded}
            onToggleSheet={() => setIsSheetExpanded(prev => !prev)}
            projects={estimates}
            onProjectClick={handleProjectClick}
            onFabClick={() => setIsConsultationModalOpen(true)}
          />
        )}

        {activeTab === 'project' && (
          <ProjectView initialProjectId={targetProjectId} />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioView />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};
