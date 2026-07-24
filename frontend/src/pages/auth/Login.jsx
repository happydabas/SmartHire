import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { validators } from '@/utils/validators';
import { extractErrorMessage, mapLoginError } from '@/utils/errorParser';
import { useAuth } from '@/hooks/useAuth';

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || isLoading) return;

    setIsLoading(true);
    setFormError('');
    setSuccessMessage('');

    try {
      const credentials = {
        email: email,
        password: password
      };

      await login(credentials);
      
      setSuccessMessage('Login successful! Redirecting...');
      
      setTimeout(() => {
        setIsLoading(false);
        const redirectTo = searchParams.get('redirect') || '/dashboard';
        navigate(redirectTo);
      }, 1500);
    } catch (error) {
      console.error("DEBUG Login catch block caught error:", error);
      console.error("DEBUG Login error.response:", error?.response);
      console.error("DEBUG Login error.response?.data:", error?.response?.data);
      setIsLoading(false);
      const rawError = extractErrorMessage(error);
      console.error("DEBUG Login rawError:", rawError);
      const mappedError = mapLoginError(rawError);
      console.error("DEBUG Login mappedError:", mappedError);
      setFormError(mappedError);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center">Welcome Back</h2>
        <p className="text-sm text-slate-500 text-center">Enter your details to manage your profile</p>
      </div>

      {successMessage && (
        <div className="p-3.5 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl">
          {successMessage}
        </div>
      )}

      <div className="space-y-4">
        {/* Email Input */}
        <Input
          label="Email Address"
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleBlur('email')}
          error={emailError}
          autoComplete="email"
          required
        />

        {/* Password Input with Visibility Toggle */}
        <div className="relative w-full">
          <Input
            label="Password"
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => handleBlur('password')}
            error={passwordError}
            autoComplete="current-password"
            required
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[34px] p-1.5 text-slate-400 hover:text-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Remember Me & Forgot Password Links */}
      <div className="flex items-center justify-between text-sm select-none">
        <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500/20 cursor-pointer"
          />
          <span>Remember me</span>
        </label>
        
        <Link 
          to="#"
          onClick={(e) => { e.preventDefault(); setFormError('Forgot password recovery is not supported at this time.'); }}
          className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      {formError && (
        <div className="p-3.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl">
          {formError}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!isValid}
        isLoading={isLoading}
        className="w-full py-3"
      >
        Sign In
      </Button>

      {/* Redirect Register footer */}
      <p className="text-sm text-center text-slate-500">
        Don't have an account?{' '}
        <Link 
          to="/register" 
          className="font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Get Started
        </Link>
      </p>
    </form>
  );
}

export default Login;
