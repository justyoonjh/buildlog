import React, { useState } from 'react';
import { DatePickerModal } from './DatePickerModal';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface CalendarViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  isWeekView: boolean;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ selectedDate, onDateSelect, isWeekView }) => {
  // Internal state for the month being viewed (independent of selected date)
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Sync viewDate with selectedDate when not in week view (optional, but good UX)
  React.useEffect(() => {
    if (!isWeekView) setViewDate(new Date(selectedDate));
  }, [selectedDate, isWeekView]);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateConfirm = (date: Date) => {
    setViewDate(date);
    onDateSelect(date);
  };

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

  // Week View Logic
  const getWeekDays = () => {
    const currentDay = selectedDate.getDay(); // 0 (Sun) - 6 (Sat)
    const sunday = new Date(selectedDate);
    sunday.setDate(selectedDate.getDate() - currentDay);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      week.push(d);
    }
    return week;
  };

  const weekDays = getWeekDays();

  return (
    <div className={`flex-1 flex flex-col bg-white transition-all duration-300 ${isWeekView ? 'pb-0' : ''}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-6 py-4">
        {!isWeekView && (
          <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-full">
            <ChevronLeft size={24} className="text-slate-600" />
          </button>
        )}

        <button
          onClick={() => setIsDatePickerOpen(true)}
          className="flex items-center justify-center gap-1 text-xl font-bold text-slate-900 flex-1 hover:bg-slate-50 py-1 rounded-lg transition-colors"
        >
          {isWeekView
            ? `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월`
            : `${viewDate.getFullYear()}년 ${viewDate.getMonth() + 1}월`
          }
          <ChevronDown size={20} className="text-slate-400" />
        </button>

        {!isWeekView && (
          <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-full">
            <ChevronRight size={24} className="text-slate-600" />
          </button>
        )}
      </div>

      {/* Weekdays Label */}
      <div className="grid grid-cols-7 mb-2 px-4">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
          <div key={day} className={`text-center text-sm font-medium ${idx === 0 ? 'text-red-500' : 'text-slate-500'}`}>
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      {isWeekView ? (
        // Week View
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
      ) : (
        // Month View
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
      )}

      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onConfirm={handleDateConfirm}
        initialDate={isWeekView ? selectedDate : viewDate}
      />
    </div>
  );
};
