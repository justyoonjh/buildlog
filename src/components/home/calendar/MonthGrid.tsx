import React from 'react';

interface MonthGridProps {
  days: number[];
  blanks: number[];
  viewDate: Date;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  projects?: any[];
}

export const MonthGrid: React.FC<MonthGridProps> = ({ days, blanks, viewDate, selectedDate, onDateSelect, projects = [] }) => {
  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      viewDate.getMonth() === selectedDate.getMonth() &&
      viewDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      viewDate.getMonth() === today.getMonth() &&
      viewDate.getFullYear() === today.getFullYear()
    );
  };

  // Helper to check if a project is active on a given date
  const hasProject = (date: Date) => {
    if (!projects) return false;
    const dateStr = date.toISOString().split('T')[0];
    return projects.some(p => {
      // Simple string comparison for now, assuming YYYY-MM-DD format from backend
      return p.startDate <= dateStr && p.endDate >= dateStr;
    });
  };

  return (
    <div className="grid grid-cols-7 px-4 flex-1 content-start gap-y-6 animate-in fade-in duration-300">
      {blanks.map((_, idx) => (
        <div key={`blank-${idx}`} className="h-10" />
      ))}
      {days.map((day) => {
        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const isProjectDay = hasProject(date);

        return (
          <div key={day} className="flex flex-col items-center relative h-14">
            <button
              onClick={() => onDateSelect(date)}
              className={`
                w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all relative
                ${isSelected(day)
                  ? 'bg-slate-900 text-white shadow-md'
                  : isToday(day) ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-100'
                }
              `}
            >
              {day}
              {/* Project Indicator Dot (Only if not selected, as selected has dark bg) */}
              {isProjectDay && !isSelected(day) && (
                <div className="absolute bottom-1 w-1 h-1 bg-blue-500 rounded-full" />
              )}
            </button>
            {/* Selected Indicator for Project (White dot if selected) */}
            {isProjectDay && isSelected(day) && (
              <div className="absolute bottom-1 w-1 h-1 bg-white rounded-full z-10" />
            )}
          </div>
        );
      })}
    </div>
  );
};
