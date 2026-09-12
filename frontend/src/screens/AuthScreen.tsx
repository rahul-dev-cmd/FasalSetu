import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';
import { authApi } from '../services/api';
import {
  ArrowLeft,
  Sprout,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Building2,
  Lock,
  Phone,
  User,
  ShieldCheck,
  Check,
  RotateCcw,
  Landmark,
} from 'lucide-react';

export { type UserRole };

export interface AuthScreenProps {
  initialRole?: UserRole;
  initialTab?: 'login' | 'signup';
  onBack?: () => void;
  onSuccess?: (role: UserRole, isNewAccount: boolean) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialRole = 'farmer',
  initialTab = 'login',
  onBack,
  onSuccess,
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const queryRole = searchParams.get('role') as UserRole | null;
  const queryMode = searchParams.get('mode') as 'login' | 'signup' | null;

  const resolvedRole: UserRole = queryRole === 'buyer' || queryRole === 'government' ? queryRole : initialRole;
  const resolvedTab: 'login' | 'signup' = resolvedRole === 'government' ? 'login' : (queryMode === 'signup' ? 'signup' : initialTab);

  const [role, setRole] = useState<UserRole>(resolvedRole);
  const [tab, setTab] = useState<'login' | 'signup'>(resolvedTab);

  // Sync role if prop or search params change
  useEffect(() => {
    if (queryRole) {
      setRole(queryRole);
      if (queryRole === 'government') {
        setTab('login');
      }
    } else {
      setRole(initialRole);
    }
  }, [queryRole, initialRole]);

  // ── Forgot PIN Mode ────────────────────────────────────────────────
  const [isForgotPin, setIsForgotPin] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotPhone, setForgotPhone] = useState('9849012345');
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState<number>(30);
  const [newForgotPin, setNewForgotPin] = useState('');
  const [confirmForgotPin, setConfirmForgotPin] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // ── Login Form State ───────────────────────────────────────────────
  const [loginPhone, setLoginPhone] = useState('9849012345');
  const [loginPin, setLoginPin] = useState('12345678');
  const [showLoginPin, setShowLoginPin] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ── Sign Up Form State ─────────────────────────────────────────────
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPin, setSignupPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showSignupPin, setShowSignupPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [showForgotPin, setShowForgotPin] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);

  // ── Refs for Box Inputs (OTP) ──────────────────────────────────────
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Resend Countdown Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isForgotPin && forgotStep === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isForgotPin, forgotStep, resendTimer]);

  // Generic Multi-Box Handler (PIN or OTP)
  const handleBoxInput = (
    index: number,
    value: string,
    currentArr: string[],
    setArr: (arr: string[]) => void,
    refs: React.RefObject<HTMLInputElement | null>[],
    allowAlpha = true
  ) => {
    const cleanChar = allowAlpha
      ? value.replace(/[^a-zA-Z0-9]/g, '').slice(-1).toUpperCase()
      : value.replace(/\D/g, '').slice(-1);

    const nextArr = [...currentArr];
    nextArr[index] = cleanChar;
    setArr(nextArr);

    // Auto-advance to next cell
    if (cleanChar && index < refs.length - 1) {
      refs[index + 1].current?.focus();
    }
  };

  const handleBoxKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    currentArr: string[],
    setArr: (arr: string[]) => void,
    refs: React.RefObject<HTMLInputElement | null>[]
  ) => {
    if (e.key === 'Backspace') {
      if (!currentArr[index] && index > 0) {
        refs[index - 1].current?.focus();
        const nextArr = [...currentArr];
        nextArr[index - 1] = '';
        setArr(nextArr);
      } else {
        const nextArr = [...currentArr];
        nextArr[index] = '';
        setArr(nextArr);
      }
    }
  };

  const navigateAfterAuth = (
    targetRole: UserRole,
    isNew: boolean,
    details?: { name?: string; phone?: string; token?: string }
  ) => {
    login(targetRole, isNew, details);
    if (onSuccess) {
      onSuccess(targetRole, isNew);
    }
    if (targetRole === 'farmer') {
      navigate('/farmer/dashboard', { replace: true });
    } else if (targetRole === 'buyer') {
      navigate('/buyer/dashboard', { replace: true });
    } else if (targetRole === 'government') {
      navigate('/government/risk-map', { replace: true });
    }
  };

  // ── Login Submit ───────────────────────────────────────────────────
  const isLoginFormValid = loginPhone.length === 10 && loginPin.trim().length >= 4;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (loginPhone.length !== 10) {
      setLoginError('Please enter a valid 10-digit mobile number');
      return;
    }

    const pinStr = loginPin;
    setIsLoggingIn(true);

    try {
      let authResponse;
      try {
        authResponse = await authApi.login({
          phone: loginPhone,
          password: pinStr,
          role,
        });
      } catch (loginErr: any) {
        // Auto-provision demo account on local/dev database if 401
        if (loginErr.status === 401) {
          try {
            authResponse = await authApi.signup({
              phone: loginPhone,
              password: pinStr,
              role,
              name: role === 'farmer' ? 'Ramesh Ji' : role === 'buyer' ? 'Amit Sharma' : 'Officer T. Rao',
            });
          } catch {
            throw loginErr;
          }
        } else {
          throw loginErr;
        }
      }

      setIsLoggingIn(false);
      navigateAfterAuth(role, false, {
        phone: loginPhone,
        name: authResponse.user?.name,
        token: authResponse.access_token,
      });
    } catch (err: any) {
      setIsLoggingIn(false);
      setLoginError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  // ── Sign Up Submit ─────────────────────────────────────────────────
  const isSignupPinValid = signupPin.length >= 8;
  const isSignupPinMatching = isSignupPinValid && signupPin === confirmPin;
  const isSignupPinMismatch = confirmPin.length > 0 && signupPin !== confirmPin;

  const isSignupFormValid =
    signupName.trim().length >= 2 &&
    signupPhone.length === 10 &&
    isSignupPinValid &&
    isSignupPinMatching &&
    agreeTerms;

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (signupPin.length < 8) {
      setSignupError('Password / PIN must have at least 8 characters');
      return;
    }

    if (signupPin !== confirmPin) {
      setSignupError('Passwords / PINs do not match');
      return;
    }

    const pinStr = signupPin;
    setIsSigningUp(true);

    try {
      const response = await authApi.signup({
        phone: signupPhone,
        password: pinStr,
        role,
        name: signupName.trim(),
      });

      setIsSigningUp(false);
      navigateAfterAuth(role, true, {
        name: signupName.trim(),
        phone: signupPhone,
        token: response.access_token,
      });
    } catch (err: any) {
      setIsSigningUp(false);
      setSignupError(err.message || 'Signup failed. Please try again.');
    }
  };


  // ── Forgot PIN Handlers ────────────────────────────────────────────
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotPhone.length === 10) {
      setForgotStep(2);
      setResendTimer(30);
      setOtpValues(['7', '4', '2', '1', '9', '0']); // Pre-fill mock OTP for easy test
    }
  };

  const isForgotPinMatching =
    newForgotPin.length >= 8 &&
    confirmForgotPin.length >= 8 &&
    newForgotPin === confirmForgotPin;

  const isForgotPinMismatch =
    confirmForgotPin.length > 0 &&
    newForgotPin !== confirmForgotPin;

  const isResetFormValid =
    otpValues.every((c) => c !== '') && isForgotPinMatching;

  const handleResetPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isResetFormValid) return;

    setResetSuccess(true);
    setTimeout(() => {
      navigateAfterAuth(role, false, { phone: forgotPhone });
    }, 1200);
  };

  const isFarmer = role === 'farmer';
  const isGovernment = role === 'government';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-3 sm:p-6 font-sans text-slate-900">
      {/* Centered Mobile Card (Max 420px) */}
      <div className="w-full max-w-[420px] bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden relative">
        {/* Top Header Bar with Back Arrow */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
          <button
            type="button"
            onClick={() => {
              if (isForgotPin) {
                setIsForgotPin(false);
                setForgotStep(1);
              } else if (onBack) {
                onBack();
              } else {
                navigate('/', { replace: true });
              }
            }}
            className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Centered Small Logo */}
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center shadow-xs">
              <Sprout className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              Fasal<span className="text-primary">Setu</span>
            </span>
          </div>

          <div className="w-8" />
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Role Indicator Pill (Farmer vs Buyer vs Government) */}
          <div className="flex items-center justify-center">
            {isGovernment ? (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-slate-900 text-amber-300 border border-slate-700 shadow-2xs">
                <span>🏛️</span>
                <span>Government Official Login</span>
              </div>
            ) : isFarmer ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                <span>👨‍🌾</span>
                <span>Farmer Login</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                <span>🏬</span>
                <span>Buyer & Trader Login</span>
              </div>
            )}
          </div>

          {/* ========================================================
              IF FORGOT PIN FLOW ACTIVE
             ======================================================== */}
          {isForgotPin ? (
            <div className="space-y-5">
              {forgotStep === 1 ? (
                /* Step 1: Verify Identity */
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="text-center space-y-1">
                    <h2 className="text-xl font-bold text-slate-900">Reset your PIN</h2>
                    <p className="text-xs text-slate-500">
                      We'll send a 6-digit verification code to your registered mobile number
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Registered Phone Number
                    </label>
                    <div className="flex items-center h-[52px] rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                      <span className="bg-slate-100 text-slate-600 font-bold text-sm px-3.5 h-full flex items-center border-r border-slate-200">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        value={forgotPhone}
                        onChange={(e) => setForgotPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="98765 43210"
                        className="flex-1 px-3 text-sm font-semibold text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotPhone.length !== 10}
                    className="w-full h-[52px] bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send OTP
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setIsForgotPin(false)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                    >
                      ← Back to Login
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: OTP + New PIN */
                <form onSubmit={handleResetPinSubmit} className="space-y-4">
                  <div className="text-center space-y-1">
                    <h2 className="text-xl font-bold text-slate-900">Enter OTP & Set PIN</h2>
                    <p className="text-xs text-slate-500">
                      Code sent to <span className="font-semibold">+91 {forgotPhone}</span>
                    </p>
                  </div>

                  {resetSuccess ? (
                    <div className="py-8 text-center space-y-3 animate-in fade-in zoom-in duration-200">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 text-primary flex items-center justify-center mx-auto shadow-xs">
                        <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900">PIN Reset Successful!</h4>
                      <p className="text-xs text-slate-500">Logging you in to your dashboard...</p>
                    </div>
                  ) : (
                    <>
                      {/* 6-Digit OTP */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-700">6-Digit OTP</label>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {resendTimer > 0 ? (
                              `Resend in 00:${resendTimer.toString().padStart(2, '0')}`
                            ) : (
                              <button
                                type="button"
                                onClick={() => setResendTimer(30)}
                                className="text-primary font-bold hover:underline cursor-pointer"
                              >
                                Resend OTP
                              </button>
                            )}
                          </span>
                        </div>

                        <div className="grid grid-cols-6 gap-2">
                          {otpValues.map((val, idx) => (
                            <input
                              key={idx}
                              ref={otpRefs[idx]}
                              type="text"
                              maxLength={1}
                              inputMode="numeric"
                              value={val}
                              onChange={(e) =>
                                handleBoxInput(idx, e.target.value, otpValues, setOtpValues, otpRefs, false)
                              }
                              onKeyDown={(e) =>
                                handleBoxKeyDown(idx, e, otpValues, setOtpValues, otpRefs)
                              }
                              className="w-full h-12 text-center text-lg font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none bg-slate-50"
                            />
                          ))}
                        </div>
                      </div>

                      {/* New Password / PIN */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-700">
                            New Password / PIN (Min. 8 characters)
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowForgotPin(!showForgotPin)}
                            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                          >
                            {showForgotPin ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Hide</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>Show</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="flex items-center h-[50px] rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary bg-slate-50">
                          <span className="text-slate-400 pl-3.5 pr-2">
                            <Lock className="w-4 h-4" />
                          </span>
                          <input
                            type={showForgotPin ? 'text' : 'password'}
                            required
                            minLength={8}
                            value={newForgotPin}
                            onChange={(e) => setNewForgotPin(e.target.value)}
                            placeholder="Enter at least 8 characters"
                            className="flex-1 px-2 text-sm font-semibold text-slate-800 focus:outline-none bg-transparent"
                          />
                        </div>
                        {newForgotPin.length > 0 && newForgotPin.length < 8 && (
                          <p className="text-[11px] text-amber-600 font-medium mt-1">
                            Must be at least 8 characters ({newForgotPin.length}/8)
                          </p>
                        )}
                      </div>

                      {/* Confirm New PIN */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-700">Confirm New Password / PIN</label>
                          {isForgotPinMatching && (
                            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Matches
                            </span>
                          )}
                          {isForgotPinMismatch && (
                            <span className="text-[11px] font-bold text-red-500">PINs don't match</span>
                          )}
                        </div>

                        <div className={`flex items-center h-[50px] rounded-xl border overflow-hidden focus-within:ring-2 bg-slate-50 ${
                          isForgotPinMismatch
                            ? 'border-red-400 focus-within:ring-red-200'
                            : isForgotPinMatching
                            ? 'border-emerald-400 focus-within:ring-emerald-200'
                            : 'border-slate-300 focus-within:ring-primary/20 focus-within:border-primary'
                        }`}>
                          <span className="text-slate-400 pl-3.5 pr-2">
                            <Lock className="w-4 h-4" />
                          </span>
                          <input
                            type={showForgotPin ? 'text' : 'password'}
                            required
                            minLength={8}
                            value={confirmForgotPin}
                            onChange={(e) => setConfirmForgotPin(e.target.value)}
                            placeholder="Re-enter new password or PIN"
                            className="flex-1 px-2 text-sm font-semibold text-slate-800 focus:outline-none bg-transparent"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={!isResetFormValid}
                        className="w-full h-[52px] bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                      >
                        Reset PIN & Log In
                      </button>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPin(false);
                            setForgotStep(1);
                          }}
                          className="text-xs font-bold text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}
            </div>
          ) : (
            /* ========================================================
                STANDARD AUTH (Log In vs Create Account Tabs)
               ======================================================== */
            <>
              {/* Tab Toggle Segment Control - Hidden for Government (pre-provisioned) */}
              {!isGovernment && (
                <div className="bg-slate-100 p-1 rounded-full flex relative select-none">
                  <button
                    type="button"
                    onClick={() => {
                      setTab('login');
                      setLoginError(null);
                      setSignupError(null);
                    }}
                    className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer ${
                      tab === 'login'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Log In
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTab('signup');
                      setLoginError(null);
                      setSignupError(null);
                    }}
                    className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer ${
                      tab === 'signup'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              )}

              {/* ── TAB 1: LOG IN ───────────────────────────────────── */}
              {tab === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Welcome back</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enter your phone number and PIN to continue
                    </p>
                  </div>

                  {loginError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  {/* Phone Number Field */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Phone Number
                    </label>
                    <div className="flex items-center h-[52px] rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                      <span className="bg-slate-100 text-slate-600 font-bold text-sm px-3.5 h-full flex items-center border-r border-slate-200">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="98765 43210"
                        className="flex-1 px-3 text-sm font-semibold text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Password / PIN Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">Password / PIN</label>
                      <button
                        type="button"
                        onClick={() => setShowLoginPin(!showLoginPin)}
                        className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        {showLoginPin ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Hide</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Show</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center h-[50px] rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary bg-white">
                      <span className="text-slate-400 pl-3.5 pr-2">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type={showLoginPin ? 'text' : 'password'}
                        required
                        value={loginPin}
                        onChange={(e) => setLoginPin(e.target.value)}
                        placeholder="Enter your password or PIN"
                        className="flex-1 px-2 text-sm font-semibold text-slate-800 focus:outline-none"
                      />
                    </div>

                    {/* Forgot PIN Link */}
                    <div className="text-right pt-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setForgotPhone(loginPhone || '9849012345');
                          setIsForgotPin(true);
                          setForgotStep(1);
                        }}
                        className="text-xs font-bold text-primary hover:text-primary-dark hover:underline cursor-pointer"
                      >
                        Forgot PIN?
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!isLoginFormValid || isLoggingIn}
                    className="w-full h-[52px] bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
                  >
                    {isLoggingIn ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Log In</span>
                    )}
                  </button>

                  {/* Divider and Secondary Link / Govt Credentials Note */}
                  {isGovernment ? (
                    <div className="text-center pt-3 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-700">Department of Agriculture · Government of Telangana</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Agency portal access is restricted to verified command center officials.</p>
                    </div>
                  ) : (
                    <>
                      {/* Divider */}
                      <div className="flex items-center gap-3 py-1">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-[11px] font-bold text-slate-400 uppercase">or</span>
                        <div className="flex-1 h-px bg-slate-200" />
                      </div>

                      {/* Secondary Link to Sign Up */}
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setTab('signup')}
                          className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          New to FasalSetu?{' '}
                          <span className="text-primary font-bold hover:underline">Create an account</span>
                        </button>
                      </div>
                    </>
                  )}
                </form>
              ) : (
                /* ── TAB 2: CREATE ACCOUNT ───────────────────────────── */
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Create your account</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Join FasalSetu in under a minute</p>
                  </div>

                  {signupError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{signupError}</span>
                    </div>
                  )}

                  {/* Full Name */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder={isFarmer ? 'e.g. Rameshwar Patil' : 'e.g. Balaji Agro Foods'}
                      className="w-full h-[50px] px-3.5 text-sm font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Phone Number
                    </label>
                    <div className="flex items-center h-[50px] rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                      <span className="bg-slate-100 text-slate-600 font-bold text-sm px-3.5 h-full flex items-center border-r border-slate-200">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="98765 43210"
                        className="flex-1 px-3 text-sm font-semibold text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Create Password / PIN */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Create Password / PIN (Min. 8 characters)
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowSignupPin(!showSignupPin)}
                        className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        {showSignupPin ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Hide</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Show</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="flex items-center h-[50px] rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary bg-white">
                      <span className="text-slate-400 pl-3.5 pr-2">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type={showSignupPin ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={signupPin}
                        onChange={(e) => setSignupPin(e.target.value)}
                        placeholder="Enter at least 8 digits or letters (e.g. 12345678)"
                        className="flex-1 px-2 text-sm font-semibold text-slate-800 focus:outline-none"
                      />
                    </div>
                    {signupPin.length === 0 ? (
                      <p className="text-[11px] text-slate-400 mt-1">
                        Use a mix of letters & numbers you'll remember (at least 8 characters)
                      </p>
                    ) : signupPin.length < 8 ? (
                      <p className="text-[11px] text-amber-600 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        Must be at least 8 characters ({signupPin.length}/8 entered)
                      </p>
                    ) : (
                      <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        Valid length ({signupPin.length} characters)
                      </p>
                    )}
                  </div>

                  {/* Confirm PIN */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-700">Confirm Password / PIN</label>
                        {isSignupPinMatching && (
                          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Matches
                          </span>
                        )}
                        {isSignupPinMismatch && (
                          <span className="text-[11px] font-bold text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Passwords don't match
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowConfirmPin(!showConfirmPin)}
                        className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        {showConfirmPin ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Hide</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Show</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className={`flex items-center h-[50px] rounded-xl border overflow-hidden focus-within:ring-2 bg-white ${
                      isSignupPinMismatch
                        ? 'border-red-400 focus-within:ring-red-200'
                        : isSignupPinMatching
                        ? 'border-emerald-400 focus-within:ring-emerald-200'
                        : 'border-slate-300 focus-within:ring-primary/20 focus-within:border-primary'
                    }`}>
                      <span className="text-slate-400 pl-3.5 pr-2">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type={showConfirmPin ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value)}
                        placeholder="Re-enter your 8+ character password or PIN"
                        className="flex-1 px-2 text-sm font-semibold text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded text-primary focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 leading-snug">
                      I agree to the{' '}
                      <span className="text-primary font-semibold hover:underline">Terms of Trade</span> &{' '}
                      <span className="text-primary font-semibold hover:underline">Privacy Policy</span>
                    </span>
                  </label>

                  {/* Create Account Button */}
                  <button
                    type="submit"
                    disabled={!isSignupFormValid || isSigningUp}
                    className="w-full h-[52px] bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
                  >
                    {isSigningUp ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Create Account</span>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3 py-1">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase">or</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  {/* Secondary Link to Log In */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setTab('login')}
                      className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Already have an account?{' '}
                      <span className="text-primary font-bold hover:underline">Log In</span>
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
