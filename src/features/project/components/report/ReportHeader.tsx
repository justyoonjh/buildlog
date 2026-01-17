import React from 'react';
import { ArrowLeft, Printer } from 'lucide-react';

interface ReportHeaderProps {
  onBack: () => void;
  onPrint: () => void;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({ onBack, onPrint }) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 shadow-sm z-50 print:hidden">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-bold text-sm">돌아가기</span>
        </button>
        <h1 className="text-lg font-bold text-slate-800">종합 공사 보고서</h1>
        <button
          onClick={onPrint}
          className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors font-medium text-sm"
        >
          <Printer size={18} />
          인쇄/PDF 저장
        </button>
      </div>
    </div>
  );
};
