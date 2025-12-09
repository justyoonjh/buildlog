import React from 'react';

interface WeekGridProps {
  weekDays: Date[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  projects?: any[];
}

export const WeekGrid: React.FC<WeekGridProps> = ({ weekDays, selectedDate, onDateSelect, projects = [] }) => {
  // Helper
  const hasProject = (date: Date) => {
    if (!projects) return false;
    const dateStr = date.toISOString().split('T')[0];
    return projects.some(p => {
      return p.startDate <= dateStr && p.endDate >= dateStr;
    });
  };

  return (
    <div className="grid grid-cols-7 px-4 content-start">
      {weekDays.map((date, idx) => {
        const isSelectedDate = date.toDateString() === selectedDate.toDateString();
        const isTodayDate = date.toDateString() === new Date().toDateString();
        const isProjectDay = hasProject(date);

        return (
          <div key={idx} className="flex flex-col items-center relative h-14">
            <button
              onClick={() => onDateSelect(date)}
              className={`
                w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all relative
                ${isSelectedDate
                  ? 'bg-slate-900 text-white shadow-md'
                  : isTodayDate ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-100'
                }
              `}
            >
              {date.getDate()}
              {/* Project Indicator Dot */}
              {isProjectDay && !isSelectedDate && (
                <div className="absolute bottom-1 w-1 h-1 bg-blue-500 rounded-full" />
              )}
            </button>
            {/* Selected Indicator for Project */}
            {isProjectDay && isSelectedDate && (
              <div className="absolute bottom-1 w-1 h-1 bg-white rounded-full z-10" />
            )}
          </div>
        );
      })}
    </div>
  );
};
