import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, AlertCircle, Shield, Users, Eye, EyeOff, ArrowLeft, GraduationCap } from 'lucide-react';
import userDesignImage from '../../../user_design.jpeg';

const Login = () => {
  const { login } = useAuth();
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (!result.success) {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const roleThemeMap = {
    student: {
      activeTab: 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/40',
      inactiveTab: 'border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800/80',
      focus: 'focus:ring-blue-400/40 focus:border-blue-400',
      submit: 'bg-blue-600 hover:bg-blue-500 focus:ring-blue-400/40',
      badge: 'bg-blue-500/15 text-blue-100 border-blue-400/30',
      link: 'text-blue-300 hover:text-blue-200',
      gradient: 'from-blue-500/20 via-cyan-500/10 to-slate-900/0'
    },
    teacher: {
      activeTab: 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-900/40',
      inactiveTab: 'border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800/80',
      focus: 'focus:ring-emerald-400/40 focus:border-emerald-400',
      submit: 'bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-400/40',
      badge: 'bg-emerald-500/15 text-emerald-100 border-emerald-400/30',
      link: 'text-emerald-300 hover:text-emerald-200',
      gradient: 'from-emerald-500/20 via-cyan-500/10 to-slate-900/0'
    },
    admin: {
      activeTab: 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-900/40',
      inactiveTab: 'border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800/80',
      focus: 'focus:ring-rose-400/40 focus:border-rose-400',
      submit: 'bg-rose-600 hover:bg-rose-500 focus:ring-rose-400/40',
      badge: 'bg-rose-500/15 text-rose-100 border-rose-400/30',
      link: 'text-rose-300 hover:text-rose-200',
      gradient: 'from-rose-500/20 via-orange-500/10 to-slate-900/0'
    }
  };

  const roleTheme = roleThemeMap[userType] || roleThemeMap.student;
  const roleLabel = userType === 'teacher' ? 'Teacher Access' : userType === 'admin' ? 'Admin Access' : 'Student Access';
  const RoleIcon = userType === 'teacher' ? GraduationCap : userType === 'admin' ? Shield : Users;

  return (
    <div className="login-aurora-bg relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_10%,#1d4ed8_0%,#0f172a_40%,#020617_100%)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="dashboard-float absolute -left-24 top-10 h-80 w-80 rounded-full bg-cyan-400/25 blur-3xl" />
        <div className="dashboard-float absolute right-10 top-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" style={{ animationDelay: '0.8s' }} />
        <div className="dashboard-float absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" style={{ animationDelay: '1.6s' }} />
      </div>

      <div className="relative mx-auto flex min-h-5 w-full max-w-7xl items-center px-3 py-3 sm:px-4 sm:py-4 lg:py-6">
        <div className="login-shell grid w-full overflow-hidden rounded-[28px] border border-white/15 bg-slate-950/60 shadow-[0_38px_90px_-50px_rgba(15,23,42,0.8)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative min-h-[240px] overflow-hidden sm:min-h-[300px] lg:min-h-[78vh] lg:max-h-[760px]">
            <img
              src={userDesignImage}
              alt="EduLibrary illustration"
              className="login-image-zoom h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.06)_0%,rgba(2,6,23,0.14)_50%,rgba(2,6,23,0.62)_100%)]" />
          </section>

          <section className={`login-panel-glow relative flex items-center bg-gradient-to-br p-2 sm:p-4 lg:p-7 ${roleTheme.gradient}`}>
            <div className="login-panel-enter dashboard-reveal mx-auto w-full max-w-xl rounded-3xl border border-white/15 bg-slate-900/72 p-5 shadow-[0_24px_56px_-30px_rgba(0,0,0,0.8)] sm:p-6 lg:max-w-lg">
              <div className="login-stagger-1 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-900">
                    <BookOpen className="h-4.5 w-4.5" />
                  </div>
                  <div className="text-left">
                    <h1 className="text-sm font-semibold tracking-tight text-white">EduLibrary</h1>
                    <p className="text-[11px] text-slate-200">Secure Sign In</p>
                  </div>
                </div>

                <Link
                  to="/landing"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-100 transition duration-300 hover:-translate-y-0.5 hover:bg-white/20"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Landing
                </Link>
              </div>

              <div className="login-stagger-2 mt-6 space-y-2">
                <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${roleTheme.badge}`}>
                  <RoleIcon className="h-4 w-4" />
                  {roleLabel}
                </div>
                <h3 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-[2rem]">Login to Your Portal</h3>
                <p className="text-sm text-slate-200">Continue to your dashboard with your institutional account.</p>
              </div>

              <div className="login-stagger-3 mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-white/15 bg-slate-800/80 p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setUserType('student');
                    setFormData({ email: '', password: '' });
                    setError('');
                  }}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-semibold transition-all duration-300 hover:scale-[1.02] ${
                    userType === 'student' ? roleTheme.activeTab : roleTheme.inactiveTab
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserType('teacher');
                    setFormData({ email: '', password: '' });
                    setError('');
                  }}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-semibold transition-all duration-300 hover:scale-[1.02] ${
                    userType === 'teacher' ? roleTheme.activeTab : roleTheme.inactiveTab
                  }`}
                >
                  <GraduationCap className="h-4 w-4" />
                  Teacher
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserType('admin');
                    setFormData({ email: '', password: '' });
                    setError('');
                  }}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-semibold transition-all duration-300 hover:scale-[1.02] ${
                    userType === 'admin' ? roleTheme.activeTab : roleTheme.inactiveTab
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </button>
              </div>

              <form className="login-stagger-4 mt-6 space-y-4" onSubmit={handleSubmit}>
                {error && (
                  <div className="flex items-start rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                    <AlertCircle className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" />
                    <p>{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-slate-100">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`login-input w-full rounded-xl border border-white/15 bg-slate-800/80 px-4 py-3 text-white placeholder:text-slate-400 transition duration-300 focus:outline-none focus:ring-2 ${roleTheme.focus}`}
                    placeholder="you@university.edu"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-slate-200">
                      Password
                    </label>
                    <Link to="/forgot-password" className={`text-xs font-semibold transition ${roleTheme.link}`}>
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      className={`login-input w-full rounded-xl border border-white/15 bg-slate-800/80 px-4 py-3 pr-11 text-white placeholder:text-slate-400 transition duration-300 focus:outline-none focus:ring-2 ${roleTheme.focus}`}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-white/10 hover:text-slate-100"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`login-submit-glow login-submit-sweep flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-70 ${roleTheme.submit}`}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                      Signing in...
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </form>

              <p className="login-stagger-5 mt-6 text-center text-sm text-slate-200 sm:text-left">
                New to EduLibrary?{' '}
                <Link to="/register" className={`font-semibold transition ${roleTheme.link}`}>
                  Create an account
                </Link>
              </p>
            </div>
          </section>
      </div>
      </div>
    </div>
  );
};

export default Login;
