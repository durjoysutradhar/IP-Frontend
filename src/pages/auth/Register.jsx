import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowLeft,
  BookOpen,
  AlertCircle,
  Users,
  GraduationCap,
  Eye,
  EyeOff,
  UserPlus,
} from "lucide-react";

const Register = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    role: "student",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);

    if (!result.success) {
      setError(result.message);
    }

    setLoading(false);
  };

  const roleThemeMap = {
    student: {
      activeTab:
        "bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-blue-500 shadow-md shadow-blue-900/30",
      inactiveTab:
        "border-slate-300/80 bg-white/85 text-slate-600 hover:bg-white",
      focus: "focus:ring-blue-400/35 focus:border-blue-500",
      submit:
        "bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-700 hover:via-blue-600 hover:to-cyan-600 focus:ring-blue-400/35",
      badge: "bg-blue-50/95 text-blue-700 border-blue-200",
      link: "text-blue-700 hover:text-blue-800",
    },
    teacher: {
      activeTab:
        "bg-gradient-to-r from-emerald-600 to-teal-500 text-white border-emerald-500 shadow-md shadow-emerald-900/30",
      inactiveTab:
        "border-slate-300/80 bg-white/85 text-slate-600 hover:bg-white",
      focus: "focus:ring-emerald-400/35 focus:border-emerald-500",
      submit:
        "bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-700 hover:via-emerald-600 hover:to-teal-600 focus:ring-emerald-400/35",
      badge: "bg-emerald-50/95 text-emerald-700 border-emerald-200",
      link: "text-emerald-700 hover:text-emerald-800",
    },
  };

  const roleTheme = roleThemeMap[formData.role] || roleThemeMap.student;
  const roleLabel =
    formData.role === "teacher" ? "Teacher Account" : "Student Account";

  return (
    <div className="relative min-h-screen overflow-y-auto bg-[radial-gradient(circle_at_8%_10%,#67e8f9_0%,transparent_32%),radial-gradient(circle_at_88%_14%,#86efac_0%,transparent_30%),linear-gradient(140deg,#020617_0%,#0f172a_42%,#0b1120_100%)]">
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:30px_30px]" />
      <div className="pointer-events-none absolute -left-16 top-16 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-14 bottom-20 h-44 w-44 rounded-full bg-emerald-300/18 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-xl items-start px-4 py-8 sm:py-12 lg:items-center">
        <section className="w-full rounded-3xl border border-white/35 bg-gradient-to-b from-white/96 to-slate-50/92 p-5 shadow-[0_30px_70px_-28px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_42px_82px_-30px_rgba(0,0,0,0.58)] sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-900 px-3 py-2 transition duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-slate-900/20">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-300 text-slate-900 transition duration-300 group-hover:rotate-3">
                <BookOpen className="h-4.5 w-4.5" />
              </div>
              <div className="text-left">
                <h1 className="text-sm font-semibold tracking-tight text-white">
                  EduLibrary
                </h1>
                <p className="text-[11px] text-slate-300">Create Account</p>
              </div>
            </div>

            <Link
              to="/landing"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-100 hover:shadow-md"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Landing
            </Link>
          </div>

          <div className="mt-5 space-y-2">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition duration-300 hover:-translate-y-0.5 ${roleTheme.badge}`}
            >
              <UserPlus className="h-4 w-4" />
              {roleLabel}
            </div>
            <h3
              className="text-2xl font-bold leading-tight tracking-tight text-gray-200 sm:text-[1.85rem]"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              Create your account
            </h3>
            <p className="text-sm text-gray-200">
              Join EduLibrary and access your digital learning portal.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200/90 bg-gradient-to-r from-slate-100 to-slate-50 p-1.5">
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({ ...prev, role: "student" }));
                setError("");
              }}
              className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                formData.role === "student"
                  ? roleTheme.activeTab
                  : roleTheme.inactiveTab
              }`}
            >
              <Users className="h-4 w-4" />
              Student
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({ ...prev, role: "teacher" }));
                setError("");
              }}
              className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                formData.role === "teacher"
                  ? roleTheme.activeTab
                  : roleTheme.inactiveTab
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              Teacher
            </button>
          </div>

          <form className="mt-5 space-y-3.5" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-start rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                <AlertCircle className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-200"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className={`w-full rounded-xl border border-slate-300 bg-gray-800 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] transition-all duration-300 hover:border-slate-400 hover:shadow-sm focus:-translate-y-0.5 focus:outline-none focus:ring-2 ${roleTheme.focus}`}
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-200"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`w-full rounded-xl border border-slate-300 bg-gray-800 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] transition-all duration-300 hover:border-slate-400 hover:shadow-sm focus:-translate-y-0.5 focus:outline-none focus:ring-2 ${roleTheme.focus}`}
                placeholder="you@university.edu"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="department"
                className="block text-sm font-medium text-gray-200"
              >
                Department
              </label>
              <input
                id="department"
                name="department"
                type="text"
                className={`w-full rounded-xl border border-slate-300 bg-gray-800 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] transition-all duration-300 hover:border-slate-400 hover:shadow-sm focus:-translate-y-0.5 focus:outline-none focus:ring-2 ${roleTheme.focus}`}
                placeholder="e.g., Computer Science"
                value={formData.department}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-200"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className={`w-full rounded-xl border border-slate-300 bg-gray-800 px-4 py-3 pr-11 text-slate-900 placeholder:text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] transition-all duration-300 hover:border-slate-400 hover:shadow-sm focus:-translate-y-0.5 focus:outline-none focus:ring-2 ${roleTheme.focus}`}
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition-all duration-300 hover:scale-110 hover:bg-slate-100 hover:text-slate-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-200"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className={`w-full rounded-xl border border-slate-300 bg-gray-800 px-4 py-3 pr-11 text-slate-900 placeholder:text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] transition-all duration-300 hover:border-slate-400 hover:shadow-sm focus:-translate-y-0.5 focus:outline-none focus:ring-2 ${roleTheme.focus}`}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition-all duration-300 hover:scale-110 hover:bg-slate-100 hover:text-slate-700"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`mt-1 flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-700/30 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-70 ${roleTheme.submit}`}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600 sm:text-left">
            Already have an account?{" "}
            <Link
              to="/login"
              className={`font-semibold transition-all duration-300 hover:underline ${roleTheme.link}`}
            >
              Sign in here
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Register;
