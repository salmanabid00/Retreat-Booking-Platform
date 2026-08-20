import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import PasswordStrengthIndicator, { checkPasswordRules } from '../components/common/PasswordStrengthIndicator';
import ErrorBanner from '../components/common/ErrorBanner';
import { Mail, Lock, User, Phone, Sparkles, UserPlus, Home, UserCheck, Send, RefreshCw } from 'lucide-react';
import API from '../api/axios';

// ─── Verification Sent Screen ─────────────────────────────────────────────────

const VerificationSentScreen = ({ email, role }) => {
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(false);
  const navigate = useNavigate();

  const handleResend = async () => {
    if (resendCooldown) return;
    setResending(true);
    try {
      const res = await API.post('/auth/resend-verification', { email });
      toast.success(res.data.message || 'Verification email resent!');
      setResendCooldown(true);
      setTimeout(() => setResendCooldown(false), 60000); // 60s cooldown in UI
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend. Please try again.';
      toast.error(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Animated Email Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-indigo-500/10 border-2 border-indigo-500/30 flex items-center justify-center animate-pulse">
            <Mail className="w-12 h-12 text-indigo-400" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Account Created!
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Check Your Email</h1>
          <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
            We sent a verification link to:
          </p>
          <p className="text-indigo-300 font-semibold text-base break-all">{email}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 text-left">
          <h3 className="text-sm font-semibold text-white">Next steps:</h3>
          <ol className="space-y-2 text-sm text-slate-400 list-none">
            {[
              'Open your email inbox',
              'Click "Verify My Email" in the Haven Hideaway email',
              'You\'ll be redirected to log in',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-xs flex items-center justify-center font-bold mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <p className="text-xs text-slate-500">
            The link expires in <span className="text-amber-400 font-medium">24 hours</span>. Check your spam folder if you don't see it.
          </p>
        </div>

        {/* Resend Button */}
        <button
          onClick={handleResend}
          disabled={resending || resendCooldown}
          className="w-full py-3 rounded-xl border border-slate-700 text-slate-300 hover:border-indigo-500 hover:text-white transition text-sm font-medium flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {resending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {resendCooldown ? 'Resend link sent — check your inbox' : resending ? 'Sending...' : 'Resend Verification Email'}
        </button>

        <p className="text-xs text-slate-500">
          Wrong email?{' '}
          <Link to="/register" className="text-indigo-400 hover:underline font-medium">
            Register again
          </Link>
          {' · '}
          <Link to="/login" className="text-indigo-400 hover:underline font-medium">
            Go to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

// ─── Register Form ────────────────────────────────────────────────────────────

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    phone: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmailFormat = (emailStr) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.email || !formData.password) {
      const msg = 'Please fill in all required fields.';
      setFormError(msg);
      toast.error(msg);
      return;
    }

    if (!validateEmailFormat(formData.email)) {
      const msg = 'Please enter a valid email address.';
      setFormError(msg);
      toast.error(msg);
      return;
    }

    const passwordRules = checkPasswordRules(formData.password);
    const failedRules = passwordRules.filter((r) => !r.satisfied);
    if (failedRules.length > 0) {
      const msg = `Password is missing: ${failedRules.map((r) => r.label).join(', ')}.`;
      setFormError(msg);
      toast.error('Password does not meet security requirements.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      const msg = 'Passwords do not match.';
      setFormError(msg);
      toast.error(msg);
      return;
    }

    try {
      setLoading(true);
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        bio: formData.bio,
      });

      // If backend returns requiresVerification, show the verification screen
      if (result?.requiresVerification) {
        setRegisteredEmail(formData.email);
        setVerificationSent(true);
        toast.success('Account created! Please check your email to verify.');
      }
    } catch (err) {
      // err.response?.data comes through because AuthContext re-throws the raw axios error
      const errorMsg = err.response?.data?.message || err.message || 'Registration failed.';
      setFormError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Show verification-sent screen after successful registration
  if (verificationSent) {
    return <VerificationSentScreen email={registeredEmail} role={formData.role} />;
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Join HavenHideaway
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Create Your Account</h1>
          <p className="text-sm text-slate-400">Join our sanctuary community as a guest or property owner</p>
        </div>

        {/* Form Container */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          <ErrorBanner message={formError} />

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                I want to join as:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'customer' })}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition cursor-pointer ${
                    formData.role === 'customer'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <UserCheck className="w-6 h-6 text-indigo-400" />
                  <div className="text-center">
                    <p className="text-sm font-semibold">Retreat Guest</p>
                    <p className="text-[10px] text-slate-400">Book & explore properties</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'owner' })}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition cursor-pointer ${
                    formData.role === 'owner'
                      ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Home className="w-6 h-6 text-emerald-400" />
                  <div className="text-center">
                    <p className="text-sm font-semibold">Property Host</p>
                    <p className="text-[10px] text-slate-400">List & manage retreats</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jane@gmail.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm"
                  required
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password Strength Visual Checklist */}
              <PasswordStrengthIndicator password={formData.password} />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl gradient-button text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Create Account
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
            Sign in instead
          </Link>
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;
