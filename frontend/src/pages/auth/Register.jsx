import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, Briefcase, ChevronDown, ArrowRight } from 'lucide-react';
import { validators } from '@/utils/validators';
import { extractErrorMessage, mapRegistrationError, parseFormErrors } from '@/utils/errorParser';
import ErrorMessage from '@/components/common/ErrorMessage';
import { authService } from '@/services/auth/authService';

const PASSWORD_STRENGTH_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [roleError, setRoleError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [isFormTouched, setIsFormTouched] = useState({ name: false, email: false, role: false, password: false });
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validate form in real-time
  useEffect(() => {
    let nameErr = '';
    let emailErr = '';
    let roleErr = '';
    let passwordErr = '';

    if (isFormTouched.name) {
      if (!name.trim()) {
        nameErr = 'Full name is required';
      }
    }

    if (isFormTouched.email) {
      if (!email) {
        emailErr = 'Email is required';
      } else if (!validators.email(email)) {
        emailErr = 'Please enter a valid email address.';
      }
    }

    if (isFormTouched.role) {
      if (!role) {
        roleErr = 'Please select your role';
      }
    }

    if (isFormTouched.password) {
      if (!password) {
        passwordErr = 'Password is required';
      } else if (password.length < 8) {
        passwordErr = 'Password must be at least 8 characters';
      } else if (!PASSWORD_STRENGTH_REGEX.test(password)) {
        passwordErr = 'Must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special char (@$!%*?&)';
      }
    }

    setNameError(nameErr);
    setEmailError(emailErr);
    setRoleError(roleErr);
    setPasswordError(passwordErr);

    setIsValid(
      name.trim() &&
      email &&
      validators.email(email) &&
      role &&
      password.length >= 8 &&
      PASSWORD_STRENGTH_REGEX.test(password) &&
      !nameErr &&
      !emailErr &&
      !roleErr &&
      !passwordErr
    );
  }, [name, email, role, password, isFormTouched]);

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
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        role: role
      };

      await authService.register(payload);

      setSuccessMessage('Registration successful! Redirecting to login page...');

      // Delay redirect to let the user see the success message
      setTimeout(() => {
        setIsLoading(false);
        navigate('/login');
      }, 2000);
    } catch (error) {
      setIsLoading(false);

      const fieldErrors = parseFormErrors(error);
      if (fieldErrors) {
        let hasFieldErrors = false;
        if (fieldErrors.name) {
          setNameError(fieldErrors.name);
          hasFieldErrors = true;
        }
        if (fieldErrors.email) {
          setEmailError('Please enter a valid email address.');
          hasFieldErrors = true;
        }
        if (fieldErrors.role) {
          setRoleError(fieldErrors.role);
          hasFieldErrors = true;
        }
        if (fieldErrors.password) {
          setPasswordError(fieldErrors.password);
          hasFieldErrors = true;
        }

        if (hasFieldErrors) {
          setFormError('Please correct the validation errors below.');
        } else {
          setFormError('Validation error. Please verify input data.');
        }
      } else {
        const rawError = extractErrorMessage(error);
        const mappedError = mapRegistrationError(rawError);
        setFormError(mappedError);
      }
    }
  };

  return (
    <div>
      {/* Header Section */}
      <div className="text-center mb-7">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create Account
        </h1>
        <p className="text-sm text-slate-500 font-normal mt-1.5">
          Get started as a job seeker or recruiter
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
        {/* Full Name Input */}
        <div>
          <label htmlFor="name" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            FULL NAME <span className="text-red-500 font-bold">*</span>
          </label>
          <div className="relative">
            <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => handleBlur('name')}
              autoComplete="name"
              disabled={isLoading}
              required
              className={`w-full pl-11 pr-4 py-3 bg-[#f8fafc] text-slate-900 text-sm rounded-xl border ${
                nameError 
                  ? 'border-red-400 focus:ring-red-400/20' 
                  : 'border-slate-200/80 focus:border-blue-600 focus:ring-blue-600/10'
              } focus:bg-white focus:ring-4 focus:outline-none transition-all placeholder:text-slate-400 font-normal`}
            />
          </div>
          {nameError && <p className="text-xs text-red-500 mt-1 font-medium">{nameError}</p>}
        </div>

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

        {/* Role Selection Dropdown */}
        <div>
          <label htmlFor="role" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            REGISTER AS <span className="text-red-500 font-bold">*</span>
          </label>
          <div className="relative">
            <Briefcase className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
            <select
              id="role"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setIsFormTouched((prev) => ({ ...prev, role: true }));
              }}
              onBlur={() => handleBlur('role')}
              disabled={isLoading}
              required
              className={`w-full pl-11 pr-10 py-3 bg-[#f8fafc] ${
                role ? 'text-slate-900' : 'text-slate-400'
              } text-sm rounded-xl border ${
                roleError 
                  ? 'border-red-400 focus:ring-red-400/20' 
                  : 'border-slate-200/80 focus:border-blue-600 focus:ring-blue-600/10'
              } focus:bg-white focus:ring-4 focus:outline-none transition-all font-normal cursor-pointer appearance-none`}
            >
              <option value="" disabled hidden>
                Select
              </option>
              <option value="jobseeker" className="text-slate-900">
                Job Seeker
              </option>
              <option value="recruiter" className="text-slate-900">
                Recruiter
              </option>
            </select>
            <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          {roleError && <p className="text-xs text-red-500 mt-1 font-medium">{roleError}</p>}
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              autoComplete="new-password"
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

        {/* Submit Button */}
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
              <span>Creating account...</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </button>

        {/* Divider */}
        <div className="relative py-3 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200/80"></div>
          </div>
          <span className="relative bg-white px-3 text-xs font-normal text-slate-400">or</span>
        </div>

        {/* Footer Link */}
        <p className="text-sm text-center text-slate-500 font-normal pt-1">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
          >
            Sign In <ArrowRight className="w-4 h-4" />
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;

