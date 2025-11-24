
import React, { useState, useEffect, useRef } from 'react';
import { Hammer, HardHat, Construction, ArrowLeft, Check, AlertCircle, ShieldCheck, ShieldAlert, Upload, Camera, FileText, Loader2, AlertTriangle, XCircle, Search, MapPin, X } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { User } from '../types';
import { analyzePassword, hashPassword, verifyPassword, PasswordStrength } from '../utils/security';
import { extractBusinessInfo, validateBusinessWithNTS } from '../utils/businessCert';
import { validateImageMiddleware } from '../utils/imageSecurity';
import { searchAddress, Juso } from '../utils/addressApi';

interface LoginFormProps {
  onLogin: (user: User) => void;
}

interface LoginAttempt {
  count: number;
  lockUntil: number | null;
}

interface ToastMessage {
  msg: string;
  type: 'warning' | 'error';
}

// Temporary storage for registration flow
interface RegistrationData {
  email: string;
  passwordHash: string;
  passwordSalt: string;
  name: string;
  phone: string;
  businessName?: string;
  businessNumber?: string;
  openDate?: string;
  industry?: string;
  address?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [view, setView] = useState<'login' | 'signup-select' | 'signup-boss-step1' | 'signup-boss-step2' | 'signup-boss-step3'>('login');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  
  // Login State
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState<Record<string, LoginAttempt>>({});

  // Sign Up State - Temp Data
  const [tempRegData, setTempRegData] = useState<Partial<RegistrationData>>({});

  // Sign Up State - Step 1
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPw, setSignupPw] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupName, setSignupName] = useState('');
  
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [pwStrength, setPwStrength] = useState<PasswordStrength>('invalid');
  const [isPwTouched, setIsPwTouched] = useState(false);

  // Sign Up State - Step 2
  const [businessImage, setBusinessImage] = useState<File | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isValidatingBusiness, setIsValidatingBusiness] = useState(false);
  
  const [businessName, setBusinessName] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [openDate, setOpenDate] = useState('');
  const [industry, setIndustry] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sign Up State - Step 3
  const [zipCode, setZipCode] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  
  // Address Search Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressKeyword, setAddressKeyword] = useState('');
  const [addressResults, setAddressResults] = useState<Juso[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  // Toast Timer
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Analyze password strength whenever input changes
  useEffect(() => {
    if (signupPw) {
      setPwStrength(analyzePassword(signupPw, signupEmail));
    }
  }, [signupPw, signupEmail]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check Lockout
    const currentAttempt = loginAttempts[id];
    if (currentAttempt?.lockUntil && Date.now() < currentAttempt.lockUntil) {
      const remainingMinutes = Math.ceil((currentAttempt.lockUntil - Date.now()) / 1000 / 60);
      setError(`로그인 시도 횟수 초과로 계정이 잠겼습니다. ${remainingMinutes}분 후에 다시 시도해주세요.`);
      return;
    }

    setIsLoading(true);

    // Simulate API delay
    setTimeout(async () => {
      // Mock failure condition
      if (!id || !password) {
        setError('아이디와 비밀번호를 모두 입력해주세요.');
        setIsLoading(false);
        return;
      }

      let isValidUser = false;
      let userName = '';

      // 1. Check Hardcoded Admin
      if (id === 'admin' && password === 'password123!') {
        isValidUser = true;
        userName = '현장 관리자';
      } 
      // 2. Check Registered Users (LocalStorage)
      else {
        try {
          const storedUsersJSON = localStorage.getItem('demo_users');
          if (storedUsersJSON) {
            const users = JSON.parse(storedUsersJSON);
            const user = users[id];
            
            if (user) {
              // Verify Password (Re-hash input with stored salt and compare)
              const isMatch = await verifyPassword(password, user.passwordHash, user.passwordSalt);
              if (isMatch) {
                isValidUser = true;
                userName = user.name;
              }
            }
          }
        } catch (err) {
          console.error("Local storage error", err);
        }
      }

      if (!isValidUser) {
        // Handle failed attempt
        const newAttempts = { ...loginAttempts };
        const currentCount = (newAttempts[id]?.count || 0) + 1;
        
        let lockTime: number | null = null;
        let errorMessage = '아이디 또는 비밀번호가 올바르지 않습니다.';

        if (currentCount > 5) {
          lockTime = Date.now() + 30 * 60 * 1000; // 30 minutes
          errorMessage = '비밀번호를 5회 이상 틀려 30분간 접속이 제한됩니다.';
        }

        setLoginAttempts({
          ...newAttempts,
          [id]: { count: currentCount, lockUntil: lockTime }
        });

        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      // Success - Reset attempts
      const newAttempts = { ...loginAttempts };
      delete newAttempts[id];
      setLoginAttempts(newAttempts);

      const loggedInUser: User = {
        id: id,
        name: userName,
        role: id === 'admin' ? 'admin' : 'user'
      };

      onLogin(loggedInUser);
      setIsLoading(false);
    }, 1000);
  };

  const handleDuplicateCheck = () => {
    if (!signupEmail.includes('@')) {
      alert('유효한 이메일 형식이 아닙니다.');
      return;
    }
    
    // Check local storage for duplicates
    const storedUsersJSON = localStorage.getItem('demo_users');
    if (storedUsersJSON) {
      const users = JSON.parse(storedUsersJSON);
      if (users[signupEmail]) {
        alert('이미 사용 중인 아이디입니다.');
        return;
      }
    }

    setTimeout(() => {
      alert('사용 가능한 아이디(이메일)입니다.');
      setIsEmailChecked(true);
    }, 500);
  };

  const handleSignupStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailChecked) {
      alert('아이디 중복 확인을 진행해주세요.');
      return;
    }
    if (pwStrength === 'invalid') {
      alert('비밀번호 보안 규칙을 준수해주세요.');
      return;
    }
    
    // Create Hash and Salt
    const { hash, salt } = await hashPassword(signupPw);
    
    // Store temporarily
    setTempRegData({
      ...tempRegData,
      email: signupEmail,
      passwordHash: hash,
      passwordSalt: salt,
      name: signupName,
      phone: signupPhone
    });
    
    setView('signup-boss-step2');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // --- Security Middleware Check ---
    const integrity = await validateImageMiddleware(file);

    if (integrity.error) {
      setToast({ msg: integrity.error, type: 'error' });
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
      return; // Block upload
    }

    if (integrity.warning) {
      setToast({ msg: integrity.warning, type: 'warning' });
      // Proceed but warn
    }
    // ---------------------------------

    setBusinessImage(file);
    setIsProcessingImage(true);
    setIsValidatingBusiness(true);
    setError(null);

    try {
      // 1. OCR Extraction
      const info = await extractBusinessInfo(file);
      console.log("Extracted Info:", info);

      if (!info.b_no || !info.start_dt || !info.s_nm) {
         throw new Error("이미지에서 필수 정보를 추출하지 못했습니다. 선명한 이미지를 다시 올려주세요.");
      }

      // Check Name Match
      const extractedName = info.c_nm?.replace(/\s/g, '') || '';
      const inputName = signupName.replace(/\s/g, '');
      
      if (extractedName !== inputName) {
        throw new Error(`사업자등록증의 대표자명(${info.c_nm})이 입력하신 정보(${signupName})와 일치하지 않습니다.`);
      }

      // 2. NTS Validation
      // Note: We use the `signupName` (Step 1 Representative Name) to validate ownership
      const isValid = await validateBusinessWithNTS(info.b_no, info.start_dt, signupName);
      
      if (!isValid) {
          throw new Error("국세청에 등록되지 않은 사업자이거나, 사업자 상태가 유효하지 않습니다.");
      }

      // 3. Auto-fill
      setBusinessName(info.s_nm);
      setBusinessNumber(info.b_no);
      setOpenDate(info.start_dt);
      setIndustry(info.w_kind || '');
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "사업자 정보 확인 중 오류가 발생했습니다.");
      // Reset fields if validation fails
      setBusinessName('');
      setBusinessNumber('');
      setOpenDate('');
      setIndustry('');
    } finally {
      setIsProcessingImage(false);
      setIsValidatingBusiness(false);
    }
  };

  const handleSignupStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessNumber || !businessName || !openDate || !industry) {
      alert('사업자 인증을 완료해주세요.');
      return;
    }
    
    setTempRegData({
      ...tempRegData,
      businessName,
      businessNumber,
      openDate,
      industry
    });

    setView('signup-boss-step3');
  };

  // --- Address Search Logic ---
  const handleOpenAddressModal = () => {
    setIsAddressModalOpen(true);
    setAddressKeyword('');
    setAddressResults([]);
  };

  const handleAddressSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressKeyword) return;
    
    setIsSearchingAddress(true);
    try {
      const results = await searchAddress(addressKeyword);
      setAddressResults(results);
    } catch (err) {
      console.error(err);
      alert('주소 검색 중 오류가 발생했습니다.');
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const handleSelectAddress = (juso: Juso) => {
    setZipCode(juso.zipNo);
    setAddress(juso.roadAddr);
    setDetailAddress(''); // Reset detail address for user input
    setIsAddressModalOpen(false);
  };
  // ----------------------------

  const handleSignupStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipCode || !address || !detailAddress) {
        alert('주소 정보를 모두 입력해주세요.');
        return;
    }

    // Finalize Registration: Save to Local Storage (Demo DB)
    const finalData = {
      ...tempRegData,
      address: `${address} ${detailAddress}`
    };

    try {
      const storedUsersJSON = localStorage.getItem('demo_users');
      const users = storedUsersJSON ? JSON.parse(storedUsersJSON) : {};
      
      // Save user with email as key
      if (finalData.email) {
        users[finalData.email] = finalData;
        localStorage.setItem('demo_users', JSON.stringify(users));
        
        alert('회원가입이 완료되었습니다! 이제 로그인해주세요.');
        
        // Reset and go to login
        resetForm();
        setView('login');
      }
    } catch (err) {
      console.error('Registration failed', err);
      alert('회원가입 처리 중 오류가 발생했습니다.');
    }
  };

  const resetForm = () => {
    setSignupEmail('');
    setSignupPw('');
    setSignupName('');
    setSignupPhone('');
    setIsEmailChecked(false);
    setPwStrength('invalid');
    setTempRegData({});
    setBusinessImage(null);
    setBusinessName('');
    setBusinessNumber('');
    setOpenDate('');
    setIndustry('');
    setZipCode('');
    setAddress('');
    setDetailAddress('');
  };

  const renderLoginView = () => (
    <form className="space-y-6" onSubmit={handleLoginSubmit}>
      <div className="relative flex justify-center items-center mb-6">
         <span className="text-slate-400 font-medium text-sm bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
            공사_log
         </span>
      </div>

      <div className="space-y-4">
        <Input
          id="user-id"
          label="아이디"
          type="text"
          placeholder="User ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          autoComplete="username"
          required
        />

        <Input
          id="password"
          label="비밀번호"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <div className="flex">
            <div className="text-sm text-red-700">
              {error}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-slate-900">
            로그인 유지
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button" 
            onClick={() => {
                resetForm();
                setView('signup-select');
            }}
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            회원 가입
          </button>
          <span className="text-slate-300">|</span>
          <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
            비밀번호 찾기
          </a>
        </div>
      </div>

      <Button
        type="submit"
        fullWidth
        isLoading={isLoading}
        className="h-11 text-base shadow-blue-200"
      >
        로그인
      </Button>
    </form>
  );

  const renderSignupSelectView = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-6 pt-2">
        <Button 
          fullWidth 
          className="h-14 text-lg font-bold bg-slate-800 hover:bg-slate-900 shadow-lg border-none"
          onClick={() => setView('signup-boss-step1')}
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
          onClick={() => alert('직원 회원가입 페이지로 이동합니다.')}
        >
          직원으로 가입
        </Button>
      </div>

      <div className="flex justify-center pt-2">
        <button 
          type="button" 
          onClick={() => setView('login')}
          className="flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          로그인 화면으로 돌아가기
        </button>
      </div>
    </div>
  );

  const renderBossSignupStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="w-full">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-bold text-blue-600">1단계 : 개인 인증</span>
          <span className="text-xs text-slate-400">3단계 중 1단계</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div className="h-full w-1/3 bg-blue-600 rounded-full"></div>
          <div className="h-full w-1/3 bg-slate-200"></div>
          <div className="h-full w-1/3 bg-slate-200"></div>
        </div>
      </div>

      <form onSubmit={handleSignupStep1Submit} className="space-y-5">
        <div className="space-y-1">
          <div className="flex gap-2 items-end">
            <Input
              id="signup-email"
              label="아이디 (이메일)"
              type="email"
              placeholder="example@company.com"
              value={signupEmail}
              onChange={(e) => {
                setSignupEmail(e.target.value);
                setIsEmailChecked(false);
              }}
              required
            />
            <Button 
              type="button" 
              variant="secondary" 
              className="h-[42px] mb-[1px] whitespace-nowrap"
              onClick={handleDuplicateCheck}
              disabled={isEmailChecked}
            >
              {isEmailChecked ? <Check className="h-4 w-4" /> : '중복 확인'}
            </Button>
          </div>
          <p className="text-xs text-slate-500 pl-1">
            * 비밀번호 찾기 및 중요 알림이 해당 이메일로 전송됩니다.
          </p>
        </div>

        <div>
          <Input
            id="signup-pw"
            label="비밀번호"
            type="password"
            placeholder="영문, 숫자, 특수문자 포함 10자 이상"
            value={signupPw}
            onChange={(e) => {
              setSignupPw(e.target.value);
              setIsPwTouched(true);
            }}
            required
            className={
               isPwTouched && pwStrength === 'invalid' ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 
               isPwTouched && pwStrength === 'safe' ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : ''
            }
          />
          {isPwTouched && (
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs">
                {pwStrength === 'invalid' && (
                  <>
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    <span className="text-red-500 font-medium">사용 불가</span>
                    <span className="text-slate-400">(조건 미충족)</span>
                  </>
                )}
                {pwStrength === 'normal' && (
                  <>
                    <ShieldAlert className="h-3 w-3 text-yellow-500" />
                    <span className="text-yellow-600 font-medium">보통</span>
                    <span className="text-slate-400">(안전하지 않음)</span>
                  </>
                )}
                {pwStrength === 'safe' && (
                  <>
                    <ShieldCheck className="h-3 w-3 text-green-500" />
                    <span className="text-green-600 font-medium">안전</span>
                  </>
                )}
              </div>
            </div>
          )}
           <p className="mt-1 text-xs text-slate-400 pl-1 leading-relaxed">
            * 10자 이상, 영문/숫자/특수문자 포함.<br/>
            * 이메일 아이디 포함 불가.
          </p>
        </div>

        <Input
          id="signup-name"
          label="대표자 실명"
          type="text"
          placeholder="홍길동"
          value={signupName}
          onChange={(e) => setSignupName(e.target.value)}
          required
        />

        <div className="pt-2">
            <div className="flex gap-2 items-end">
                <Input
                id="signup-phone"
                label="휴대폰 본인 인증"
                type="tel"
                placeholder="010-0000-0000"
                value={signupPhone}
                onChange={(e) => setSignupPhone(e.target.value)}
                required
                />
                <Button 
                type="button" 
                variant="outline" 
                className="h-[42px] mb-[1px] whitespace-nowrap text-slate-600"
                onClick={() => alert('인증번호가 발송되었습니다. (데모)')}
                >
                인증 요청
                </Button>
            </div>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            fullWidth
            className="h-12 text-lg"
          >
            다음 단계
          </Button>
        </div>
      </form>

      <div className="flex justify-center pt-2">
        <button 
          type="button" 
          onClick={() => {
              resetForm();
              setView('signup-select');
          }}
          className="flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          가입 유형 선택으로 돌아가기
        </button>
      </div>
    </div>
  );

  const renderBossSignupStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Progress Bar */}
      <div className="w-full">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-bold text-blue-600">2단계 : 사업자 정보</span>
          <span className="text-xs text-slate-400">3단계 중 2단계</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div className="h-full w-1/3 bg-blue-600"></div>
          <div className="h-full w-1/3 bg-blue-600 rounded-full"></div>
          <div className="h-full w-1/3 bg-slate-200"></div>
        </div>
      </div>

      <form onSubmit={handleSignupStep2Submit} className="space-y-6">
        
        {/* File Upload Section */}
        <div>
           <label className="block text-sm font-medium text-slate-700 mb-2">사업자등록증 등록</label>
           <div 
             className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer hover:bg-slate-50 ${isProcessingImage ? 'border-blue-300 bg-blue-50' : 'border-slate-300'}`}
             onClick={() => !isProcessingImage && fileInputRef.current?.click()}
           >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                capture="environment" 
                onChange={handleImageUpload}
                disabled={isProcessingImage}
              />
              
              {isProcessingImage ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-3" />
                  <p className="text-sm font-medium text-blue-700">사업자 정보 분석 중...</p>
                  <p className="text-xs text-blue-500 mt-1">이미지 인식 및 국세청 조회 중입니다</p>
                </div>
              ) : businessImage ? (
                <div className="flex flex-col items-center justify-center py-2">
                   <FileText className="h-10 w-10 text-green-500 mb-2" />
                   <p className="text-sm font-medium text-slate-900">{businessImage.name}</p>
                   <p className="text-xs text-slate-500 mt-1">클릭하여 다시 업로드</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-slate-500">
                  <div className="flex gap-4 mb-3">
                    <Camera className="h-8 w-8" />
                    <Upload className="h-8 w-8" />
                  </div>
                  <p className="text-sm font-medium">사진 촬영 또는 파일 업로드</p>
                  <p className="text-xs mt-1 text-slate-400">사업자등록증을 선명하게 촬영해주세요</p>
                </div>
              )}
           </div>
           {error && (
             <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
               <AlertCircle className="h-4 w-4" /> {error}
             </p>
           )}
        </div>

        {/* Auto-filled Fields */}
        <div className="space-y-4 pt-2">
            <Input
              id="business-name"
              label="상호명"
              value={businessName}
              readOnly
              placeholder="자동 입력됩니다"
            />
            <Input
              id="business-number"
              label="사업자 등록 번호"
              value={businessNumber}
              readOnly
              placeholder="자동 입력됩니다"
            />
            <Input
              id="open-date"
              label="개업 일자"
              value={openDate}
              readOnly
              placeholder="자동 입력됩니다"
            />
            <Input
              id="industry"
              label="업종"
              value={industry}
              readOnly
              placeholder="자동 입력됩니다"
            />
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            fullWidth
            className="h-12 text-lg"
            disabled={!businessName || !businessNumber || !industry || isProcessingImage}
          >
            다음 단계
          </Button>
        </div>
      </form>

      <div className="flex justify-center pt-2">
        <button 
          type="button" 
          onClick={() => setView('signup-boss-step1')}
          className="flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          이전 단계로 돌아가기
        </button>
      </div>
    </div>
  );

  const renderBossSignupStep3 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Progress Bar */}
      <div className="w-full">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-bold text-blue-600">3단계 : 기타 정보</span>
          <span className="text-xs text-slate-400">3단계 중 3단계</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div className="h-full w-1/3 bg-blue-600"></div>
          <div className="h-full w-1/3 bg-blue-600"></div>
          <div className="h-full w-1/3 bg-blue-600 rounded-full"></div>
        </div>
      </div>

      <form onSubmit={handleSignupStep3Submit} className="space-y-6">
        <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">사업체 주소</label>
            <div className="flex gap-2">
                <Input
                    id="zip-code"
                    label=""
                    placeholder="우편번호"
                    value={zipCode}
                    readOnly
                    className="w-32"
                />
                <Button 
                    type="button" 
                    variant="secondary" 
                    className="h-[42px] whitespace-nowrap"
                    onClick={handleOpenAddressModal}
                >
                    <Search className="h-4 w-4 mr-1" />
                    주소 검색
                </Button>
            </div>
            <Input
                id="address"
                label=""
                placeholder="기본 주소"
                value={address}
                readOnly
            />
            <Input
                id="detail-address"
                label=""
                placeholder="상세 주소를 입력해주세요"
                value={detailAddress}
                onChange={(e) => setDetailAddress(e.target.value)}
            />
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            fullWidth
            className="h-12 text-lg"
          >
            가입 완료
          </Button>
        </div>
      </form>

      <div className="flex justify-center pt-2">
        <button 
          type="button" 
          onClick={() => setView('signup-boss-step2')}
          className="flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          이전 단계로 돌아가기
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 px-5 py-3 rounded-full shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
            toast.type === 'error' ? 'bg-zinc-800 text-white' : 'bg-zinc-800 text-white'
        }`}>
            {toast.type === 'error' ? (
                <XCircle className="h-5 w-5 text-red-400" />
            ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
            )}
            <span className="text-sm font-medium">{toast.msg}</span>
        </div>
      )}

      {/* Address Search Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsAddressModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  주소 검색
                </h3>
                <button onClick={() => setIsAddressModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
             </div>
             
             <div className="p-4">
                <form onSubmit={handleAddressSearchSubmit} className="flex gap-2 mb-4">
                  <Input 
                    id="addr-search" 
                    label="" 
                    placeholder="도로명 또는 지번 주소 (예: 판교역로, 테헤란로)" 
                    value={addressKeyword}
                    onChange={(e) => setAddressKeyword(e.target.value)}
                    autoFocus
                  />
                  <Button type="submit" isLoading={isSearchingAddress} className="h-[42px]">
                    검색
                  </Button>
                </form>

                <div className="h-64 overflow-y-auto border border-slate-100 rounded-md bg-slate-50">
                    {addressResults.length > 0 ? (
                      <ul className="divide-y divide-slate-100">
                        {addressResults.map((item, idx) => (
                           <li 
                             key={idx} 
                             onClick={() => handleSelectAddress(item)}
                             className="p-3 hover:bg-blue-50 cursor-pointer transition-colors bg-white"
                           >
                              <div className="flex items-start gap-2">
                                 <span className="mt-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">도로명</span>
                                 <p className="text-sm font-medium text-slate-900">{item.roadAddr}</p>
                              </div>
                              <div className="flex items-start gap-2 mt-1">
                                 <span className="mt-1 px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded">지번</span>
                                 <p className="text-sm text-slate-500">{item.jibunAddr}</p>
                              </div>
                           </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400">
                         <Search className="h-8 w-8 mb-2 opacity-50" />
                         <p className="text-sm">검색 결과가 없습니다</p>
                         <p className="text-xs mt-1">도로명 또는 지번을 입력해주세요</p>
                         <p className="text-xs mt-4 text-slate-300">Tip: '강남', '판교'로 검색해보세요 (데모)</p>
                      </div>
                    )}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Background Decoration */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 transform -rotate-12">
          <Hammer size={120} />
        </div>
        <div className="absolute bottom-10 right-10 transform rotate-12">
          <Construction size={120} />
        </div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-slate-100">
          
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg mb-4">
              <HardHat className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              공사_log
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {view === 'login' && '현장 관리 시스템에 접속하세요'}
              {view === 'signup-select' && '회원가입 유형을 선택하세요'}
              {view === 'signup-boss-step1' && '업체 등록을 시작합니다'}
              {view === 'signup-boss-step2' && '사업자 정보를 확인합니다'}
              {view === 'signup-boss-step3' && '마지막 단계입니다'}
            </p>
          </div>

          {view === 'login' && renderLoginView()}
          {view === 'signup-select' && renderSignupSelectView()}
          {view === 'signup-boss-step1' && renderBossSignupStep1()}
          {view === 'signup-boss-step2' && renderBossSignupStep2()}
          {view === 'signup-boss-step3' && renderBossSignupStep3()}

          {/* Footer Section */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">
                  시스템 문의
                </span>
              </div>
            </div>
            <div className="mt-6 text-center text-xs text-slate-400">
              &copy; 2024 Gongsa_log System. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
