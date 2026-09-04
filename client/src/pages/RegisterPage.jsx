import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import PasswordStrengthIndicator, { checkPasswordRules } from '../components/common/PasswordStrengthIndicator';
import ErrorBanner from '../components/common/ErrorBanner';
import { Mail, Lock, User, Phone, Sparkles, UserPlus, Home, UserCheck, Send, RefreshCw, ArrowRight } from 'lucide-react';
import API from '../api/axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../components/ui/card';

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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 text-center relative z-10">
        {/* Animated Email Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center animate-pulse shadow-lg shadow-amber-500/10">
            <Mail className="w-10 h-10 text-amber-400" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Account Created!
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-100 tracking-tight font-serif">Check Your Email</h1>
          <p className="text-xs sm:text-sm text-stone-400 max-w-xs mx-auto leading-relaxed">
            We sent a verification link to:
          </p>
          <p className="text-amber-300 font-semibold text-sm break-all">{email}</p>
        </div>

        <Card className="border-stone-800/80 bg-stone-900/70 backdrop-blur-xl p-6 text-left space-y-4">
          <h3 className="text-xs font-bold text-stone-200 uppercase tracking-wider">Next steps:</h3>
          <ol className="space-y-2.5 text-xs text-stone-300 list-none">
            {[
              'Open your email inbox',
              'Click "Verify My Email" in the HavenHideaway email',
              'You\'ll be redirected to log in',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-center font-bold mt-0.5">
                  {i + 1}
                </span>
                <span className="text-stone-300">{step}</span>
              </li>
            ))}
          </ol>
          <p className="text-[11px] text-stone-400 pt-2 border-t border-stone-800">
            The link expires in <span className="text-amber-400 font-medium">24 hours</span>. Check your spam folder if you don't see it.
          </p>
        </Card>

        {/* Resend Button */}
        <Button
          variant="outline"
          onClick={handleResend}
          disabled={resending || resendCooldown}
          className="w-full h-11 border-stone-800 text-stone-200 hover:text-amber-300 hover:border-amber-500/40"
        >
          {resending ? (
            <div className="w-4 h-4 border-2 border-stone-400/30 border-t-stone-200 rounded-full animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 text-amber-400" />
          )}
          {resendCooldown ? 'Resend link sent — check your inbox' : resending ? 'Sending...' : 'Resend Verification Email'}
        </Button>

        <p className="text-xs text-stone-400">
          Wrong email?{' '}
          <Link to="/register" className="text-amber-400 hover:underline font-medium">
            Register again
          </Link>
          {' · '}
          <Link to="/login" className="text-amber-400 hover:underline font-medium">
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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Join HavenHideaway
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-100 tracking-tight font-serif">
            Create Your Account
          </h1>
          <p className="text-xs sm:text-sm text-stone-400">Join our sanctuary community as a guest or property host</p>
        </div>

        {/* Form Container */}
        <Card className="border-stone-800/80 bg-stone-900/70 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <ErrorBanner message={formError} />

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                  I want to join as:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'customer' })}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition cursor-pointer ${
                      formData.role === 'customer'
                        ? 'bg-amber-500/15 border-amber-500 text-stone-100 shadow-md shadow-amber-500/10'
                        : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <UserCheck className="w-5 h-5 text-amber-400" />
                    <div className="text-center">
                      <p className="text-xs font-bold text-stone-100">Retreat Guest</p>
                      <p className="text-[10px] text-stone-400">Book & explore retreats</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'owner' })}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition cursor-pointer ${
                      formData.role === 'owner'
                        ? 'bg-amber-500/15 border-amber-500 text-stone-100 shadow-md shadow-amber-500/10'
                        : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <Home className="w-5 h-5 text-amber-400" />
                    <div className="text-center">
                      <p className="text-xs font-bold text-stone-100">Sanctuary Host</p>
                      <p className="text-[10px] text-stone-400">List & host retreats</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    className="pl-10 h-11 bg-stone-950/80 border-stone-800 text-stone-100 placeholder:text-stone-600 focus-visible:ring-amber-500/40 focus-visible:border-amber-500/50"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jane@example.com"
                    className="pl-10 h-11 bg-stone-950/80 border-stone-800 text-stone-100 placeholder:text-stone-600 focus-visible:ring-amber-500/40 focus-visible:border-amber-500/50"
                    required
                  />
                </div>
              </div>

              {/* Passwords */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <Input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="pl-10 h-11 bg-stone-950/80 border-stone-800 text-stone-100 placeholder:text-stone-600 focus-visible:ring-amber-500/40 focus-visible:border-amber-500/50"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <Input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="pl-10 h-11 bg-stone-950/80 border-stone-800 text-stone-100 placeholder:text-stone-600 focus-visible:ring-amber-500/40 focus-visible:border-amber-500/50"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Password Strength Visual Checklist */}
                <PasswordStrengthIndicator password={formData.password} />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="pl-10 h-11 bg-stone-950/80 border-stone-800 text-stone-100 placeholder:text-stone-600 focus-visible:ring-amber-500/40 focus-visible:border-amber-500/50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="brand"
                size="lg"
                disabled={loading}
                className="w-full h-11 mt-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold shadow-lg shadow-amber-600/20 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-stone-950/30 border-t-stone-950 rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> Create Account
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="p-6 sm:p-8 pt-0 sm:pt-0 border-t border-stone-800/60 bg-stone-950/30 flex justify-center py-4">
            <p className="text-xs text-stone-400 text-center">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-amber-400 font-semibold hover:text-amber-300 hover:underline inline-flex items-center gap-1 ml-1"
              >
                Sign in instead <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
