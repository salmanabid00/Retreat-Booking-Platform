import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, Sparkles, RefreshCw } from 'lucide-react';
import ErrorBanner from '../components/common/ErrorBanner';
import API from '../api/axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [unverified, setUnverified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resending, setResending] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/properties';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setUnverified(false);

    if (!email || !password) {
      const msg = 'Please fill in all fields.';
      setFormError(msg);
      toast.error(msg);
      return;
    }

    try {
      setLoading(true);
      const loggedUser = await login(email, password);
      toast.success(`Welcome back, ${loggedUser.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      const data = err.response?.data;
      const errorMsg = data?.message || err.message || 'Login failed.';

      // Detect unverified-email 403
      if (err.response?.status === 403 && data?.requiresVerification) {
        setUnverified(true);
        setUnverifiedEmail(data.email || email);
        setFormError(errorMsg);
      } else {
        setFormError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setResending(true);
    try {
      const res = await API.post('/auth/resend-verification', { email: unverifiedEmail });
      toast.success(res.data.message || 'Verification email resent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Welcome Back
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Sign in to HavenHideaway</h1>
          <p className="text-sm text-slate-400">Access your retreat bookings, properties, and messages</p>
        </div>

        {/* Card Form */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">

          {/* Standard error banner */}
          {!unverified && <ErrorBanner message={formError} />}

          {/* Unverified email inline panel */}
          {unverified && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-amber-300">Email not verified</p>
                  <p className="text-xs text-amber-200/70 leading-relaxed">{formError}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resending}
                className="w-full py-2.5 rounded-xl border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 transition text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {resending ? (
                  <div className="w-3.5 h-3.5 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                {resending ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl gradient-button text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 font-semibold hover:underline">
            Create an account
          </Link>
        </p>

      </div>
    </div>
  );
};

export default LoginPage;
