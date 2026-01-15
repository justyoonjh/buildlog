import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

interface SignupSelectionViewProps {
  onSelectBoss: () => void;
  onSelectEmployee: () => void;
  onBack: () => void;
}

export const SignupSelectionView: React.FC<SignupSelectionViewProps> = ({ onSelectBoss, onSelectEmployee, onBack }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-6 pt-2">
        <Button
          fullWidth
          className="h-14 text-lg font-bold bg-slate-800 hover:bg-slate-900 shadow-lg border-none"
          onClick={onSelectBoss}
        >
          사장으로 가입
        </Button>
        <div className="text-center space-y-1 py-2">
          <p className="text-sm font-medium text-slate-500">더 나은 업체 운영,</p>
          <p className="text-sm font-medium text-slate-500">효율적인 업무 분배</p>
        </div>
        <Button
          fullWidth
          className="h-14 text-lg font-bold shadow-lg"
          onClick={onSelectEmployee}
        >
          직원으로 가입
        </Button>
      </div>
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> 로그인 화면으로 돌아가기
        </button>
      </div>
    </div>
  );
};
