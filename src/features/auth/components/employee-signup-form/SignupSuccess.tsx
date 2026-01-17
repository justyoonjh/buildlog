import React from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

interface SignupSuccessProps {
  companyName: string;
  userName: string;
  onComplete: () => void;
}

export const SignupSuccess: React.FC<SignupSuccessProps> = ({ companyName, userName, onComplete }) => {
  return (
    <div className="text-center py-8 animate-in zoom-in duration-300">
      <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Lock className="h-10 w-10 text-yellow-600" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-4 px-4 leading-relaxed">
        [{companyName}] (으) 로 가입요청하신<br />
        [{userName}] 님의 가입 상태는<br />
        <span className="text-yellow-600">"승인 대기"</span> 상태입니다.
      </h3>
      <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 mb-8 mx-2 border border-slate-100">
        선택하신 회사의 가입승인 담당자가<br />
        회원님의 정보를 확인 후 승인할 예정입니다.
      </div>
      <Button fullWidth onClick={onComplete}>로그인 화면으로 이동</Button>
    </div>
  );
};
