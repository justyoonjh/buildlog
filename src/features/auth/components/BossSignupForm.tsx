import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Check, AlertCircle, ShieldCheck, ShieldAlert, Upload, Camera, FileText, Loader2, MapPin, Search, X, CheckCircle2, Copy, AlertTriangle, XCircle, User, Lock, Phone, Building2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { analyzePassword, PasswordStrength, logSystemError, generateCompanyCode } from '@/shared/utils/security';
import { extractBusinessInfo, validateBusinessWithNTS } from '@/features/auth/utils/businessCert';
import { validateImageMiddleware } from '@/shared/utils/imageSecurity';
import { searchAddress, Juso } from '@/shared/services/addressApi';
import { authService } from '@/features/auth/services/authService';

import { toast } from 'react-hot-toast';

interface BossSignupFormProps {
  onCancel: () => void;
  onComplete: () => void;
}

type Step = 1 | 2 | 3 | 'success';

export const BossSignupForm: React.FC<BossSignupFormProps> = ({ onCancel, onComplete }) => {
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);

  // --- Step 1: Account (Personal Info) ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pwStrength, setPwStrength] = useState<PasswordStrength>('invalid');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [phone, setPhone] = useState('');
  const [isPwTouched, setIsPwTouched] = useState(false);

  // --- Step 2: Business Cert (OCR) ---
  const [businessNumber, setBusinessNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [openDate, setOpenDate] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrImage, setOcrImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Step 3: Address ---
  const [zipCode, setZipCode] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [addressList, setAddressList] = useState<Juso[]>([]);
  const [isSearchingAddr, setIsSearchingAddr] = useState(false);

  // --- Success ---
  const [createdCompanyCode, setCreatedCompanyCode] = useState('');

  // Password Analysis
  useEffect(() => {
    if (password) {
      setPwStrength(analyzePassword(password, email));
    }
  }, [password, email]);

  // --- Handlers: Step 1 (Account) ---
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (pwStrength === 'invalid') {
      toast.error('비밀번호 보안 등급이 낮습니다.');
      return;
    }
    if (password !== passwordConfirm) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }
    // Proceed to Step 2
    setStep(2);
  };

  // --- Handlers: Step 2 (OCR & Business) ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Image Security Check
    const securityCheck = await validateImageMiddleware(file);
    if (!securityCheck.valid) {
      toast.error(securityCheck.error || '이미지 보안 검사에 실패했습니다.');
      return;
    }
    if (securityCheck.warning) {
      toast.error(securityCheck.warning);
    }

    // 2. OCR Process
    setIsOcrProcessing(true);
    setOcrImage(URL.createObjectURL(file));

    try {
      const info = await extractBusinessInfo(file);
      if (info) {
        setBusinessNumber(info.b_no || '');
        setOwnerName(info.c_nm || '');
        setOpenDate(info.start_dt || '');
        setCompanyName(info.s_nm || '');
        toast.success('사업자 정보가 인식되었습니다. 내용을 확인해주세요.');
      } else {
        toast.error('정보를 인식하지 못했습니다. 직접 입력해주세요.');
      }
    } catch (err: any) {
      console.error(err);

      toast.error('OCR 분석 중 오류가 발생했습니다.');
    } finally {
      setIsOcrProcessing(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessNumber || !ownerName || !openDate) {
      toast.error('필수 사업자 정보를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const isValid = await validateBusinessWithNTS(businessNumber, openDate, ownerName);
      if (isValid) {
        setStep(3);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Handlers: Step 3 (Address & Final Submit) ---
  const handleAddressSearch = async () => {
    if (!searchKeyword.trim()) return;
    setIsSearchingAddr(true);
    try {
      const results = await searchAddress(searchKeyword);
      setAddressList(results);
    } catch (err) {
      toast.error('주소 검색에 실패했습니다.');
    } finally {
      setIsSearchingAddr(false);
    }
  };

  const handleAddressSelect = (juso: Juso) => {
    setZipCode(juso.zipNo);
    setAddress(juso.roadAddr);
    setAddressList([]);
    setSearchKeyword('');
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipCode || !address || !detailAddress) {
      toast.error('주소 정보를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // const { hash, salt } = await hashPassword(password); // Moved to server
      const newCompanyCode = generateCompanyCode();

      const result = await authService.register({
        id: email,
        password: password, // Send plain password to server
        name: ownerName,
        role: 'boss',
        companyName,
        companyCode: newCompanyCode,
        businessNumber,
        phone,
        businessInfo: {
          b_no: businessNumber,
          c_nm: ownerName,
          s_nm: companyName, // Include Company Name in Business Info
          start_dt: openDate,
          p_nm: ownerName,
        },
        address: {
          zipCode,
          address,
          detailAddress
        },
      });

      if (result.success) {
        setCreatedCompanyCode(result.companyCode || '');
        toast.success('회원가입이 완료되었습니다. 로그인해주세요.');
        onComplete();
      } else {
        toast.error(result.message || '회원가입에 실패했습니다.');
      }
    } catch (err: any) {
      logSystemError('Error C', `Final Submit Failed: ${err.message} `);
      toast.error('회원가입 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render ---
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 relative">
      {/* Progress Bar */}
      {step !== 'success' && (
        <div className="w-full mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-bold text-blue-600">
              {step === 1 ? '1단계 : 계정 생성' : step === 2 ? '2단계 : 사업자 인증' : '3단계 : 현장 주소'}
            </span>
            <span className="text-xs text-slate-400">3단계 중 {step}단계</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div className={`h-full w-1/3 ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            <div className={`h-full w-1/3 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            <div className={`h-full w-1/3 ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
          </div>
        </div>
      )}

      {/* STEP 1: Account (Personal Info) */}
      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="space-y-5">
          <div>
            <Input id="email" label="아이디 (이메일)" type="email" placeholder="example@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required icon={<User size={18} />} />
          </div>
          <div>
            <Input id="pw" label="비밀번호" type="password" placeholder="영문, 숫자, 특수문자 포함 10자 이상" value={password} onChange={(e) => { setPassword(e.target.value); setIsPwTouched(true); }} required icon={<Lock size={18} />} className={isPwTouched && pwStrength === 'invalid' ? 'border-red-300' : isPwTouched && pwStrength === 'safe' ? 'border-green-300' : ''} />
            {isPwTouched && (
              <div className="mt-1 flex items-center gap-2 text-xs">
                {pwStrength === 'invalid' && <span className="text-red-500 flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> 보안 취약</span>}
                {pwStrength === 'normal' && <span className="text-yellow-600 flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> 적정 수준</span>}
                {pwStrength === 'safe' && <span className="text-green-600 flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> 안전함</span>}
              </div>
            )}
          </div>
          <Input id="pw-confirm" label="비밀번호 확인" type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required icon={<Check size={18} />} />
          <Input id="phone" label="휴대폰 번호" placeholder="010-0000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} required icon={<Phone size={18} />} />

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">취소</Button>
            <Button type="submit" className="flex-[2]">다음 단계</Button>
          </div>
        </form>
      )}

      {/* STEP 2: Business Certification */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <Camera className="h-5 w-5" />
              사업자등록증 촬영/업로드
            </h4>
            <p className="text-xs text-blue-700 mb-4">
              사업자등록증을 업로드하면 정보를 자동으로 입력해드립니다.
            </p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <Button
              variant="secondary"
              fullWidth
              onClick={() => fileInputRef.current?.click()}
              isLoading={isOcrProcessing}
            >
              {isOcrProcessing ? '분석 중...' : '이미지 업로드'}
            </Button>
          </div>

          <form onSubmit={handleStep2Submit} className="space-y-4">
            <Input
              id="b_no"
              label="사업자등록번호"
              placeholder="000-00-00000"
              value={businessNumber}
              readOnly
              className="bg-slate-100 text-slate-600 cursor-not-allowed"
              icon={<FileText size={18} />}
            />
            <Input
              id="owner"
              label="대표자 성명"
              placeholder="홍길동"
              value={ownerName}
              readOnly
              className="bg-slate-100 text-slate-600 cursor-not-allowed"
              icon={<User size={18} />}
            />
            <Input
              id="date"
              label="개업일자"
              placeholder="YYYYMMDD"
              value={openDate}
              readOnly
              className="bg-slate-100 text-slate-600 cursor-not-allowed"
              icon={<FileText size={18} />}
            />
            <Input
              id="comp"
              label="상호명 (선택)"
              placeholder="(주)공사로그"
              value={companyName}
              readOnly
              className="bg-slate-100 text-slate-600 cursor-not-allowed"
              icon={<Building2 size={18} />}
            />

            <div className="pt-4 flex gap-3">
              <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1">이전</Button>
              <Button type="submit" isLoading={isLoading} className="flex-[2]">다음 단계</Button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 3: Address */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="relative">
            <Input
              id="search"
              label="주소 검색"
              placeholder="도로명 또는 지번 주소 입력"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
              icon={<Search size={18} />}
            />
            <button
              onClick={handleAddressSearch}
              className="absolute right-3 top-[34px] p-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>

          {isSearchingAddr && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          )}

          {addressList.length > 0 && (
            <div className="max-h-48 overflow-y-auto border rounded-md divide-y">
              {addressList.map((addr, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddressSelect(addr)}
                  className="w-full text-left p-3 hover:bg-slate-50 text-sm"
                >
                  <div className="font-bold text-slate-800">{addr.roadAddr}</div>
                  <div className="text-slate-500 text-xs">{addr.jibunAddr}</div>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleStep3Submit} className="space-y-4">
            <Input id="zip" label="우편번호" value={zipCode} readOnly icon={<MapPin size={18} />} />
            <Input id="addr1" label="기본 주소" value={address} readOnly icon={<MapPin size={18} />} />
            <Input id="addr2" label="상세 주소" placeholder="층, 호수 등 입력" value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} required icon={<MapPin size={18} />} />

            <div className="pt-4 flex gap-3">
              <Button type="button" variant="secondary" onClick={() => setStep(2)} className="flex-1">이전</Button>
              <Button type="submit" isLoading={isLoading} className="flex-[2]">회원가입 완료</Button>
            </div>
          </form>
        </div>
      )}

      {/* SUCCESS */}
      {step === 'success' && (
        <div className="text-center py-10 animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">업체 등록 완료!</h3>
          <p className="text-slate-500 mb-8">
            이제 직원들에게 아래 업체 코드를 공유하여<br />
            가입을 요청하세요.
          </p>

          <div className="bg-slate-100 p-6 rounded-xl mb-8 relative group">
            <span className="text-sm text-slate-500 block mb-1">나의 업체 코드</span>
            <span className="text-3xl font-mono font-bold text-blue-600 tracking-wider">{createdCompanyCode}</span>
            <button
              type="button"
              onClick={async () => {
                if (!createdCompanyCode) return;

                const copyToClipboard = async (text: string) => {
                  try {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                      await navigator.clipboard.writeText(text);
                      return true;
                    }
                    throw new Error('Clipboard API unavailable');
                  } catch (err) {
                    try {
                      const textArea = document.createElement("textarea");
                      textArea.value = text;
                      textArea.style.position = "fixed";
                      textArea.style.left = "-9999px";
                      document.body.appendChild(textArea);
                      textArea.focus();
                      textArea.select();
                      const successful = document.execCommand('copy');
                      document.body.removeChild(textArea);
                      return successful;
                    } catch (fallbackErr) {
                      console.error('Fallback copy failed:', fallbackErr);
                      return false;
                    }
                  }
                };

                const success = await copyToClipboard(createdCompanyCode);
                if (success) {
                  toast.success('코드가 복사되었습니다.');
                } else {
                  toast.error('복사에 실패했습니다. 코드를 직접 선택해서 복사해주세요.');
                }
              }}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 transition-colors"
            >
              <Copy className="h-5 w-5" />
            </button>
          </div>

          <Button fullWidth onClick={onComplete}>로그인 화면으로 이동</Button>
        </div>
      )}
    </div>
  );
};
