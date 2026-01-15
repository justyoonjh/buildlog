import { Schedule } from '@/types';

// Mock Data
const today = new Date();
const MOCK_SCHEDULES: Schedule[] = [];

export const scheduleService = {
  getSchedulesByDate: (date: Date): Schedule[] => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return MOCK_SCHEDULES.filter(schedule => schedule.date === dateStr);
  }
};
