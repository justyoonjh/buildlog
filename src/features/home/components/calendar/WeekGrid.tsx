import React from 'react';

interface WeekGridProps {
  weekDays: Date[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  projects?: any[];
}

export const WeekGrid: React.FC<WeekGridProps> = ({ weekDays, selectedDate, onDateSelect, projects = [] }) => {
  // Helper to check if a project is active on a given date and return color class
  const getProjectColor = (date: Date) => {
    if (!projects) return null;
    const dateStr = date.toISOString().split('T')[0];

    // Find highest priority project for the day? Or just first.
    const project = projects.find(p => {
      if (!p.startDate) return false;
      return p.startDate <= dateStr && (p.endDate ? p.endDate >= dateStr : p.startDate === dateStr);
    });

    if (!project) return null;

    switch (project.status) {
      case 'consultation': return 'bg-emerald-500';
      case 'negotiating':
      case 'draft':
        return 'bg-purple-500';
      case 'contract_ready':
      case 'contracted':
      case 'construction':
        return 'bg-blue-600';
      case 'completed':
        return 'bg-slate-400';
      default:
        return 'bg-blue-400';
    }
  };

  return (
    <div className="grid grid-cols-7 px-4 content-start">
      {weekDays.map((date, idx) => {
        const isSelectedDate = date.toDateString() === selectedDate.toDateString();
        const isTodayDate = date.toDateString() === new Date().toDateString();
        const dotColor = getProjectColor(date);

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
              {dotColor && !isSelectedDate && (
                <div className={`absolute bottom-1 w-1 h-1 rounded-full ${dotColor}`} />
              )}
            </button>
            {/* Selected Indicator for Project */}
            {dotColor && isSelectedDate && (
              <div className="absolute bottom-1 w-1 h-1 bg-white rounded-full z-10" />
            )}
          </div>
        );
      })}
    </div>
  );
};
