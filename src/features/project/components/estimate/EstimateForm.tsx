import React, { useState } from 'react';
import { ArrowLeft, Save, ChevronRight, Check, Trash2, CheckCircle } from 'lucide-react';
import { StepBasicInfo } from './StepBasicInfo';
import { StepItems } from './StepItems';
import { StepModel } from './StepModel';
import apiClient from '@/services/apiClient';

interface EstimateFormProps {
  onBack: () => void;
  onComplete: (savedProject?: any) => void;
  initialData?: any;
}

export const EstimateForm: React.FC<EstimateFormProps> = ({ onBack, onComplete, initialData }) => {
  // Infer step: If items exist, maybe default to 2? For now let's keep it simple.
  const initialStep = initialData && initialData.items && initialData.items.length > 0 ? 2 : 1;

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Basic Info
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    clientName: initialData?.clientName || '',
    clientPhone: initialData?.clientPhone || '',
    siteAddress: initialData?.siteAddress || '',
    // Items
    items: initialData?.items || [],
    vatIncluded: initialData?.vatIncluded || false,
    memo: initialData?.memo || '',
    // AI Model (Step 3)
    modelImage: initialData?.modelImage || null,
    generatedImage: initialData?.generatedImage || null,
    styleDescription: initialData?.styleDescription || '',
    // Payment Terms (Step 4) - keeping for data consistency but might not use in form anymore
    downPayment: initialData?.downPayment || 0,
    progressPayment: initialData?.progressPayment || 0,
    balancePayment: initialData?.balancePayment || 0,
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Phase 2: Total steps is now 3 (Contract moved to separate tab).
  const TOTAL_STEPS = 3;

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
    else onBack();
  };

  const handleSaveNegotiating = async () => {
    await saveEstimate('negotiating');
  };

  const handleCompleteEstimate = async () => {
    // Moves to Contract Tab
    if (window.confirm('견적을 완료하고 계약 단계로 이동하시겠습니까?')) {
      await saveEstimate('contract_ready');
    }
  };

  const saveEstimate = async (status: string) => {
    if (!formData.clientName) {
      alert('고객명을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        ...formData,
        totalAmount: formData.items.reduce((sum: number, item: any) => sum + item.amount, 0),
        status: status
      };

      let savedEstimate;
      if (initialData?.id) {
        const res = await apiClient.put(`/estimates/${initialData.id}`, payload);
        savedEstimate = res.data.estimate;
      } else {
        const res = await apiClient.post('/estimates', payload);
        savedEstimate = res.data.estimate;
      }

      if (status === 'negotiating') {
        alert('저장되었습니다. (견적 진행 중)');
        onComplete(savedEstimate);
      } else if (status === 'contract_ready') {
        alert('견적이 확정되었습니다. 계약 탭으로 이동합니다.');
        onComplete(savedEstimate);
      }
    } catch (error: any) {
      console.error('Save failed:', error);
      const msg = error.response?.data?.message || '저장에 실패했습니다.';
      alert(`오류가 발생했습니다: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    // If it's a new estimate (not saved yet), just go back
    if (!initialData?.id) {
      onBack();
      return;
    }

    try {
      setIsLoading(true);
      await apiClient.delete(`/estimates/${initialData.id}`);
      alert('삭제되었습니다.');
      onComplete(); // Refresh list and go back
    } catch (error) {
      console.error('Delete failed:', error);
      alert('삭제에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate Progress
  const progress = (currentStep / TOTAL_STEPS) * 100;

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return '기본 정보 입력';
      case 2: return '견적 품목 작성';
      case 3: return 'AI 시공 모델링';
      default: return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Top Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-slate-100 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={handlePrev} className="p-1 -ml-1 text-slate-600 active:scale-90 transition-transform">
            <ArrowLeft size={24} />
          </button>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-blue-600">Step {currentStep}/{TOTAL_STEPS}</span>
            <span className="text-lg font-bold text-slate-800">
              {getStepTitle()}
            </span>
          </div>
        </div>

        {/* Actions (Delete & Save) */}
        <div className="flex gap-2">
          <button onClick={handleDelete} className="text-slate-400 hover:text-red-500 p-2 rounded-full">
            <Trash2 size={24} />
          </button>
          <button onClick={handleSaveNegotiating} className="text-slate-500 hover:text-blue-600 p-2 rounded-full">
            <Save size={24} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-100 w-full">
        <div
          className="h-full bg-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-48">
        {currentStep === 1 && (
          <StepBasicInfo
            data={formData}
            onChange={updateField}
          />
        )}
        {currentStep === 2 && (
          <StepItems
            items={formData.items}
            onItemsChange={(items) => updateField('items', items)}
            vatIncluded={formData.vatIncluded}
            onVatChange={(val) => updateField('vatIncluded', val)}
          />
        )}
        {currentStep === 3 && (
          <StepModel
            modelImage={formData.modelImage}
            generatedImage={formData.generatedImage}
            styleDescription={formData.styleDescription}
            onImageChange={(url) => updateField('modelImage', url)}
            onGeneratedImageChange={(url) => updateField('generatedImage', url)}
            onStyleChange={(desc) => updateField('styleDescription', desc)}
          />
        )}
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="fixed bottom-[60px] left-0 right-0 p-4 bg-white border-t border-slate-100 flex gap-3 z-40">
        {currentStep < TOTAL_STEPS ? (
          <button
            onClick={handleNext}
            className="flex-1 bg-slate-900 text-white font-bold h-14 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            다음 단계 <ChevronRight size={20} />
          </button>
        ) : (
          <button
            onClick={handleCompleteEstimate}
            disabled={isLoading}
            className={`
              flex-1 text-white font-bold h-14 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform
              bg-blue-600 hover:bg-blue-700
            `}
          >
            {isLoading ? '저장 중...' : '견적 완료 (계약 진행)'} <CheckCircle size={20} />
          </button>
        )}
      </div>
    </div>
  );
};
