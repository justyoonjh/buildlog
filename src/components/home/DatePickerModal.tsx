import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initialDate: Date;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({ isOpen, onClose, onConfirm, initialDate }) => {
  const [pickerDate, setPickerDate] = useState(new Date(initialDate));
  const [selectedDay, setSelectedDay] = useState(new Date(initialDate));
  const [viewMode, setViewMode] = useState<'day' | 'month-year'>('day');

  // State for Year/Month Picker
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth() + 1);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPickerDate(new Date(initialDate));
      setSelectedDay(new Date(initialDate));
      setSelectedYear(initialDate.getFullYear());
      setSelectedMonth(initialDate.getMonth() + 1);
      setViewMode('day');
    }
  }, [isOpen, initialDate]);

  if (!isOpen) return null;

  const daysInMonth = new Date(pickerDate.getFullYear(), pickerDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => {
    setPickerDate(new Date(pickerDate.getFullYear(), pickerDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setPickerDate(new Date(pickerDate.getFullYear(), pickerDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const newDate = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), day);
    setSelectedDay(newDate);
  };

  const handleConfirm = () => {
    onConfirm(selectedDay);
    onClose();
  };

  const handleMonthYearConfirm = () => {
    const newDate = new Date(selectedYear, selectedMonth - 1, 1);
    setPickerDate(newDate);
    setSelectedDay(newDate); // Optional: reset selected day to 1st of new month
    setViewMode('day');
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDay.getDate() &&
      pickerDate.getMonth() === selectedDay.getMonth() &&
      pickerDate.getFullYear() === selectedDay.getFullYear()
    );
  };

  // Generate years for picker (e.g., current year +/- 50)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 101 }, (_, i) => currentYear - 50 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-slate-800 w-[320px] rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {viewMode === 'day' ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors">
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={() => setViewMode('month-year')}
                className="flex items-center gap-1 text-white font-bold text-lg cursor-pointer hover:bg-slate-700 px-2 py-1 rounded-lg transition-colors"
              >
                {pickerDate.getFullYear()}년 {pickerDate.getMonth() + 1}월
                <ChevronDown size={16} className="text-slate-400" />
              </button>

              <button onClick={nextMonth} className="p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 mb-4">
              {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-slate-400">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-y-4 mb-8">
              {blanks.map((_, idx) => (
                <div key={`blank-${idx}`} />
              ))}
              {days.map((day) => (
                <div key={day} className="flex items-center justify-center">
                  <button
                    onClick={() => handleDayClick(day)}
                    className={`
                      w-8 h-8 rounded-full text-sm font-medium transition-all
                      ${isSelected(day)
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }
                    `}
                  >
                    {day}
                  </button>
                </div>
              ))}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-6">
              <button
                onClick={onClose}
                className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                확인
              </button>
            </div>
          </>
        ) : (
          // Month-Year Picker View
          <>
            {/* Header */}
            <div className="flex items-center justify-center mb-6">
              <button
                onClick={() => setViewMode('day')}
                className="flex items-center gap-1 text-white font-bold text-lg cursor-pointer hover:bg-slate-700 px-2 py-1 rounded-lg transition-colors"
              >
                {selectedYear}년 {selectedMonth}월
                <ChevronUp size={16} className="text-slate-400" />
              </button>
            </div>

            {/* Picker Columns */}
            <div className="flex h-64 mb-8 relative">
              {/* Selection Highlight Bar */}
              <div className="absolute top-1/2 left-0 right-0 h-10 -mt-5 bg-slate-700/50 rounded-lg pointer-events-none" />

              {/* Year Column */}
              <div className="flex-1 overflow-y-auto no-scrollbar snap-y snap-mandatory text-center py-[108px]"
                onScroll={(e) => {
                  // Simple scroll handler logic could be added here for snapping
                }}
              >
                {years.map(year => (
                  <div
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`h-10 flex items-center justify-center snap-center cursor-pointer transition-colors ${selectedYear === year ? 'text-white font-bold text-xl' : 'text-slate-500'}`}
                  >
                    {year}
                  </div>
                ))}
              </div>

              {/* Month Column */}
              <div className="flex-1 overflow-y-auto no-scrollbar snap-y snap-mandatory text-center py-[108px]">
                {months.map(month => (
                  <div
                    key={month}
                    onClick={() => setSelectedMonth(month)}
                    className={`h-10 flex items-center justify-center snap-center cursor-pointer transition-colors ${selectedMonth === month ? 'text-white font-bold text-xl' : 'text-slate-500'}`}
                  >
                    {month}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-6">
              <button
                onClick={() => setViewMode('day')}
                className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleMonthYearConfirm}
                className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                선택
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
