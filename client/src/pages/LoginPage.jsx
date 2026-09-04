import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
import ErrorBanner from '../components/common/ErrorBanner';
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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      {/* Subtle warm amber background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header Badge & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Welcome Back</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-100 tracking-tight font-serif">
            Sign in to HavenHideaway
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-sm mx-auto">
            Access your retreat bookings, sanctuary listings, and host conversations
          </p>
        </div>

        {/* Card Form */}
        <Card className="border-stone-800/80 bg-stone-900/70 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="p-6 sm:p-8 pb-4 sm:pb-4 space-y-1">
            <CardTitle className="text-base sm:text-lg font-semibold text-stone-100">
              Account Credentials
            </CardTitle>
            <CardDescription className="text-xs text-stone-400">
              Enter your verified email address and password to continue.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 pt-0 sm:pt-0 space-y-5">
            {/* Standard error banner */}
            {!unverified && formError && <ErrorBanner message={formError} />}

            {/* Unverified email inline panel */}
            {unverified && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-amber-300">Email not verified</p>
                    <p className="text-xs text-amber-200/80 leading-relaxed">{formError}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="w-full border-amber-500/40 text-amber-300 hover:bg-amber-500/20 hover:text-amber-200"
                >
                  {resending ? (
                    <div className="w-3.5 h-3.5 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  {resending ? 'Sending Link...' : 'Resend Verification Email'}
                </Button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="pl-10 h-11 bg-stone-950/80 border-stone-800 text-stone-100 placeholder:text-stone-600 focus-visible:ring-amber-500/40 focus-visible:border-amber-500/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 h-11 bg-stone-950/80 border-stone-800 text-stone-100 placeholder:text-stone-600 focus-visible:ring-amber-500/40 focus-visible:border-amber-500/50"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                variant="brand"
                size="lg"
                className="w-full h-11 mt-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold shadow-lg shadow-amber-600/20 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-stone-950/30 border-t-stone-950 rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" /> Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="p-6 sm:p-8 pt-0 sm:pt-0 border-t border-stone-800/60 bg-stone-950/30 flex justify-center py-4">
            <p className="text-xs text-stone-400 text-center">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-amber-400 font-semibold hover:text-amber-300 hover:underline inline-flex items-center gap-1 ml-1"
              >
                Create an account <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
