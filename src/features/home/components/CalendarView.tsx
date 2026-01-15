import React, { useState } from 'react';
import { DatePickerModal } from './DatePickerModal';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useCalendar } from '@/hooks/useCalendar';
import { MonthGrid } from './calendar/MonthGrid';
import { WeekGrid } from './calendar/WeekGrid';

interface CalendarViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  isWeekView: boolean;
  projects?: any[]; // Allow projects to be passed
}

export const CalendarView: React.FC<CalendarViewProps> = ({ selectedDate, onDateSelect, isWeekView, projects = [] }) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const {
    viewDate,
    prevMonth,
    nextMonth,
    handleDateConfirm,
    days,
    blanks,
    weekDays,
  } = useCalendar(selectedDate, isWeekView, onDateSelect);

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
        <WeekGrid
          weekDays={weekDays}
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          projects={projects}
        />
      ) : (
        <MonthGrid
          days={days}
          blanks={blanks}
          viewDate={viewDate}
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          projects={projects}
        />
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
