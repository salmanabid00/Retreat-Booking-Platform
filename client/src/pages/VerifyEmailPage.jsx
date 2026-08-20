import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail, RefreshCw } from 'lucide-react';
import API from '../api/axios';

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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center space-y-6">

        {/* Icon */}
        <div className="flex justify-center">
          {status === 'loading' && (
            <div className="w-24 h-24 rounded-full bg-indigo-500/10 border-2 border-indigo-500/30 flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            </div>
          )}
          {status === 'alreadyVerified' && (
            <div className="w-24 h-24 rounded-full bg-teal-500/10 border-2 border-teal-500/30 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-teal-400" />
            </div>
          )}
          {(status === 'error' || status === 'expired') && (
            <div className="w-24 h-24 rounded-full bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center">
              <XCircle className="w-12 h-12 text-rose-400" />
            </div>
          )}
        </div>

        {/* Title & Message */}
        <div className="space-y-2">
          {status === 'loading' && (
            <>
              <h1 className="text-2xl font-extrabold text-white">Verifying Your Email...</h1>
              <p className="text-sm text-slate-400">Please wait a moment.</p>
            </>
          )}
          {status === 'success' && (
            <>
              <h1 className="text-2xl font-extrabold text-white">Email Verified!</h1>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">{message}</p>
            </>
          )}
          {status === 'alreadyVerified' && (
            <>
              <h1 className="text-2xl font-extrabold text-white">Already Verified</h1>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">{message}</p>
            </>
          )}
          {status === 'expired' && (
            <>
              <h1 className="text-2xl font-extrabold text-white">Link Expired</h1>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">{message}</p>
            </>
          )}
          {status === 'error' && (
            <>
              <h1 className="text-2xl font-extrabold text-white">Invalid Link</h1>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">{message}</p>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {status === 'success' && (
            <Link
              to="/login"
              className="w-full py-3.5 rounded-xl gradient-button text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              Proceed to Login →
            </Link>
          )}

          {status === 'alreadyVerified' && (
            <Link
              to="/login"
              className="w-full py-3.5 rounded-xl gradient-button text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              Go to Login →
            </Link>
          )}

          {status === 'expired' && expiredEmail && !resendDone && (
            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full py-3.5 rounded-xl gradient-button text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {resending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {resending ? 'Sending...' : 'Send New Verification Email'}
            </button>
          )}

          {(status === 'error' || status === 'expired') && (
            <Link
              to="/register"
              className="w-full py-3 rounded-xl border border-slate-700 text-slate-300 hover:border-indigo-500 hover:text-white transition text-sm font-medium flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" /> Register Again
            </Link>
          )}

          <Link
            to="/login"
            className="block text-xs text-slate-500 hover:text-slate-300 transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
