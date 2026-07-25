import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
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
  const [role, setRole] = useState('jobseeker');
  const [showPassword, setShowPassword] = useState(false);
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [isFormTouched, setIsFormTouched] = useState({ name: false, email: false, password: false });
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validate form in real-time
  useEffect(() => {
    let nameErr = '';
    let emailErr = '';
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
    setPasswordError(passwordErr);

    setIsValid(
      name.trim() && 
      email && 
      validators.email(email) && 
      password.length >= 8 &&
      PASSWORD_STRENGTH_REGEX.test(password) &&
      !nameErr &&
      !emailErr &&
      !passwordErr
    );
  }, [name, email, password, isFormTouched]);

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
        email: email,
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
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center">Create Account</h2>
        <p className="text-sm text-slate-500 text-center">Get started as a job seeker or recruiter</p>
      </div>

      {successMessage && (
        <div className="p-3.5 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl">
          {successMessage}
        </div>
      )}

      <div className="space-y-4">
        {/* Name Input */}
        <Input
          label="Full Name"
          id="name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => handleBlur('name')}
          error={nameError}
          autoComplete="name"
          disabled={isLoading}
          required
        />

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
          disabled={isLoading}
          required
        />

        {/* Role Selection Dropdown */}
        <div className="w-full space-y-1.5">
          <label htmlFor="role" className="block text-xs font-semibold text-slate-700 select-none">
            Register As
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="jobseeker">Job Seeker</option>
            <option value="recruiter">Recruiter</option>
          </select>
        </div>

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
            autoComplete="new-password"
            disabled={isLoading}
            required
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            className="absolute right-3 top-[34px] p-1.5 text-slate-400 hover:text-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {formError && (
        <div className="p-3.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl">
          <ErrorMessage message={formError} className="mt-0" />
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!isValid}
        isLoading={isLoading}
        className="w-full py-3"
      >
        Sign Up
      </Button>

      {/* Redirect Login footer */}
      <p className="text-sm text-center text-slate-500">
        Already have an account?{' '}
        <Link 
          to="/login" 
          className="font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Sign In
        </Link>
      </p>
    </form>
  );
}

export default Register;
