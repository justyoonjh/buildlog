import React, { useState } from 'react';
import { HomeHeader } from './HomeHeader';
import { CalendarView } from './CalendarView';
import { ScheduleBottomSheet } from './ScheduleBottomSheet';
import { BottomNavigation } from './BottomNavigation';
import { UserProfileModal } from './UserProfileModal';
import { BusinessInfoModal } from './BusinessInfoModal';
import { ProjectView } from '../project/ProjectView';
import apiClient from '../../services/apiClient';
import { AnalysisView } from '../analysis/AnalysisView';

export const HomeView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [activeTab, setActiveTab] = useState('home');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBusinessInfoOpen, setIsBusinessInfoOpen] = useState(false);

  // Data State
  const [estimates, setEstimates] = useState<any[]>([]); // Use appropriate type if available, simple any for now to avoid circular dep issues in import
  const [targetProjectId, setTargetProjectId] = useState<string | undefined>(undefined);

  // Fetch data
  React.useEffect(() => {
    const fetchEstimates = async () => {
      try {
        const res = await apiClient.get('/estimates');
        if (res.data.success) {
          setEstimates(res.data.estimates);
        }
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      }
    };
    fetchEstimates();
  }, []);

  const handleProjectClick = (projectId: string) => {
    setTargetProjectId(projectId);
    setActiveTab('project');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Header */}
      <HomeHeader
        onTodayClick={() => setSelectedDate(new Date())}
        onUserClick={() => setIsProfileOpen(true)}
        onBusinessInfoClick={() => setIsBusinessInfoOpen(true)}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <BusinessInfoModal
        isOpen={isBusinessInfoOpen}
        onClose={() => setIsBusinessInfoOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative pb-[60px]"> {/* Padding for bottom nav */}
        {activeTab === 'home' && (
          <>
            {/* Calendar takes up the upper space */}
            <CalendarView
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              isWeekView={isSheetExpanded}
              projects={estimates} // Pass projects to calendar
            />

            {/* Bottom Sheet overlays the bottom part */}
            <ScheduleBottomSheet
              selectedDate={selectedDate}
              isExpanded={isSheetExpanded}
              onToggleExpand={() => setIsSheetExpanded(prev => !prev)}
              projects={estimates} // Pass projects to sheet
              onProjectClick={handleProjectClick}
            />
          </>
        )}

        {activeTab === 'project' && (
          <ProjectView initialProjectId={targetProjectId} />
        )}

        {activeTab === 'analysis' && (
          <AnalysisView />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};
