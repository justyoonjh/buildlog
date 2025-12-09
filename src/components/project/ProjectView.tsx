import React, { useState, useRef, useEffect } from 'react';
import { Plus, FileText, Hammer, CheckCircle, Menu } from 'lucide-react';

export const ProjectView: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Toggle menu on click
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="flex-1 relative bg-slate-50 p-6" ref={containerRef}>
      {/* Top-Left Menu Button Container */}
      <div className="relative z-20">
        <button
          onClick={toggleMenu}
          className={`
            w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg 
            transition-transform duration-200 active:scale-95
            ${isMenuOpen ? 'scale-110' : ''}
          `}
        >
          <Menu size={24} />
        </button>

        {/* Circular Menu Options */}
        {/* Option 1: Estimate (Right) */}
        <div
          className={`
            absolute top-0 left-0 w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-slate-700
            transition-all duration-300 ease-out -z-10
            ${isMenuOpen ? 'translate-x-[5.5rem] opacity-100' : 'translate-x-0 opacity-0'}
          `}
        >
          <div className="flex flex-col items-center">
            <FileText size={20} />
            <span className="text-[10px] font-medium mt-0.5">견적</span>
          </div>
        </div>

        {/* Option 2: Construction (Diagonal) */}
        <div
          className={`
            absolute top-0 left-0 w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-slate-700
            transition-all duration-300 ease-out -z-10 delay-75
            ${isMenuOpen ? 'translate-x-[4rem] translate-y-[4rem] opacity-100' : 'translate-x-0 translate-y-0 opacity-0'}
          `}
        >
          <div className="flex flex-col items-center">
            <Hammer size={20} />
            <span className="text-[10px] font-medium mt-0.5">시공</span>
          </div>
        </div>

        {/* Option 3: Completed (Down) */}
        <div
          className={`
            absolute top-0 left-0 w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-slate-700
            transition-all duration-300 ease-out -z-10 delay-150
            ${isMenuOpen ? 'translate-y-[5.5rem] opacity-100' : 'translate-y-0 opacity-0'}
          `}
        >
          <div className="flex flex-col items-center">
            <CheckCircle size={20} />
            <span className="text-[10px] font-medium mt-0.5">완료</span>
          </div>
        </div>
      </div>

      {/* Main Content Placeholder */}
      <div className="mt-10 text-slate-400 text-center">
        <p>프로젝트 탭 화면입니다.</p>
        <p className="text-sm mt-2">좌측 상단 메뉴 버튼을 꾹 눌러보세요.</p>
      </div>

      {/* Bottom-Right FAB (Create Estimate) */}
      <button
        className="fixed bottom-[calc(80px+env(safe-area-inset-bottom))] right-6 w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-slate-700 transition-colors z-30"
        onClick={() => console.log('Create Estimate Clicked')}
      >
        <Plus size={28} />
      </button>
    </div>
  );
};
