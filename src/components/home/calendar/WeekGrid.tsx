import React from 'react';

interface WeekGridProps {
  weekDays: Date[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const WeekGrid: React.FC<WeekGridProps> = ({ weekDays, selectedDate, onDateSelect }) => {
  return (
    <div className="grid grid-cols-7 px-4 content-start">
      {weekDays.map((date, idx) => {
        const isSelectedDate = date.toDateString() === selectedDate.toDateString();
        const isTodayDate = date.toDateString() === new Date().toDateString();

        return (
          <div key={idx} className="flex flex-col items-center relative h-14">
            <button
              onClick={() => onDateSelect(date)}
              className={`
                w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all
                ${isSelectedDate
                  ? 'bg-slate-900 text-white shadow-md'
                  : isTodayDate ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-100'
                }
              `}
            >
              {date.getDate()}
            </button>
          </div>
        );
      })}
    </div>
  );
};
