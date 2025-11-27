import React from 'react';

interface MonthGridProps {
  days: number[];
  blanks: number[];
  viewDate: Date;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const MonthGrid: React.FC<MonthGridProps> = ({ days, blanks, viewDate, selectedDate, onDateSelect }) => {
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

  return (
    <div className="grid grid-cols-7 px-4 flex-1 content-start gap-y-6 animate-in fade-in duration-300">
      {blanks.map((_, idx) => (
        <div key={`blank-${idx}`} className="h-10" />
      ))}
      {days.map((day) => {
        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        return (
          <div key={day} className="flex flex-col items-center relative h-14">
            <button
              onClick={() => onDateSelect(date)}
              className={`
                w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all
                ${isSelected(day)
                  ? 'bg-slate-900 text-white shadow-md'
                  : isToday(day) ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-100'
                }
              `}
            >
              {day}
            </button>
          </div>
        );
      })}
    </div>
  );
};
