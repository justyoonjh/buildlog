import { useState, useEffect } from 'react';

export const useCalendar = (selectedDate: Date, isWeekView: boolean, onDateSelect: (date: Date) => void) => {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));

  useEffect(() => {
    if (!isWeekView) setViewDate(new Date(selectedDate));
  }, [selectedDate, isWeekView]);

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

  // Month View Data
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  // Week View Data
  const getWeekDays = () => {
    const currentDay = selectedDate.getDay();
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

  return {
    viewDate,
    setViewDate,
    prevMonth,
    nextMonth,
    handleDateConfirm,
    days,
    blanks,
    weekDays,
  };
};
