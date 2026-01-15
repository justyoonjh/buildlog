import React from 'react';
import { CalendarView } from './CalendarView';
import { ScheduleBottomSheet } from './ScheduleBottomSheet';
import { HomeFAB } from './HomeFAB';

interface HomeDashboardProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  isSheetExpanded: boolean;
  onToggleSheet: () => void;
  projects: any[];
  onProjectClick: (id: string) => void;
  onFabClick: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  selectedDate,
  onDateSelect,
  isSheetExpanded,
  onToggleSheet,
  projects,
  onProjectClick,
  onFabClick
}) => {
  return (
    <>
      <CalendarView
        selectedDate={selectedDate}
        onDateSelect={onDateSelect}
        isWeekView={isSheetExpanded}
        projects={projects}
      />

      <ScheduleBottomSheet
        selectedDate={selectedDate}
        isExpanded={isSheetExpanded}
        onToggleExpand={onToggleSheet}
        projects={projects}
        onProjectClick={onProjectClick}
      />

      <HomeFAB onClick={onFabClick} />
    </>
  );
};
