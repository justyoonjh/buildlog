
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, AlertCircle, ShieldCheck, ShieldAlert, Upload, Camera, FileText, Loader2, MapPin, Search, X, CheckCircle2, Copy, AlertTriangle, XCircle } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { analyzePassword, hashPassword, PasswordStrength, generateCompanyCode, logSystemError } from '../utils/security';
import { extractBusinessInfo, validateBusinessWithNTS } from '../utils/businessCert';
import { validateImageMiddleware } from '../utils/imageSecurity';
import { searchAddress, Juso } from '../utils/addressApi';

interface BossSignupFormProps {
  onCancel: () => void;
  onComplete: () => void;
}

interface ToastMessage {
  msg: string;
  type: 'success' | 'warning' | 'error';
}

interface RegistrationData {
  email: string;
  passwordHash: string;
  passwordSalt: string;
  name: string;
  phone: string;
  role: 'admin';
  businessName?: string;
  businessNumber?: string;
  openDate?: string;
  industry?: string;
  address?: string;
  companyCode?: string;
}

export const BossSignupForm: React.FC<BossSignupFormProps> = ({ onCancel, onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 'success'>(1);
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
  const [businessImage, setBusinessImage] = useState<File | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [openDate, setOpenDate] = useState('');
  const [industry, setIndustry] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 3 State
  const [zipCode, setZipCode] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressKeyword, setAddressKeyword] = useState('');
  const [addressResults, setAddressResults] = useState<Juso[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  // Success State
  const [createdCompanyCode, setCreatedCompanyCode] = useState('');
  const [isCodeCopied, setIsCodeCopied] = useState(false);

  // Temp Data Storage
  const [tempRegData, setTempRegData] = useState<Partial<RegistrationData>>({});

  // Timer for Toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Analyze Password
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
        ...tempRegData,
        email: trimmedEmail,
        passwordHash: hash,
        passwordSalt: salt,
        name: signupName,
        phone: signupPhone,
        role: 'admin'
      });
      
      setStep(2);
    } catch (err: any) {
      logSystemError('Error B', `Boss Step 1 Failed: ${err.message}`);
      setToast({ msg: '시스템 오류가 발생했습니다. (Error B)', type: 'error' });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const integrity = await validateImageMiddleware(file);
    if (integrity.error) {
      setToast({ msg: integrity.error, type: 'error' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (integrity.warning) {
      setToast({ msg: integrity.warning, type: 'warning' });
    }

    setBusinessImage(file);
    setIsProcessingImage(true);
    setError(null);

    try {
      // 1. OCR
      const info = await extractBusinessInfo(file);
      
      if (!info.b_no || !info.start_dt || !info.s_nm) {
         throw new Error("이미지에서 필수 정보를 추출하지 못했습니다.");
      }

      // Check Name Match
      const extractedName = info.c_nm?.replace(/\s/g, '') || '';
      const inputName = signupName.replace(/\s/g, '');
      if (extractedName !== inputName) {
        throw new Error(`대표자명(${info.c_nm})이 입력하신 정보(${signupName})와 일치하지 않습니다.`);
      }

      // 2. NTS Validation
      await validateBusinessWithNTS(info.b_no, info.start_dt, signupName);

      // 3. Auto-fill
      setBusinessName(info.s_nm);
      setBusinessNumber(info.b_no);
      setOpenDate(info.start_dt);
      setIndustry(info.w_kind || '');
      setToast({ msg: '사업자 정보 검증 성공!', type: 'success' });
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "사업자 정보 확인 중 오류가 발생했습니다.");
      setBusinessName('');
      setBusinessNumber('');
      setOpenDate('');
      setIndustry('');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessNumber || !businessName) {
      setToast({ msg: '사업자 인증을 완료해주세요.', type: 'warning' });
      return;
    }
    setTempRegData(prev => ({ ...prev, businessName, businessNumber, openDate, industry }));
    setStep(3);
  };

  // Address Modal
  const handleAddressSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressKeyword) return;
    setIsSearchingAddress(true);
    try {
      const results = await searchAddress(addressKeyword);
      setAddressResults(results);
    } catch (err) {
      setToast({ msg: '주소 검색 중 오류가 발생했습니다.', type: 'error' });
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipCode || !address || !detailAddress) {
        setToast({ msg: '주소 정보를 모두 입력해주세요.', type: 'warning' });
        return;
    }
    
    // Finalize
    const companyCode = generateCompanyCode();
    const businessData = {
      b_no: tempRegData.businessNumber,
      s_nm: tempRegData.businessName,
      start_dt: tempRegData.openDate,
      w_kind: tempRegData.industry,
      address: `${address} ${detailAddress}`,
      zipCode: zipCode
    };

    const finalData = {
      ...tempRegData,
      role: 'admin',
      companyCode: companyCode,
      businessInfo: businessData,
      address: `${address} ${detailAddress}`
    };

    try {
      const storedUsersJSON = localStorage.getItem('demo_users');
      const users = storedUsersJSON ? JSON.parse(storedUsersJSON) : {};
      
      if (finalData.email) {
        users[finalData.email] = finalData;
        localStorage.setItem('demo_users', JSON.stringify(users));
        setCreatedCompanyCode(companyCode);
        setStep('success');
      }
    } catch (err: any) {
      logSystemError('Error C', `Final Submit Failed: ${err.message}`);
      setToast({ msg: '회원가입 처리 중 오류가 발생했습니다.', type: 'error' });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(createdCompanyCode);
    setIsCodeCopied(true);
    setTimeout(() => setIsCodeCopied(false), 2000);
  };

  // --- Renders ---

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Toast */}
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

      {/* Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsAddressModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  주소 검색
                </h3>
                <button onClick={() => setIsAddressModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
             </div>
             <div className="p-4">
                <form onSubmit={handleAddressSearchSubmit} className="flex gap-2 mb-4">
                  <Input 
                    id="addr-search" 
                    label="" 
                    placeholder="도로명/지번 (예: 판교역로)" 
                    value={addressKeyword}
                    onChange={(e) => setAddressKeyword(e.target.value)}
                    autoFocus
                  />
                  <Button type="submit" isLoading={isSearchingAddress} className="h-[42px]">검색</Button>
                </form>
                <div className="h-64 overflow-y-auto border border-slate-100 rounded-md bg-slate-50">
                    {addressResults.length > 0 ? (
                      <ul className="divide-y divide-slate-100">
                        {addressResults.map((item, idx) => (
                           <li key={idx} onClick={() => {
                               setZipCode(item.zipNo);
                               setAddress(item.roadAddr);
                               setDetailAddress('');
                               setIsAddressModalOpen(false);
                           }} className="p-3 hover:bg-blue-50 cursor-pointer bg-white">
                              <p className="text-sm font-medium text-slate-900">{item.roadAddr}</p>
                              <p className="text-xs text-slate-500">{item.jibunAddr}</p>
                           </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                         <Search className="h-8 w-8 mb-2 opacity-50" />
                         <p className="text-sm">검색 결과가 없습니다</p>
                      </div>
                    )}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Header */}
      {step !== 'success' && (
        <div className="w-full mb-6">
            <div className="flex justify-between mb-2">
            <span className="text-sm font-bold text-blue-600">
                {step === 1 ? '1단계 : 개인 인증' : step === 2 ? '2단계 : 사업자 정보' : '3단계 : 기타 정보'}
            </span>
            <span className="text-xs text-slate-400">3단계 중 {step}단계</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div className={`h-full w-1/3 ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'} transition-all duration-300`}></div>
            <div className={`h-full w-1/3 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'} transition-all duration-300`}></div>
            <div className={`h-full w-1/3 ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'} transition-all duration-300`}></div>
            </div>
        </div>
      )}

      {/* Step 1 Form */}
      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="space-y-5">
            <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">아이디 (이메일)</label>
                <div className="flex items-start gap-2">
                    <div className="flex-1">
                    <Input id="signup-email" label="" type="email" placeholder="example@company.com" value={signupEmail} onChange={(e) => { setSignupEmail(e.target.value); setIsEmailChecked(false); }} required className="mt-0 h-[42px]" />
                    </div>
                    <Button type="button" variant="secondary" isLoading={isCheckingDuplicate} className="h-[42px] whitespace-nowrap shrink-0 relative z-10 min-w-[80px]" onClick={handleDuplicateCheck} disabled={isEmailChecked || isCheckingDuplicate}>
                    {isEmailChecked ? <Check className="h-4 w-4" /> : '중복 확인'}
                    </Button>
                </div>
                <p className="text-xs text-slate-500 pl-1">* 비밀번호 찾기 및 중요 알림이 해당 이메일로 전송됩니다.</p>
            </div>
            <div>
                <Input id="signup-pw" label="비밀번호" type="password" placeholder="영문, 숫자, 특수문자 포함 10자 이상" value={signupPw} onChange={(e) => { setSignupPw(e.target.value); setIsPwTouched(true); }} required className={isPwTouched && pwStrength === 'invalid' ? 'border-red-300' : isPwTouched && pwStrength === 'safe' ? 'border-green-300' : ''} />
                {isPwTouched && (
                    <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs">
                        {pwStrength === 'invalid' && <><AlertCircle className="h-3 w-3 text-red-500" /><span className="text-red-500 font-medium">사용 불가</span></>}
                        {pwStrength === 'normal' && <><ShieldAlert className="h-3 w-3 text-yellow-500" /><span className="text-yellow-600 font-medium">보통</span></>}
                        {pwStrength === 'safe' && <><ShieldCheck className="h-3 w-3 text-green-500" /><span className="text-green-600 font-medium">안전</span></>}
                    </div>
                    </div>
                )}
            </div>
            <Input id="signup-name" label="대표자 실명" type="text" placeholder="홍길동" value={signupName} onChange={(e) => setSignupName(e.target.value)} required />
            <div className="pt-2">
                <div className="flex gap-2 items-end">
                    <div className="flex-1">
                    <Input id="signup-phone" label="휴대폰 본인 인증" type="tel" placeholder="010-0000-0000" value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)} required />
                    </div>
                    <Button type="button" variant="outline" className="h-[42px] mb-[1px] whitespace-nowrap text-slate-600" onClick={() => setToast({ msg: '인증번호 발송 (데모)', type: 'success' })}>인증 요청</Button>
                </div>
            </div>
            <div className="pt-4"><Button type="submit" fullWidth className="h-12 text-lg">다음 단계</Button></div>
        </form>
      )}

      {/* Step 2 Form */}
      {step === 2 && (
        <form onSubmit={handleStep2Submit} className="space-y-6">
           <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">사업자등록증 등록</label>
               <div className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 ${isProcessingImage ? 'border-blue-300 bg-blue-50' : 'border-slate-300'}`} onClick={() => !isProcessingImage && fileInputRef.current?.click()}>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isProcessingImage} />
                  {isProcessingImage ? (
                    <div className="flex flex-col items-center"><Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-3" /><p className="text-sm font-medium text-blue-700">분석 중...</p></div>
                  ) : businessImage ? (
                    <div className="flex flex-col items-center"><FileText className="h-10 w-10 text-green-500 mb-2" /><p className="text-sm font-medium">{businessImage.name}</p></div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-500"><div className="flex gap-4 mb-3"><Camera className="h-8 w-8" /><Upload className="h-8 w-8" /></div><p className="text-sm font-medium">파일 업로드</p></div>
                  )}
               </div>
               {error && <p className="mt-2 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {error}</p>}
           </div>
           <div className="space-y-4 pt-2">
                <Input id="business-name" label="상호명" value={businessName} readOnly placeholder="자동 입력" />
                <Input id="business-number" label="사업자 등록 번호" value={businessNumber} readOnly placeholder="자동 입력" />
                <Input id="open-date" label="개업 일자" value={openDate} readOnly placeholder="자동 입력" />
                <Input id="industry" label="업종" value={industry} readOnly placeholder="자동 입력" />
           </div>
           <div className="pt-4"><Button type="submit" fullWidth className="h-12 text-lg" disabled={!businessName || isProcessingImage}>다음 단계</Button></div>
        </form>
      )}

      {/* Step 3 Form */}
      {step === 3 && (
        <form onSubmit={handleStep3Submit} className="space-y-6">
            <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">사업체 주소</label>
                <div className="flex gap-2">
                    <Input id="zip-code" label="" placeholder="우편번호" value={zipCode} readOnly className="w-32" />
                    <Button type="button" variant="secondary" className="h-[42px] whitespace-nowrap" onClick={() => { setIsAddressModalOpen(true); setAddressKeyword(''); }}>
                        <Search className="h-4 w-4 mr-1" /> 주소 검색
                    </Button>
                </div>
                <Input id="address" label="" placeholder="기본 주소" value={address} readOnly />
                <Input id="detail-address" label="" placeholder="상세 주소를 입력해주세요" value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} />
            </div>
            <div className="pt-4"><Button type="submit" fullWidth className="h-12 text-lg">가입 완료</Button></div>
        </form>
      )}

      {/* Success View */}
      {step === 'success' && (
        <div className="space-y-8 text-center">
            <div className="flex justify-center"><div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center"><CheckCircle2 className="h-10 w-10 text-green-600" /></div></div>
            <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900">회원가입 완료!</h3>
                <p className="text-slate-500">업체 등록이 성공적으로 처리되었습니다.</p>
            </div>
            <div className="bg-slate-100 p-6 rounded-lg border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">업체 코드 (직원 가입용)</p>
                <div className="flex items-center justify-between bg-white border border-slate-200 rounded-md p-3">
                    <span className="text-xl font-mono font-bold text-slate-900 tracking-wide">{createdCompanyCode}</span>
                    <Button variant="secondary" size="sm" onClick={copyToClipboard} className="h-8 px-3 ml-3">{isCodeCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button>
                </div>
            </div>
            <div className="pt-4"><Button fullWidth className="h-12 text-lg" onClick={onComplete}>로그인 하러 가기</Button></div>
        </div>
      )}

      {/* Navigation Buttons */}
      {step !== 'success' && (
        <div className="flex justify-center pt-2">
            <button type="button" onClick={() => step === 1 ? onCancel() : setStep(prev => ((prev as number) - 1) as any)} className="flex items-center text-sm text-slate-500 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4 mr-1" /> {step === 1 ? '가입 유형 선택으로 돌아가기' : '이전 단계로 돌아가기'}
            </button>
        </div>
      )}
    </div>
  );
};
