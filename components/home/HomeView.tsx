import React, { useState } from 'react';
import { HomeHeader } from './HomeHeader';
import { CalendarView } from './CalendarView';
import { ScheduleBottomSheet } from './ScheduleBottomSheet';
import { BottomNavigation } from './BottomNavigation';
import { UserProfileModal } from './UserProfileModal';
import { BusinessInfoModal } from './BusinessInfoModal';

export const HomeView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [activeTab, setActiveTab] = useState('home');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBusinessInfoOpen, setIsBusinessInfoOpen] = useState(false);

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
            />

            {/* Bottom Sheet overlays the bottom part */}
            <ScheduleBottomSheet
              selectedDate={selectedDate}
              isExpanded={isSheetExpanded}
              onToggleExpand={() => setIsSheetExpanded(prev => !prev)}
            />
          </>
        )}

        {activeTab !== 'home' && (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            준비 중인 화면입니다.
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};
