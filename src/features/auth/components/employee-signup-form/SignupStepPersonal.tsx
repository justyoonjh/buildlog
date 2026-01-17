import React, { useState, useEffect } from 'react';
import { Check, User, Phone, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { analyzePassword, PasswordStrength } from '@/shared/utils/security';
import { authService } from '@/features/auth/services/authService';

interface SignupStepPersonalProps {
  onNext: (data: {
    email: string;
    pw: string;
    name: string;
    phone: string;
  }) => void;
  onCancel: () => void;
}

export const SignupStepPersonal: React.FC<SignupStepPersonalProps> = ({ onNext, onCancel }) => {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [pwStrength, setPwStrength] = useState<PasswordStrength>('invalid');
  const [isPwTouched, setIsPwTouched] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  useEffect(() => {
    if (pw) {
      setPwStrength(analyzePassword(pw, email));
    }
  }, [pw, email]);

  const handleDuplicateCheck = async () => {
    if (!email) {
      setErrorToast('이메일을 입력해주세요.');
      return;
    }
    setIsCheckingDuplicate(true);
    try {
      const user = await authService.findUserById(email);
      if (user) {
        setErrorToast('이미 사용 중인 아이디입니다.');
        setIsEmailChecked(false);
      } else {
        setErrorToast(null); // Clear error if success
        alert('사용 가능한 아이디입니다.'); // Simple alert for success or use a passed toast handler
        setIsEmailChecked(true);
      }
    } catch (err) {
      setErrorToast('중복 확인 중 오류가 발생했습니다.');
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailChecked) {
      setErrorToast('아이디 중복 확인을 해주세요.');
      return;
    }
    if (pwStrength === 'invalid') {
      setErrorToast('비밀번호 보안 등급이 낮습니다.');
      return;
    }
    if (pw !== pwConfirm) {
      setErrorToast('비밀번호가 일치하지 않습니다.');
      return;
    }
    onNext({ email, pw, name, phone });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorToast && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {errorToast}
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">아이디 (이메일)</label>
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <Input
              id="emp-signup-email"
              label=""
              type="email"
              placeholder="example@company.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setIsEmailChecked(false); }}
              required
              className="mt-0 h-[42px]"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            isLoading={isCheckingDuplicate}
            className="h-[42px] whitespace-nowrap shrink-0 relative z-10 min-w-[80px]"
            onClick={handleDuplicateCheck}
            disabled={isEmailChecked || isCheckingDuplicate}
          >
            {isEmailChecked ? <Check className="h-4 w-4" /> : '중복 확인'}
          </Button>
        </div>
      </div>
      <div>
        <Input
          id="emp-signup-pw"
          label="비밀번호"
          type="password"
          placeholder="영문, 숫자, 특수문자 포함 10자 이상"
          value={pw}
          onChange={(e) => { setPw(e.target.value); setIsPwTouched(true); }}
          required
          className={isPwTouched && pwStrength === 'invalid' ? 'border-red-300' : isPwTouched && pwStrength === 'safe' ? 'border-green-300' : ''}
        />
        {isPwTouched && (
          <div className="mt-1 flex items-center gap-2 text-xs">
            {pwStrength === 'invalid' && <span className="text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> 보안 취약</span>}
            {pwStrength === 'normal' && <span className="text-yellow-600 flex items-center gap-1"><Check className="h-3 w-3" /> 적정 수준</span>}
            {pwStrength === 'safe' && <span className="text-green-600 flex items-center gap-1"><Check className="h-3 w-3" /> 안전함</span>}
          </div>
        )}
      </div>
      <Input
        id="emp-signup-pw-confirm"
        label="비밀번호 확인"
        type="password"
        value={pwConfirm}
        onChange={(e) => setPwConfirm(e.target.value)}
        required
        icon={<Check size={18} />}
      />
      <Input
        id="emp-signup-name"
        label="이름"
        placeholder="홍길동"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        icon={<User size={18} />}
      />
      <Input
        id="emp-signup-phone"
        label="휴대폰 번호"
        placeholder="010-0000-0000"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
        icon={<Phone size={18} />}
      />

      <div className="pt-4 flex gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">취소</Button>
        <Button type="submit" className="flex-[2]">다음 단계</Button>
      </div>
    </form>
  );
};
