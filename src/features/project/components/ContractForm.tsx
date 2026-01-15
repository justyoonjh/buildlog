import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, FileSignature } from 'lucide-react';
import { StepContract } from './estimate/StepContract';
import apiClient from '@/services/apiClient';

interface ContractFormProps {
  project: any;
  onBack: () => void;
  onComplete: (project: any) => void;
}

export const ContractForm: React.FC<ContractFormProps> = ({ project, onBack, onComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  // Initialize payment terms from project or defaults
  const [formData, setFormData] = useState({
    ...project,
    downPayment: project.downPayment || 0,
    progressPayment: project.progressPayment || 0,
    balancePayment: project.balancePayment || 0,
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCompleteContract = async () => {
    if (!isSigned) {
      alert('계약 내용에 동의해 주세요.');
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        ...formData,
        status: 'contracted' // Move to Construction tab
      };

      const res = await apiClient.put(`/estimates/${project.id}`, payload);
      if (res.data.success) {
        alert('계약이 완료되었습니다! (시공 탭으로 이동)');
        onComplete(res.data.estimate);
      }
    } catch (error) {
      console.error('Contract save failed:', error);
      alert('계약 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-slate-100 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 -ml-1 text-slate-600 active:scale-90 transition-transform">
            <ArrowLeft size={24} />
          </button>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-blue-600">계약서 작성</span>
            <span className="text-lg font-bold text-slate-800">
              표준도급계약서 (전자서명)
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <StepContract
          data={formData}
          onPaymentChange={(field, value) => updateField(field, value)}
          onSignChange={setIsSigned}
        />
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-[60px] left-0 right-0 p-4 bg-white border-t border-slate-100 flex gap-3 z-40">
        <button
          onClick={handleCompleteContract}
          disabled={isLoading || !isSigned}
          className={`
              flex-1 text-white font-bold h-14 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform
              ${isSigned ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300 cursor-not-allowed'}
            `}
        >
          {isLoading ? '처리 중...' : '계약 체결 및 시공 전환'} <FileSignature size={20} />
        </button>
      </div>
    </div>
  );
};
