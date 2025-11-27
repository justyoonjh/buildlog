import React, { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { formatDate, getLunarDate } from '../../utils/dateUtils';
import { scheduleService } from '../../services/scheduleService';

interface ScheduleBottomSheetProps {
  selectedDate: Date;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const ScheduleBottomSheet: React.FC<ScheduleBottomSheetProps> = ({ selectedDate, isExpanded, onToggleExpand }) => {
  const filteredSchedules = useMemo(() => scheduleService.getSchedulesByDate(selectedDate), [selectedDate]);

  return (
    <div
      className={`
        fixed bottom-[60px] left-0 right-0 bg-white rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] 
        transition-all duration-300 ease-in-out z-20 flex flex-col
        ${isExpanded ? 'h-[70vh]' : 'h-[25vh]'}
      `}
    >
      {/* Drag Handle */}
      <div
        className="w-full h-8 flex items-center justify-center cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">
            {formatDate(selectedDate)} <span className="text-sm font-normal text-slate-400 ml-2">{getLunarDate(selectedDate)}</span>
          </h3>
        </div>

        {/* Timeline */}
        <div className="space-y-6 relative">
          {filteredSchedules.length > 0 ? (
            filteredSchedules.map((item) => (
              <div key={item.id} className="flex items-start group relative z-10">
                <div className="w-20 text-sm font-medium text-slate-400 pt-1">
                  {item.time}
                </div>
                <div className="flex-1 border-b border-slate-100 pb-6 group-last:border-0">
                  <div className="text-base font-medium text-slate-900">
                    {item.title}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-slate-400 py-10">
              일정이 없습니다.
            </div>
          )}

          {/* Add Button */}
          <button className="fixed bottom-20 right-6 w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-slate-700 transition-colors z-30">
            <Plus size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};
