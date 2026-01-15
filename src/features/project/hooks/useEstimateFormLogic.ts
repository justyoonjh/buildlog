import { useState } from 'react';
import apiClient from '@/services/apiClient';
import { Estimate, EstimateItem } from '@/types';
import toast from 'react-hot-toast';

interface UseEstimateFormLogicProps {
  initialData?: Estimate;
  onComplete: (savedProject?: Estimate) => void;
  onBack: () => void;
}

export const useEstimateFormLogic = ({ initialData, onComplete, onBack }: UseEstimateFormLogicProps) => {
  const TOTAL_STEPS = 3;
  // Infer step: If items exist, maybe default to 2
  const initialStep = initialData && initialData.items && initialData.items.length > 0 ? 2 : 1;
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<Estimate>>({
    id: initialData?.id,
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    clientName: initialData?.clientName || '',
    clientPhone: initialData?.clientPhone || '',
    siteAddress: initialData?.siteAddress || '',
    items: initialData?.items || [],
    vatIncluded: initialData?.vatIncluded || 0,
    memo: initialData?.memo || '',
    modelImage: initialData?.modelImage || '',
    generatedImage: initialData?.generatedImage || '',
    styleDescription: initialData?.styleDescription || '',
    downPayment: initialData?.downPayment || 0,
    progressPayment: initialData?.progressPayment || 0,
    balancePayment: initialData?.balancePayment || 0,
  });

  const updateField = (field: keyof Estimate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
    else onBack();
  };

  const saveEstimate = async (status: string) => {
    if (!formData.clientName) {
      toast.error('고객명을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      const items = formData.items as EstimateItem[] || [];
      const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

      const payload = {
        ...formData,
        totalAmount,
        status: status
      };

      let savedEstimate: Estimate;
      if (initialData?.id) {
        const res = await apiClient.put<{ success: boolean, estimate: Estimate }>(`/estimates/${initialData.id}`, payload);
        savedEstimate = res.data.estimate;
      } else {
        const res = await apiClient.post<{ success: boolean, estimate: Estimate }>('/estimates', payload);
        savedEstimate = res.data.estimate;
      }

      if (status === 'negotiating') {
        toast.success('저장되었습니다. (견적 진행 중)');
        onComplete(savedEstimate);
      } else if (status === 'contract_ready') {
        toast.success('견적이 확정되었습니다. 계약 탭으로 이동합니다.');
        onComplete(savedEstimate);
      }
    } catch (error) {
      console.error('Save failed:', error);
      // toast is usually handled by apiClient interceptor, but we can verify here too if needed.
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNegotiating = async () => {
    await saveEstimate('negotiating');
  };

  const handleCompleteEstimate = async () => {
    if (window.confirm('견적을 완료하고 계약 단계로 이동하시겠습니까?')) {
      await saveEstimate('contract_ready');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    if (!initialData?.id) {
      onBack();
      return;
    }

    try {
      setIsLoading(true);
      await apiClient.delete(`/estimates/${initialData.id}`);
      toast.success('삭제되었습니다.');
      onComplete();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper for step title
  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return '기본 정보 입력';
      case 2: return '견적 품목 작성';
      case 3: return 'AI 시공 모델링';
      default: return '';
    }
  };

  const progress = (currentStep / TOTAL_STEPS) * 100;

  return {
    currentStep,
    TOTAL_STEPS,
    isLoading,
    formData,
    updateField,
    handleNext,
    handlePrev,
    handleSaveNegotiating,
    handleCompleteEstimate,
    handleDelete,
    getStepTitle,
    progress
  };
};
