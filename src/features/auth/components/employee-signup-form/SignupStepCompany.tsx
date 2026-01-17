import React, { useState } from 'react';
import { Building2, User } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { authService } from '@/features/auth/services/authService';
import { BusinessInfo } from '@/types';

interface SignupStepCompanyProps {
  onBack: () => void;
  onSubmit: (data: {
    companyCode: string;
    companyName: string;
    businessInfo: BusinessInfo | undefined;
    department: string;
    position: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export const SignupStepCompany: React.FC<SignupStepCompanyProps> = ({ onBack, onSubmit, isLoading }) => {
  const [inputCompanyCode, setInputCompanyCode] = useState('');
  const [matchedBoss, setMatchedBoss] = useState<any>(null);
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');

  const [isVerifying, setIsVerifying] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const handleVerifyCode = async () => {
    if (!inputCompanyCode) {
      setErrorToast('업체 코드를 입력해주세요.');
      return;
    }
    setIsVerifying(true);
    setErrorToast(null);
    try {
      const boss = await authService.findBossByCompanyCode(inputCompanyCode);
      if (boss) {
        setMatchedBoss(boss);
      } else {
        setMatchedBoss(null);
        setErrorToast('유효하지 않은 업체 코드입니다.');
      }
    } catch (e) {
      setErrorToast('확인 중 오류가 발생했습니다.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedBoss) return;

    await onSubmit({
      companyCode: inputCompanyCode,
      companyName: matchedBoss.companyName || matchedBoss.businessInfo?.s_nm || '알 수 없는 업체',
      businessInfo: matchedBoss.businessInfo,
      department,
      position
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorToast && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
          {errorToast}
        </div>
      )}

      {/* Company Code Section */}
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h4 className="font-bold text-slate-800">소속 업체 확인</h4>
        </div>

        <div className="flex gap-2 mb-2">
          <Input
            id="company-code"
            label=""
            placeholder="업체 코드 10자리"
            value={inputCompanyCode}
            onChange={(e) => {
              setInputCompanyCode(e.target.value.toLowerCase());
              setMatchedBoss(null);
            }}
            required
            className="flex-1 tracking-widest font-mono lowercase"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleVerifyCode}
            className="whitespace-nowrap min-w-[80px]"
            isLoading={isVerifying}
          >
            인증
          </Button>
        </div>

        {matchedBoss && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Building2 size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">
                {matchedBoss.companyName || matchedBoss.businessInfo?.s_nm || '알 수 없는 업체'}
              </p>
              <p className="text-xs text-slate-500">
                대표: {matchedBoss.businessInfo?.p_nm || '미등록'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Job Details Section */}
      <div className="space-y-4">
        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <User className="w-4 h-4" /> 직무 정보 입력 (선택)
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="dept"
            label="부서"
            placeholder="예: 공무팀"
            value={department}
            onChange={e => setDepartment(e.target.value)}
          />
          <Input
            id="position"
            label="직급/직책"
            placeholder="예: 대리"
            value={position}
            onChange={e => setPosition(e.target.value)}
          />
        </div>
      </div>

      <div className="pt-4 flex gap-3">
        <Button type="button" variant="secondary" onClick={onBack} className="flex-1">이전</Button>
        <Button type="submit" isLoading={isLoading} disabled={!matchedBoss} className="flex-[2]">가입 요청</Button>
      </div>
    </form>
  );
};
