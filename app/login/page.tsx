'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Role } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const { login, verify2FA, setPendingUser } = useAuth();

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

  // Asegurar que la pantalla de login siempre use la identidad visual Morado Starken oficial
  useEffect(() => {
    const prevTheme = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', 'purple');
    document.documentElement.classList.remove('dark');
    return () => {
      if (prevTheme) {
        document.documentElement.setAttribute('data-theme', prevTheme);
        document.documentElement.classList.toggle('dark', prevTheme === 'dark');
      }
    };
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const isJefe =
      cleanEmail.includes('jefe') ||
      cleanEmail.includes('jefatura');
    const roleToAssign: Role = isJefe ? 'Jefatura' : 'Analista';

    const res = login(
      cleanEmail || (isJefe ? 'jefe@starken.cl' : 'analista@starken.cl'),
      password,
      roleToAssign
    );
    
    if (!res.success) {
      setErrorMsg(res.message || 'Error al iniciar sesión');
      return;
    }

    router.push('/');
    router.refresh();
  };

  const handleOtpChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);

    if (cleaned && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

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
    <div className="login-screen min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Orbs — exactamente los del prototipo oficial */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 520,
          height: 520,
          background: 'radial-gradient(circle, rgba(124,58,237,0.40) 0%, transparent 70%)',
          filter: 'blur(80px)',
          top: -160,
          left: -160,
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 420,
          height: 420,
          background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)',
          filter: 'blur(80px)',
          bottom: -100,
          right: -100,
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 280,
          height: 280,
          background: 'radial-gradient(circle, rgba(167,139,250,0.30) 0%, transparent 70%)',
          filter: 'blur(80px)',
          bottom: '20%',
          left: '10%',
        }}
      />

      {/* Grid Pattern Cuadriculado */}
      <div className="login-bg-grid" />

      {step === 'login' ? (
        <div className="login-card-exact">
          <div className="flex items-center gap-3">
            <div className="login-brand-sk">
              SK
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-gray-900 leading-none">Starken</h2>
              <span className="login-sub-brand block mt-1">
                Facturación Especial
              </span>
            </div>
          </div>

          <h1 className="login-headline-exact">Bienvenido de vuelta</h1>
          <p className="login-subline-exact">
            Ingresa a la plataforma de gestión de proformas comerciales.
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="login-label-exact">
                Correo electrónico
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@starken.cl"
                  className="login-input-exact"
                  required
                />
              </div>
            </div>

            <div>
              <label className="login-label-exact">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3.5 text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="login-input-exact"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 accent-purple-600"
                />
                <span className="text-[13px] text-gray-700">Recordar usuario</span>
              </label>
              <a href="#" className="login-link-purple">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              className="login-btn-primary"
            >
              Iniciar sesión
            </button>
          </form>
        </div>
      ) : (
        /* 2FA STEP */
        <div className="login-card-exact text-center">
          <div className="w-14 h-14 bg-purple-100 border border-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-600 shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-1">Verificación de Seguridad (2FA)</h2>
          <p className="text-sm text-gray-600 mb-6">
            Ingresa el código TOTP de 6 dígitos enviado a tu app autenticadora.
            <br />
            <span className="font-semibold text-purple-600">Código de prueba: 123456</span>
          </p>

          {otpError && (
            <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
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
                className="w-11 h-13 text-center text-lg font-bold bg-white border border-purple-900/20 rounded-lg text-purple-900 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
              />
            ))}
          </div>

          <button
            onClick={() => handleVerifyOtp(otp.join(''))}
            className="login-btn-primary mb-4"
          >
            Verificar e ingresar
          </button>

          <button
            onClick={() => {
              setStep('login');
              setPendingUser(null);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al inicio de sesión
          </button>
        </div>
      )}
    </div>
  );
}
