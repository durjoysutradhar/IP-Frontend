import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate sending reset email
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <Link
            to="/landing"
            className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/20"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Landing
          </Link>
          <div className="flex justify-center">
            <div className="relative w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-2xl flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-pink-400">
              Reset Password
            </h1>
            <p className="mt-2 text-slate-400 text-sm">We'll send you instructions to reset your password</p>
          </div>
        </div>

        {!submitted ? (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl space-y-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="flex items-start p-4 rounded-xl bg-red-500/20 border border-red-500/30 backdrop-blur-sm">
                  <AlertCircle className="w-5 h-5 mr-3 mt-0.5 text-red-400 flex-shrink-0" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-200">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-slate-700/70 transition backdrop-blur-sm"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-4 rounded-xl font-bold shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  'Send Reset Email'
                )}
              </button>
            </form>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-slate-400 hover:text-slate-200 transition text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        ) : (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl space-y-6 text-center">
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-slate-300 text-sm">
                We've sent a password reset link to <span className="font-semibold text-blue-400">{email}</span>
              </p>
            </div>

            <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4 text-sm text-slate-300">
              <p className="mb-2">Didn't receive the email?</p>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-400">
                <li>Check your spam folder</li>
                <li>Make sure you entered the correct email</li>
              </ul>
            </div>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-slate-400 hover:text-slate-200 transition text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-slate-500 text-xs">
          <p>© 2026 EduLibrary. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
