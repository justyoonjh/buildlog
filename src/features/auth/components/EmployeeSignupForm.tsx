import React, { useState } from 'react';
import { ArrowLeft, Check, Building2, User, Lock, Phone, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { hashPassword, analyzePassword, PasswordStrength } from '@/utils/security';
import { authService } from '@/features/auth/services/authService';

interface EmployeeSignupFormProps {
  onCancel: () => void;
  onComplete: () => void;
}

type Step = 1 | 2 | 'success';

export const EmployeeSignupForm: React.FC<EmployeeSignupFormProps> = ({ onCancel, onComplete }) => {
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'error' | 'success' | 'warning' } | null>(null);

  // Step 1: Personal Info
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPw, setSignupPw] = useState('');
  const [signupPwConfirm, setSignupPwConfirm] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');

  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [pwStrength, setPwStrength] = useState<PasswordStrength>('invalid');
  const [isPwTouched, setIsPwTouched] = useState(false);

  // Step 2: Company Code
  const [inputCompanyCode, setInputCompanyCode] = useState('');
  const [matchedBoss, setMatchedBoss] = useState<any>(null);

  // Password Analysis
  React.useEffect(() => {
    if (signupPw) {
      setPwStrength(analyzePassword(signupPw, signupEmail));
    }
  }, [signupPw, signupEmail]);

  // Toast Timer
  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleDuplicateCheck = async () => {
    if (!signupEmail) {
      setToast({ msg: '이메일을 입력해주세요.', type: 'warning' });
      return;
    }
    setIsCheckingDuplicate(true);
    try {
      const user = await authService.findUserById(signupEmail);
      if (user) {
        setToast({ msg: '이미 사용 중인 아이디입니다.', type: 'error' });
        setIsEmailChecked(false);
      } else {
        setToast({ msg: '사용 가능한 아이디입니다.', type: 'success' });
        setIsEmailChecked(true);
      }
    } catch (err) {
      setToast({ msg: '중복 확인 중 오류가 발생했습니다.', type: 'error' });
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailChecked) {
      setToast({ msg: '아이디 중복 확인을 해주세요.', type: 'warning' });
      return;
    }
    if (pwStrength === 'invalid') {
      setToast({ msg: '비밀번호 보안 등급이 낮습니다.', type: 'warning' });
      return;
    }
    if (signupPw !== signupPwConfirm) {
      setToast({ msg: '비밀번호가 일치하지 않습니다.', type: 'warning' });
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCompanyCode) {
      setToast({ msg: '업체 코드를 입력해주세요.', type: 'warning' });
      return;
    }

    setIsLoading(true);
    try {
      // 1. Verify Company Code
      const boss = await authService.findBossByCompanyCode(inputCompanyCode);

      if (!boss) {
        setToast({ msg: '유효하지 않은 업체 코드입니다.', type: 'error' });
        setIsLoading(false);
        return;
      }

      // 2. Register
      // const { hash, salt } = await hashPassword(signupPw); // Moved to server

      const newUser = {
        id: signupEmail,
        password: signupPw, // Send plain password
        name: signupName,
        role: 'employee' as const,
        companyCode: inputCompanyCode,
        companyName: boss.companyName || boss.businessInfo?.s_nm || '알 수 없는 업체', // Fallback to business info
        phone: signupPhone,
        // passwordHash: hash, // Removed
        // passwordSalt: salt, // Removed
        businessInfo: boss.businessInfo, // Link to boss's business info
        // createdAt: Date.now() // Server handles this
      };

      const success = await authService.register(newUser);

      if (success) {
        setStep('success');
      } else {
        setToast({ msg: '회원가입에 실패했습니다.', type: 'error' });
      }
    } catch (err: any) {
      setToast({ msg: '가입 처리 중 오류가 발생했습니다.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 relative">
      {toast && (
        <div className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 px-5 py-3 rounded-full shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${toast.type === 'error' ? 'bg-red-600 text-white' :
          toast.type === 'success' ? 'bg-green-600 text-white' :
            'bg-zinc-800 text-white'
          }`}>
          {toast.type === 'error' && <XCircle className="h-5 w-5" />}
          {toast.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-300" />}
          {toast.type === 'success' && <CheckCircle2 className="h-5 w-5" />}
          <span className="text-sm font-medium">{toast.msg}</span>
        </div>
      )}

      {step !== 'success' && (
        <div className="w-full mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-bold text-blue-600">
              {step === 1 ? '1단계 : 개인 인증' : '2단계 : 업체 코드 입력'}
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
        <form onSubmit={handleStep1Submit} className="space-y-5">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">아이디 (이메일)</label>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <Input id="emp-signup-email" label="" type="email" placeholder="example@company.com" value={signupEmail} onChange={(e) => { setSignupEmail(e.target.value); setIsEmailChecked(false); }} required className="mt-0 h-[42px]" />
              </div>
              <Button type="button" variant="secondary" isLoading={isCheckingDuplicate} className="h-[42px] whitespace-nowrap shrink-0 relative z-10 min-w-[80px]" onClick={handleDuplicateCheck} disabled={isEmailChecked || isCheckingDuplicate}>
                {isEmailChecked ? <Check className="h-4 w-4" /> : '중복 확인'}
              </Button>
            </div>
          </div>
          <div>
            <Input id="emp-signup-pw" label="비밀번호" type="password" placeholder="영문, 숫자, 특수문자 포함 10자 이상" value={signupPw} onChange={(e) => { setSignupPw(e.target.value); setIsPwTouched(true); }} required className={isPwTouched && pwStrength === 'invalid' ? 'border-red-300' : isPwTouched && pwStrength === 'safe' ? 'border-green-300' : ''} />
            {isPwTouched && (
              <div className="mt-1 flex items-center gap-2 text-xs">
                {pwStrength === 'invalid' && <span className="text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> 보안 취약</span>}
                {pwStrength === 'normal' && <span className="text-yellow-600 flex items-center gap-1"><Check className="h-3 w-3" /> 적정 수준</span>}
                {pwStrength === 'safe' && <span className="text-green-600 flex items-center gap-1"><Check className="h-3 w-3" /> 안전함</span>}
              </div>
            )}
          </div>
          <Input id="emp-signup-pw-confirm" label="비밀번호 확인" type="password" value={signupPwConfirm} onChange={(e) => setSignupPwConfirm(e.target.value)} required icon={<Check size={18} />} />
          <Input id="emp-signup-name" label="이름" placeholder="홍길동" value={signupName} onChange={(e) => setSignupName(e.target.value)} required icon={<User size={18} />} />
          <Input id="emp-signup-phone" label="휴대폰 번호" placeholder="010-0000-0000" value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)} required icon={<Phone size={18} />} />

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">취소</Button>
            <Button type="submit" className="flex-[2]">다음 단계</Button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStep2Submit} className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
            <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <h4 className="font-bold text-slate-900 mb-1">업체 코드 입력</h4>
            <p className="text-sm text-slate-500 mb-6">
              소속된 업체의 관리자에게 전달받은<br />
              10자리 코드를 입력해주세요.
            </p>
            <Input
              id="company-code"
              label=""
              placeholder="code12345"
              value={inputCompanyCode}
              onChange={(e) => setInputCompanyCode(e.target.value.toLowerCase())}
              required
              className="text-center text-lg tracking-widest font-mono lowercase"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1">이전</Button>
            <Button type="submit" isLoading={isLoading} className="flex-[2]">가입 완료</Button>
          </div>
        </form>
      )}

      {step === 'success' && (
        <div className="text-center py-10 animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">회원가입 완료!</h3>
          <p className="text-slate-500 mb-8">
            이제 로그인하여 현장 업무를<br />
            시작해보세요.
          </p>
          <Button fullWidth onClick={onComplete}>로그인 화면으로 이동</Button>
        </div>
      )}
    </div>
  );
};
