import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail, RefreshCw, ArrowRight } from 'lucide-react';
import API from '../api/axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'alreadyVerified' | 'expired' | 'error'
  const [message, setMessage] = useState('');
  const [expiredEmail, setExpiredEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await API.get(`/auth/verify-email/${token}`);
        if (res.data.success) {
          if (res.data.alreadyVerified) {
            setStatus('alreadyVerified');
            setMessage(res.data.message || 'Your email is already verified.');
          } else {
            setStatus('success');
            setMessage(res.data.message || 'Email verified successfully!');
          }
        } else {
          setStatus('error');
          setMessage(res.data.message || 'Verification failed.');
        }
      } catch (err) {
        const data = err.response?.data;
        if (data?.expired) {
          setStatus('expired');
          setExpiredEmail(data.email || '');
          setMessage(data.message || 'This link has expired.');
        } else {
          setStatus('error');
          setMessage(data?.message || 'This verification link is invalid or has already been used.');
        }
      }
    };

    if (token) {
      verifyToken();
    } else {
      setStatus('error');
      setMessage('No verification token provided.');
    }
  }, [token]);

  const handleResend = async () => {
    if (!expiredEmail || resendDone) return;
    setResending(true);
    try {
      await API.post('/auth/resend-verification', { email: expiredEmail });
      setResendDone(true);
      setMessage(`A new verification link has been sent to ${expiredEmail}. Please check your inbox.`);
      setStatus('success');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md text-center space-y-6 relative z-10">

        {/* Icon */}
        <div className="flex justify-center">
          {status === 'loading' && (
            <div className="w-20 h-20 rounded-3xl bg-stone-900 border border-stone-800 flex items-center justify-center shadow-lg">
              <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-20 h-20 rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <CheckCircle className="w-10 h-10 text-amber-400" />
            </div>
          )}
          {status === 'alreadyVerified' && (
            <div className="w-20 h-20 rounded-3xl bg-stone-900 border border-stone-800 flex items-center justify-center shadow-lg">
              <CheckCircle className="w-10 h-10 text-amber-400" />
            </div>
          )}
          {(status === 'error' || status === 'expired') && (
            <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shadow-lg shadow-rose-500/10">
              <XCircle className="w-10 h-10 text-rose-400" />
            </div>
          )}
        </div>

        {/* Title & Message */}
        <div className="space-y-2">
          {status === 'loading' && (
            <>
              <h1 className="text-2xl font-bold text-stone-100 font-serif">Verifying Your Email...</h1>
              <p className="text-xs text-stone-400">Please wait a moment while we authenticate your sanctuary token.</p>
            </>
          )}
          {status === 'success' && (
            <>
              <h1 className="text-2xl font-bold text-stone-100 font-serif">Email Verified!</h1>
              <p className="text-xs sm:text-sm text-stone-400 max-w-xs mx-auto leading-relaxed">{message}</p>
            </>
          )}
          {status === 'alreadyVerified' && (
            <>
              <h1 className="text-2xl font-bold text-stone-100 font-serif">Already Verified</h1>
              <p className="text-xs sm:text-sm text-stone-400 max-w-xs mx-auto leading-relaxed">{message}</p>
            </>
          )}
          {status === 'expired' && (
            <>
              <h1 className="text-2xl font-bold text-stone-100 font-serif">Link Expired</h1>
              <p className="text-xs sm:text-sm text-stone-400 max-w-xs mx-auto leading-relaxed">{message}</p>
            </>
          )}
          {status === 'error' && (
            <>
              <h1 className="text-2xl font-bold text-stone-100 font-serif">Invalid Link</h1>
              <p className="text-xs sm:text-sm text-stone-400 max-w-xs mx-auto leading-relaxed">{message}</p>
            </>
          )}
        </div>

        {/* Actions */}
        <Card className="border-stone-800/80 bg-stone-900/70 backdrop-blur-xl shadow-2xl rounded-3xl p-6 space-y-3">
          {status === 'success' && (
            <Link to="/login" className="block w-full">
              <Button
                variant="brand"
                size="lg"
                className="w-full h-11 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                Proceed to Login <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}

          {status === 'alreadyVerified' && (
            <Link to="/login" className="block w-full">
              <Button
                variant="brand"
                size="lg"
                className="w-full h-11 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                Go to Login <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}

          {status === 'expired' && expiredEmail && !resendDone && (
            <Button
              variant="brand"
              size="lg"
              onClick={handleResend}
              disabled={resending}
              className="w-full h-11 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {resending ? (
                <div className="w-4 h-4 border-2 border-stone-950/30 border-t-stone-950 rounded-full animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {resending ? 'Sending...' : 'Send New Verification Email'}
            </Button>
          )}

          {(status === 'error' || status === 'expired') && (
            <Link to="/register" className="block w-full">
              <Button
                variant="outline"
                size="lg"
                className="w-full h-11 border-stone-800 text-stone-200 hover:text-amber-300 hover:border-amber-500/40 flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4 text-amber-400" /> Register Again
              </Button>
            </Link>
          )}

          <Link
            to="/login"
            className="block text-xs text-stone-500 hover:text-amber-300 transition pt-1"
          >
            Back to Login
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
