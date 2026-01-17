import React, { useState } from 'react';
import { authService } from '@/features/auth/services/authService';
import { SignupStepPersonal } from './employee-signup-form/SignupStepPersonal';
import { SignupStepCompany } from './employee-signup-form/SignupStepCompany';
import { SignupSuccess } from './employee-signup-form/SignupSuccess';
import { BusinessInfo } from '@/types';
import toast from 'react-hot-toast';
import { ROLES } from '@/shared/constants/auth';

interface EmployeeSignupFormProps {
  onCancel: () => void;
  onComplete: () => void;
}

type Step = 1 | 2 | 'success';

interface PersonalData {
  email: string;
  pw: string;
  name: string;
  phone: string;
}

export const EmployeeSignupForm: React.FC<EmployeeSignupFormProps> = ({ onCancel, onComplete }) => {
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [personalData, setPersonalData] = useState<PersonalData | null>(null);
  const [finalCompanyName, setFinalCompanyName] = useState('');

  const handlePersonalSubmit = (data: PersonalData) => {
    setPersonalData(data);
    setStep(2);
  };

  const handleCompanySubmit = async (companyData: {
    companyCode: string;
    companyName: string;
    businessInfo: BusinessInfo | undefined;
    department: string;
    position: string;
  }) => {
    if (!personalData) return;

    setIsLoading(true);
    try {
      const newUser = {
        id: personalData.email,
        password: personalData.pw,
        name: personalData.name,
        role: ROLES.EMPLOYEE,
        phone: personalData.phone,
        companyCode: companyData.companyCode,
        companyName: companyData.companyName,
        businessInfo: companyData.businessInfo,
        department: companyData.department,
        position: companyData.position
      };

      const result = await authService.register(newUser);

      if (result.success) {
        setFinalCompanyName(companyData.companyName);
        setStep('success');
      } else {
        toast.error(result.message || '회원가입에 실패했습니다.');
      }
    } catch (err) {
      toast.error('가입 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 relative">

      {/* Progress Bar */}
      {step !== 'success' && (
        <div className="w-full mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-bold text-blue-600">
              {step === 1 ? '1단계 : 개인 인증' : '2단계 : 소속 정보 입력'}
            </span>
            <span className="text-xs text-slate-400">2단계 중 {step}단계</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div className={`h-full w-1/2 ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            <div className={`h-full w-1/2 ${step === 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
          </div>
        </div>
      )}

      {step === 1 && (
        <SignupStepPersonal
          onNext={handlePersonalSubmit}
          onCancel={onCancel}
        />
      )}

      {step === 2 && (
        <SignupStepCompany
          onBack={() => setStep(1)}
          onSubmit={handleCompanySubmit}
          isLoading={isLoading}
        />
      )}

      {step === 'success' && personalData && (
        <SignupSuccess
          companyName={finalCompanyName}
          userName={personalData.name}
          onComplete={onComplete}
        />
      )}
    </div>
  );
};
