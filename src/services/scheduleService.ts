import { Schedule } from '../types';

// Mock Data
const today = new Date();
const MOCK_SCHEDULES: Schedule[] = [
  {
    id: 1,
    time: '오후 3시',
    title: 'A동 기초 콘크리트 타설',
    type: 'work',
    date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  },
];

export const scheduleService = {
  getSchedulesByDate: (date: Date): Schedule[] => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return MOCK_SCHEDULES.filter(schedule => schedule.date === dateStr);
  }
};
