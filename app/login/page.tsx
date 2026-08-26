'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login, verify2FA, pendingUser, setPendingUser } = useAuth();

  // State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [step, setStep] = useState<'login' | '2fa'>('login');

  // 2FA state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const res = login(email, password);
    if (!res.success) {
      setErrorMsg(res.message || 'Error al iniciar sesión');
      return;
    }

    if (res.requires2FA) {
      setStep('2fa');
    } else {
      router.push('/');
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);

    // Auto-focus next input
    if (cleaned && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit if complete
    if (index === 5 && cleaned) {
      const fullCode = [...newOtp.slice(0, 5), cleaned].join('');
      if (fullCode.length === 6) {
        handleVerifyOtp(fullCode);
      }
    }
  };

  const handleVerifyOtp = (code: string) => {
    setOtpError(false);
    const ok = verify2FA(code);
    if (ok) {
      router.push('/');
    } else {
      setOtpError(true);
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-purple-100 via-gray-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 overflow-hidden">
      {/* Grid pattern overlay */}
      <div className="login-bg-grid" />

      {/* Orbs */}
      <div className="absolute w-[500px] h-[500px] bg-purple-400/30 dark:bg-purple-500/15 rounded-full blur-3xl -top-40 -left-40 animate-pulse pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-indigo-400/25 dark:bg-emerald-500/10 rounded-full blur-3xl -bottom-30 -right-30 animate-pulse pointer-events-none" />
      <div className="absolute w-[280px] h-[280px] bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl bottom-1/4 left-10 animate-pulse pointer-events-none" />

      {step === 'login' ? (
        <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-purple-900/10 dark:border-white/10 rounded-2xl p-9 shadow-2xl relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center font-extrabold text-white text-lg shadow-lg">
              SK
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-none">Starken</h2>
              <span className="text-[10px] font-semibold text-purple-600 dark:text-emerald-400 uppercase tracking-widest leading-tight">
                Facturación Especial
              </span>
            </div>
          </div>

          <h1 className="text-h1 font-bold text-gray-900 dark:text-gray-100 mb-1">Bienvenido de vuelta</h1>
          <p className="text-caption text-gray-600 dark:text-gray-400 mb-6">
            Ingresa a la plataforma de gestión de proformas comerciales.
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg flex items-center gap-2 text-body text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-eyebrow font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Correo electrónico
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@starken.cl"
                  className="w-full h-11 pl-10 pr-3 bg-white/80 dark:bg-slate-800/60 border border-purple-900/15 dark:border-white/10 rounded-lg text-body text-gray-900 dark:text-gray-100 outline-none focus:border-purple-600 dark:focus:border-emerald-400 focus:ring-2 focus:ring-purple-600/10 dark:focus:ring-emerald-400/10 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-eyebrow font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3 text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-10 bg-white/80 dark:bg-slate-800/60 border border-purple-900/15 dark:border-white/10 rounded-lg text-body text-gray-900 dark:text-gray-100 outline-none focus:border-purple-600 dark:focus:border-emerald-400 focus:ring-2 focus:ring-purple-600/10 dark:focus:ring-emerald-400/10 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-body">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 dark:border-slate-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-600 dark:text-gray-400">Recordar usuario</span>
              </label>
              <a href="#" className="font-medium text-purple-600 dark:text-emerald-400 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-emerald-500 dark:to-teal-500 text-white font-semibold text-body rounded-lg shadow-md hover:from-purple-700 hover:to-indigo-700 dark:hover:from-emerald-600 dark:hover:to-teal-600 transition-all transform active:scale-[0.99]"
            >
              Iniciar sesión
            </button>
          </form>
        </div>
      ) : (
        /* 2FA STEP */
        <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-purple-900/10 dark:border-white/10 rounded-2xl p-9 shadow-2xl relative z-10 text-center">
          <div className="w-14 h-14 bg-purple-100 dark:bg-emerald-500/10 border border-purple-200 dark:border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-600 dark:text-emerald-400">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <h2 className="text-h2 font-semibold text-gray-900 dark:text-gray-100 mb-1">Verificación de Seguridad (2FA)</h2>
          <p className="text-caption text-gray-600 dark:text-gray-400 mb-6">
            Ingresa el código TOTP de 6 dígitos enviado a tu app autenticadora.
            <br />
            <span className="font-semibold text-purple-600 dark:text-emerald-400">Código de prueba: 123456</span>
          </p>

          {otpError && (
            <div className="mb-4 p-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg text-body text-red-600 dark:text-red-400">
              Código incorrecto. Intenta con 123456.
            </div>
          )}

          <div className="flex gap-2 justify-center mb-6">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                className="w-11 h-13 text-center text-lg font-bold bg-white dark:bg-slate-800 border border-purple-900/20 dark:border-white/10 rounded-lg text-purple-900 dark:text-gray-100 focus:border-purple-600 dark:focus:border-emerald-400 focus:ring-2 focus:ring-purple-600/10 dark:focus:ring-emerald-400/10 outline-none transition-all"
              />
            ))}
          </div>

          <button
            onClick={() => handleVerifyOtp(otp.join(''))}
            className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-emerald-500 dark:to-teal-500 text-white font-semibold text-body rounded-lg shadow-md hover:from-purple-700 hover:to-indigo-700 dark:hover:from-emerald-600 dark:hover:to-teal-600 transition-all mb-4"
          >
            Verificar e ingresar
          </button>

          <button
            onClick={() => {
              setStep('login');
              setPendingUser(null);
            }}
            className="inline-flex items-center gap-1.5 text-caption font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al inicio de sesión
          </button>
        </div>
      )}
    </div>
  );
}
