
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, AlertCircle, ShieldCheck, ShieldAlert, Building2, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { analyzePassword, hashPassword, PasswordStrength, logSystemError } from '../utils/security';

interface EmployeeSignupFormProps {
  onCancel: () => void;
  onComplete: () => void;
}

interface ToastMessage {
  msg: string;
  type: 'success' | 'warning' | 'error';
}

export const EmployeeSignupForm: React.FC<EmployeeSignupFormProps> = ({ onCancel, onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 'success'>(1);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Step 1 State
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPw, setSignupPw] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupName, setSignupName] = useState('');
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [pwStrength, setPwStrength] = useState<PasswordStrength>('invalid');
  const [isPwTouched, setIsPwTouched] = useState(false);

  // Step 2 State
  const [inputCompanyCode, setInputCompanyCode] = useState('');

  // Temp Data
  const [tempRegData, setTempRegData] = useState<any>({});

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (signupPw) {
      setPwStrength(analyzePassword(signupPw, signupEmail));
    }
  }, [signupPw, signupEmail]);

  // --- Handlers ---

  const handleDuplicateCheck = () => {
    setIsCheckingDuplicate(true);
    const trimmedEmail = signupEmail.trim().toLowerCase();
    
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setToast({ msg: '유효한 이메일 형식이 아닙니다.', type: 'warning' });
      setIsCheckingDuplicate(false);
      return;
    }
    
    try {
      const storedUsersJSON = localStorage.getItem('demo_users');
      if (storedUsersJSON) {
        const users = JSON.parse(storedUsersJSON);
        if (users[trimmedEmail]) {
          setToast({ msg: '이미 사용 중인 아이디입니다.', type: 'error' });
          setIsCheckingDuplicate(false);
          return;
        }
      }
    } catch (e: any) {
      logSystemError('Error A', `Storage access failed: ${e.message}`);
    }

    setTimeout(() => {
      setToast({ msg: '사용 가능한 아이디(이메일)입니다.', type: 'success' });
      setIsEmailChecked(true);
      setIsCheckingDuplicate(false);
    }, 500);
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailChecked) {
      setToast({ msg: '아이디 중복 확인을 진행해주세요.', type: 'warning' });
      return;
    }
    if (pwStrength === 'invalid') {
      setToast({ msg: '비밀번호 보안 규칙을 준수해주세요.', type: 'warning' });
      return;
    }
    
    try {
      const { hash, salt } = await hashPassword(signupPw);
      const trimmedEmail = signupEmail.trim().toLowerCase();
      
      setTempRegData({
        email: trimmedEmail,
        passwordHash: hash,
        passwordSalt: salt,
        name: signupName,
        phone: signupPhone,
        role: 'user'
      });
      
      setStep(2);
    } catch (err: any) {
      logSystemError('Error B', `Employee Step 1 Failed: ${err.message}`);
      setToast({ msg: '시스템 오류가 발생했습니다. (Error B)', type: 'error' });
    }
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCompanyCode) {
      setToast({ msg: '업체 코드를 입력해주세요.', type: 'warning' });
      return;
    }

    // 1. Verify Company Code
    let matchedBoss: any = null;
    try {
      const storedUsersJSON = localStorage.getItem('demo_users');
      if (storedUsersJSON) {
        const users = JSON.parse(storedUsersJSON);
        for (const key of Object.keys(users)) {
          const u = users[key];
          if (u.role === 'admin' && u.companyCode === inputCompanyCode) {
            matchedBoss = u;
            break;
          }
        }
      }
    } catch (err: any) {
      logSystemError('Error C', `Storage Access Error: ${err.message}`);
    }

    if (!matchedBoss) {
      setToast({ msg: '유효하지 않은 업체 코드입니다.', type: 'error' });
      return;
    }

    // 2. Save
    const finalData = {
      ...tempRegData,
      role: 'user',
      companyCode: inputCompanyCode,
      businessInfo: matchedBoss.businessInfo
    };

    try {
      const storedUsersJSON = localStorage.getItem('demo_users');
      const users = storedUsersJSON ? JSON.parse(storedUsersJSON) : {};
      users[finalData.email] = finalData;
      localStorage.setItem('demo_users', JSON.stringify(users));
      setStep('success');
    } catch (err: any) {
      logSystemError('Error C', `Employee Final Submit Failed: ${err.message}`);
      setToast({ msg: '가입 처리 중 오류가 발생했습니다.', type: 'error' });
    }
  };

  // --- Render ---

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      {toast && (
        <div className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 px-5 py-3 rounded-full shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
            toast.type === 'error' ? 'bg-red-600 text-white' : 
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
                <div className={`h-full w-1/2 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
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
                    <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs">
                        {pwStrength === 'invalid' && <span className="text-red-500 font-medium">사용 불가</span>}
                        {pwStrength === 'normal' && <span className="text-yellow-600 font-medium">보통</span>}
                        {pwStrength === 'safe' && <span className="text-green-600 font-medium">안전</span>}
                    </div>
                    </div>
                )}
            </div>
            <Input id="emp-signup-name" label="이름" type="text" placeholder="실명 입력" value={signupName} onChange={(e) => setSignupName(e.target.value)} required />
            <div className="pt-2">
                <div className="flex gap-2 items-end">
                    <div className="flex-1">
                    <Input id="emp-signup-phone" label="휴대폰 본인 인증" type="tel" placeholder="010-0000-0000" value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)} required />
                    </div>
                    <Button type="button" variant="outline" className="h-[42px] mb-[1px] whitespace-nowrap text-slate-600" onClick={() => setToast({ msg: '인증번호 발송 (데모)', type: 'success' })}>인증 요청</Button>
                </div>
            </div>
            <div className="pt-4"><Button type="submit" fullWidth className="h-12 text-lg">다음 단계</Button></div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStep2Submit} className="space-y-6">
            <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                   <Building2 className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
                   <div className="text-sm text-blue-800">
                     <p className="font-bold mb-1">업체 코드 안내</p>
                     <p className="opacity-90 leading-relaxed">사장님에게 공유 받은 10자리 영문/숫자 코드를 입력해주세요.</p>
                   </div>
                </div>
                <Input id="company-code" label="업체 코드" placeholder="예: x7b3z9..." value={inputCompanyCode} onChange={(e) => setInputCompanyCode(e.target.value.toLowerCase())} required className="font-mono tracking-wider" />
            </div>
            <div className="pt-4"><Button type="submit" fullWidth className="h-12 text-lg">가입 완료</Button></div>
        </form>
      )}

      {step === 'success' && (
        <div className="space-y-8 text-center">
            <div className="flex justify-center"><div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center"><CheckCircle2 className="h-10 w-10 text-green-600" /></div></div>
            <div className="space-y-2"><h3 className="text-2xl font-bold text-slate-900">가입 완료!</h3><p className="text-slate-500">직원 등록이 성공적으로 처리되었습니다.</p></div>
            <div className="bg-slate-50 p-4 rounded text-sm text-slate-600">로그인 화면으로 이동하여<br/>아이디와 비밀번호로 접속해주세요.</div>
            <div className="pt-4"><Button fullWidth className="h-12 text-lg" onClick={onComplete}>로그인 하러 가기</Button></div>
        </div>
      )}

      {step !== 'success' && (
        <div className="flex justify-center pt-2">
            <button type="button" onClick={() => step === 1 ? onCancel() : setStep(1)} className="flex items-center text-sm text-slate-500 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4 mr-1" /> {step === 1 ? '이전으로 돌아가기' : '이전 단계로 돌아가기'}
            </button>
        </div>
      )}
    </div>
  );
};
