import React, { useMemo } from 'react';
import { Plus, Hammer, FileText, CheckCircle } from 'lucide-react';
import { formatDate, getLunarDate } from '../../utils/dateUtils';
import { scheduleService } from '../../services/scheduleService';

interface ScheduleBottomSheetProps {
  selectedDate: Date;
  isExpanded: boolean;
  onToggleExpand: () => void;
  projects?: any[];
  onProjectClick?: (id: string) => void;
}

export const ScheduleBottomSheet: React.FC<ScheduleBottomSheetProps> = ({ selectedDate, isExpanded, onToggleExpand, projects = [], onProjectClick }) => {
  const filteredSchedules = useMemo(() => scheduleService.getSchedulesByDate(selectedDate), [selectedDate]);

  // Filter projects for this date
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    const dateStr = selectedDate.toISOString().split('T')[0];
    return projects.filter(p => p.startDate <= dateStr && p.endDate >= dateStr);
  }, [projects, selectedDate]);

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

          {/* Projects Section */}
          {filteredProjects.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Construction Projects</h4>
              <div className="space-y-3">
                {filteredProjects.map(project => (
                  <div
                    key={project.id}
                    onClick={() => onProjectClick && onProjectClick(project.id)}
                    className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3 active:scale-[0.99] transition-transform cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${project.status === 'contracted' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border border-blue-200'}`}>
                      {project.status === 'contracted' ? <Hammer size={18} /> : <FileText size={18} />}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-800 text-sm">{project.siteAddress.split(' ')[0] || '프로젝트'} 현장</div>
                      <div className="text-xs text-blue-600 font-medium">
                        {project.status === 'contracted' ? '시공 진행 중' : '견적 단계'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
          ) : filteredProjects.length === 0 && (
            <div className="text-center text-slate-400 py-10">
              일정이 없습니다.
            </div>
          )}


        </div>
      </div>
    </div>
  );
};
