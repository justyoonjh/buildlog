import React, { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, FileText, CheckCircle } from 'lucide-react';
import { StepContract } from './estimate/StepContract';
import { StepItems } from './estimate/StepItems';
// Reuse StepItems but we need to ensure it can be read-only if possible, 
// OR we just create a simple read-only list here since StepItems might be editable.
// For now, let's just use StepContract as the main "Document" view since it contains the summary.

interface EstimatePreviewProps {
  project: any;
  onBack: () => void;
}

export const EstimatePreview: React.FC<EstimatePreviewProps> = ({ project, onBack }) => {
  const [viewMode, setViewMode] = useState<'contract' | 'items'>('contract');

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-slate-100 sticky top-0 z-20">
        <button onClick={onBack} className="p-1 -ml-1 text-slate-600 active:scale-90 transition-transform">
          <ArrowLeft size={24} />
        </button>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500">견적서 미리보기</span>
          <span className="text-lg font-bold text-slate-800 truncate pr-4">
            {project.siteAddress}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-slate-100">
        <button
          onClick={() => setViewMode('contract')}
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${viewMode === 'contract' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
        >
          계약서
        </button>
        <button
          onClick={() => setViewMode('items')}
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${viewMode === 'items' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
        >
          견적 품목
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === 'contract' ? (
          <StepContract
            data={project}
            onSignChange={() => { }} // Read only
          />
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-bold text-slate-800 mb-4">견적 품목 상세</h3>
              <div className="space-y-2">
                {project.items && project.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between py-2 border-b border-slate-50 last:border-0">
                    <div>
                      <div className="font-bold text-slate-700">{item.name}</div>
                      <div className="text-xs text-slate-400">{item.spec}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-800">{item.amount.toLocaleString()}원</div>
                      <div className="text-xs text-slate-400">{item.unit} {item.quantity}개</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between font-bold text-lg">
                <span>총 합계</span>
                <span className="text-blue-600">{project.totalAmount.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
