import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { validators } from '@/utils/validators';
import { extractErrorMessage, mapLoginError, parseFormErrors } from '@/utils/errorParser';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useAuth } from '@/hooks/useAuth';

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [isFormTouched, setIsFormTouched] = useState({ email: false, password: false });
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validate form in real-time
  useEffect(() => {
    let emailErr = '';
    let passwordErr = '';

    if (isFormTouched.email) {
      if (!email) {
        emailErr = 'Email is required';
      } else if (!validators.email(email)) {
        emailErr = 'Please enter a valid email address';
      }
    }

    if (isFormTouched.password) {
      if (!password) {
        passwordErr = 'Password is required';
      } else if (password.length < 8) {
        passwordErr = 'Password must be at least 8 characters';
      }
    }

    setEmailError(emailErr);
    setPasswordError(passwordErr);

    setIsValid(
      email && 
      password && 
      validators.email(email) && 
      password.length >= 8 &&
      !emailErr &&
      !passwordErr
    );
  }, [email, password, isFormTouched]);

  const handleBlur = (field) => {
    setIsFormTouched((prev) => ({ ...prev, [field]: true }));
  };

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'session_expired') {
      setFormError('Your session has expired. Please log in again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || isLoading) return;

    setIsLoading(true);
    setFormError('');
    setSuccessMessage('');

    try {
      const credentials = {
        email: email.trim().toLowerCase(),
        password: password
      };

      const authData = await login(credentials);
      
      setSuccessMessage('Login successful! Redirecting...');
      
      setTimeout(() => {
        setIsLoading(false);
        const userRole = authData?.user?.role;
        let defaultRedirect = '/dashboard';
        if (userRole === 'recruiter') defaultRedirect = '/recruiter';
        else if (userRole === 'admin') defaultRedirect = '/admin/dashboard';
        else if (userRole === 'company_owner') defaultRedirect = '/company';

        const redirectTo = searchParams.get('redirect') || defaultRedirect;
        navigate(redirectTo);
      }, 1000);
    } catch (error) {
      console.error("DEBUG Login catch block caught error:", error);
      setIsLoading(false);
      
      const fieldErrors = parseFormErrors(error);
      if (fieldErrors) {
        if (fieldErrors.email) setEmailError(fieldErrors.email);
        if (fieldErrors.password) setPasswordError(fieldErrors.password);
        setFormError('Validation error. Please verify input data.');
      } else {
        const rawError = extractErrorMessage(error);
        const mappedError = mapLoginError(rawError);
        setFormError(mappedError);
      }
    }
  };

  return (
    <div>
      {/* Header Section */}
      <div className="text-center mb-7">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome Back!
        </h1>
        <p className="text-sm text-slate-500 font-normal mt-1.5">
          Sign in to your account and continue your journey
        </p>
      </div>

      {successMessage && (
        <div className="mb-5 p-3.5 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl">
          {successMessage}
        </div>
      )}

      {formError && (
        <div className="mb-5 p-3.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl">
          <ErrorMessage message={formError} className="mt-0" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email Address Input */}
        <div>
          <label htmlFor="email" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            EMAIL ADDRESS <span className="text-red-500 font-bold">*</span>
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              autoComplete="email"
              disabled={isLoading}
              required
              className={`w-full pl-11 pr-4 py-3 bg-[#f8fafc] text-slate-900 text-sm rounded-xl border ${
                emailError 
                  ? 'border-red-400 focus:ring-red-400/20' 
                  : 'border-slate-200/80 focus:border-blue-600 focus:ring-blue-600/10'
              } focus:bg-white focus:ring-4 focus:outline-none transition-all placeholder:text-slate-400 font-normal`}
            />
          </div>
          {emailError && <p className="text-xs text-red-500 mt-1 font-medium">{emailError}</p>}
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            PASSWORD <span className="text-red-500 font-bold">*</span>
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              autoComplete="current-password"
              disabled={isLoading}
              required
              className={`w-full pl-11 pr-11 py-3 bg-[#f8fafc] text-slate-900 text-sm rounded-xl border ${
                passwordError 
                  ? 'border-red-400 focus:ring-red-400/20' 
                  : 'border-slate-200/80 focus:border-blue-600 focus:ring-blue-600/10'
              } focus:bg-white focus:ring-4 focus:outline-none transition-all placeholder:text-slate-400 font-normal`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 focus:outline-none disabled:opacity-50"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {passwordError && <p className="text-xs text-red-500 mt-1 font-medium">{passwordError}</p>}
        </div>

        {/* Forgot Password Link */}
        <div className="flex justify-end pt-1">
          <Link 
            to="#"
            onClick={(e) => { e.preventDefault(); setFormError('Forgot password recovery is not supported at this time.'); }}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button - Sign In WITHOUT arrow symbol */}
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base rounded-xl shadow-lg shadow-blue-600/30 focus:outline-none focus:ring-4 focus:ring-blue-600/25 transition-all duration-200 disabled:bg-blue-600 disabled:opacity-80 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>

        {/* Divider */}
        <div className="relative py-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200/80"></div>
          </div>
          <span className="relative bg-white px-3 text-xs font-normal text-slate-400">or</span>
        </div>

        {/* Footer Link */}
        <p className="text-sm text-center text-slate-500 font-normal pt-1">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;

