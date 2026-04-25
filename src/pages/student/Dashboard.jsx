import { useState, useEffect } from 'react';
import StudentLayout from '../../components/StudentLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  BookOpen,
  Clock,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Wallet,
  CalendarClock,
  Sparkles,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [animateIn, setAnimateIn] = useState(false);
  const [currentBorrows, setCurrentBorrows] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [stats, setStats] = useState({
    activeBorrows: 0,
    overdueBooks: 0,
    dueSoonBooks: 0,
    totalFines: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (loading) {
      setAnimateIn(false);
      return;
    }

    const timer = setTimeout(() => setAnimateIn(true), 80);
    return () => clearTimeout(timer);
  }, [loading]);

  const fetchDashboardData = async () => {
    try {
      const [borrowsRes, recommendedRes, finesRes] = await Promise.all([
        api.get('/borrow/current'),
        api.get('/books/recommend?limit=5'),
        api.get('/fine/my-fines')
      ]);

      const borrowsData = borrowsRes.data.data;
      const borrows = Array.isArray(borrowsData) ? borrowsData : (borrowsData?.borrows || []);
      setCurrentBorrows(borrows);
      setRecommendedBooks(recommendedRes.data.data);

      // Calculate stats
      // Include both current fines from active borrows AND pending fines from database
      const currentBorrowFines = borrows.reduce((sum, b) => sum + (b.currentFine || 0), 0);
      const pendingFines = (finesRes.data.data || [])
        .filter(fine => fine.payment_status === 'pending')
        .reduce((sum, fine) => sum + parseFloat(fine.amount || 0), 0);
      
      const totalFines = currentBorrowFines + pendingFines;
      const overdueBooks = borrows.filter((borrow) => borrow.isOverdue).length;
      const dueSoonBooks = borrows.filter((borrow) => {
        if (borrow.isOverdue || !borrow.due_date) return false;
        const due = new Date(borrow.due_date);
        const now = new Date();
        const days = (due - now) / (1000 * 60 * 60 * 24);
        return days >= 0 && days <= 3;
      }).length;
      
      setStats({
        activeBorrows: borrows.length,
        overdueBooks,
        dueSoonBooks,
        totalFines: totalFines
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <LoadingSpinner size="lg" className="min-h-[60vh]" />
      </StudentLayout>
    );
  }

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    return new Date(dateValue).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const statCards = [
    {
      title: 'Active',
      value: stats.activeBorrows,
      subtitle: 'Books currently with you',
      Icon: BookOpen,
      tone: 'from-cyan-500/20 to-sky-500/20',
      iconColor: 'text-cyan-700'
    },
    {
      title: 'Overdue',
      value: stats.overdueBooks,
      subtitle: 'Need immediate return action',
      Icon: Clock,
      tone: 'from-rose-500/20 to-orange-500/20',
      iconColor: 'text-rose-700'
    },
    {
      title: 'Due Soon',
      value: stats.dueSoonBooks,
      subtitle: 'Due within the next 3 days',
      Icon: CalendarClock,
      tone: 'from-amber-400/20 to-yellow-400/20',
      iconColor: 'text-amber-700'
    },
    {
      title: 'Fine Balance',
      value: `৳${stats.totalFines.toFixed(2)}`,
      subtitle: 'Pending + running fines',
      Icon: Wallet,
      tone: 'from-fuchsia-500/20 to-purple-500/20',
      iconColor: 'text-fuchsia-700'
    }
  ];

  const healthScore = Math.max(
    0,
    Math.min(100, Math.round(100 - stats.overdueBooks * 22 - stats.dueSoonBooks * 9 - Math.min(stats.totalFines / 10, 20)))
  );
  const healthTone = healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Stable' : 'Needs Attention';
  const activeBase = Math.max(stats.activeBorrows, 1);
  const overdueRatio = Math.min(100, (stats.overdueBooks / activeBase) * 100);
  const dueSoonRatio = Math.min(100, (stats.dueSoonBooks / activeBase) * 100);

  const urgentBorrows = currentBorrows
    .filter((borrow) => borrow.isOverdue || (borrow.due_date && (new Date(borrow.due_date) - new Date()) / (1000 * 60 * 60 * 24) <= 3))
    .sort((a, b) => new Date(a.due_date || 0) - new Date(b.due_date || 0))
    .slice(0, 4);

  const recommendationPulse = Math.min(100, recommendedBooks.length * 20);
  const borrowedCategories = Array.from(
    new Set(recommendedBooks.map((book) => book.category?.name).filter(Boolean))
  ).slice(0, 3);

  return (
    <StudentLayout>
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-gradient-to-br from-[#fff7ed] via-[#eff6ff] to-[#ecfeff] p-4 sm:p-6 lg:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_12%,rgba(14,165,233,0.25),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(99,102,241,0.2),transparent_32%),radial-gradient(circle_at_84%_88%,rgba(244,63,94,0.18),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(148,163,184,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.2)_1px,transparent_1px)] [background-size:28px_28px]" />

        <div className="relative z-10 space-y-6 sm:space-y-8">
          <section
            className={`overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 p-6 text-white shadow-2xl transition-all duration-700 sm:p-8 ${
              animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
              <div className="xl:col-span-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                  <Activity className="h-3.5 w-3.5" />
                  Student Command Deck
                </div>
                <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                  Welcome sback, {user?.name?.split(' ')[0] || 'Reader'}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
                  Your daily control room for borrows, deadlines, and reading momentum. Hover cards for quick actions and live cues.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    to="/student/books"
                    className="group inline-flex items-center rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-300"
                  >
                    Browse Catalog
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/student/my-borrows"
                    className="group inline-flex items-center rounded-xl border border-slate-500 bg-slate-800/70 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-700"
                  >
                    Manage Borrows
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/student/analytics"
                    className="group inline-flex items-center rounded-xl border border-fuchsia-300/50 bg-fuchsia-500/10 px-4 py-2.5 text-sm font-semibold text-fuchsia-100 transition-all duration-300 hover:-translate-y-0.5 hover:bg-fuchsia-500/20"
                  >
                    Open Analytics
                    <TrendingUp className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                  </Link>
                </div>
              </div>

              <div className="xl:col-span-4">
                <div className="space-y-3 rounded-2xl border border-slate-700 bg-slate-900/80 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Library Health</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="relative h-16 w-16 rounded-full p-1"
                      style={{ background: `conic-gradient(#22d3ee ${healthScore}%, rgba(51,65,85,0.8) 0)` }}
                    >
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950 text-sm font-black text-cyan-200">
                        {healthScore}
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{healthTone}</p>
                      <p className="text-xs text-slate-400">Based on due-soon, overdue, and fine load.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
                        <span>Overdue Pressure</span>
                        <span>{stats.overdueBooks}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-700">
                        <div className="h-full rounded-full bg-rose-400 transition-all duration-700" style={{ width: `${overdueRatio}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
                        <span>Due Soon Pressure</span>
                        <span>{stats.dueSoonBooks}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-700">
                        <div className="h-full rounded-full bg-amber-400 transition-all duration-700" style={{ width: `${dueSoonRatio}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {statCards.map((item, index) => (
              <article
                key={item.title}
                className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${
                  animateIn ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${120 + index * 70}ms` }}
              >
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.tone}`} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{item.title}</p>
                    <item.Icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${item.iconColor}`} />
                  </div>
                  <p className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">{item.value}</p>
                  <p className="mt-1 text-[11px] text-slate-600">{item.subtitle}</p>
                </div>
              </article>
            ))}
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <article
              className={`xl:col-span-7 overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-lg backdrop-blur-sm transition-all duration-700 ${
                animateIn ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
              style={{ transitionDelay: '260ms' }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Current Borrows</h2>
                <Link
                  to="/student/my-borrows"
                  className="group inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Open full list
                  <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>

              {currentBorrows.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
                  <BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-400" />
                  <p className="font-semibold text-slate-700">No active borrows</p>
                  <p className="mt-1 text-sm text-slate-500">Start by picking a book from the catalog.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentBorrows.slice(0, 5).map((borrow, index) => (
                    <div
                      key={borrow.id}
                      className={`group relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-r from-white via-slate-50/60 to-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md ${
                        animateIn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                      }`}
                      style={{ transitionDelay: `${320 + index * 55}ms` }}
                    >
                      <div className={`absolute inset-y-0 left-0 w-1.5 ${borrow.isOverdue ? 'bg-rose-500' : 'bg-cyan-500'}`} />
                      <div className="flex flex-col gap-3 pl-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{borrow.book?.title || 'Untitled Book'}</p>
                          <p className="text-sm text-slate-500">Due: {formatDate(borrow.due_date)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${borrow.isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {borrow.isOverdue ? 'Overdue' : 'Active'}
                          </span>
                          <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">
                            ৳{(borrow.currentFine || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <div className="xl:col-span-5 space-y-6">
              <article
                className={`overflow-hidden rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-orange-50 p-5 shadow-lg transition-all duration-700 ${
                  animateIn ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: '320ms' }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Urgency Radar</h3>
                  <AlertCircle className="h-5 w-5 text-rose-600" />
                </div>

                {urgentBorrows.length === 0 ? (
                  <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                    No urgent return tasks right now.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {urgentBorrows.map((borrow) => (
                      <div key={borrow.id} className="rounded-lg border border-rose-200/60 bg-white/80 px-3 py-2">
                        <p className="truncate text-sm font-semibold text-slate-800">{borrow.book?.title || 'Untitled Book'}</p>
                        <p className="text-xs text-slate-500">Due {formatDate(borrow.due_date)}</p>
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  to="/student/fines"
                  className="mt-4 inline-flex items-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Open fine center
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </article>

              <article
                className={`overflow-hidden rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-5 shadow-lg transition-all duration-700 ${
                  animateIn ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: '390ms' }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Recommendation Pulse</h3>
                  <Sparkles className="h-5 w-5 text-cyan-700" />
                </div>

                <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
                  <span>Recommendation Strength</span>
                  <span className="font-bold text-slate-800">{recommendationPulse}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700" style={{ width: `${recommendationPulse}%` }} />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {borrowedCategories.length > 0 ? (
                    borrowedCategories.map((category) => (
                      <span key={category} className="rounded-full border border-cyan-200 bg-white px-2.5 py-1 text-xs font-semibold text-cyan-800">
                        {category}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">Borrow activity will unlock category signals.</span>
                  )}
                </div>
              </article>
            </div>
          </section>

          <section
            className={`overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-lg backdrop-blur-sm transition-all duration-700 ${
              animateIn ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: '470ms' }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="inline-flex items-center text-lg font-bold text-slate-900">
                <TrendingUp className="mr-2 h-5 w-5 text-indigo-600" />
                Recommended for You
              </h2>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                {recommendedBooks.length} picks
              </span>
            </div>

            {recommendedBooks.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center text-slate-500">
                Borrow more books to unlock personalized recommendations.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {recommendedBooks.map((book, index) => (
                  <Link
                    key={book.id}
                    to={`/student/books/${book.id}`}
                    className={`group overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl ${
                      animateIn ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                    }`}
                    style={{ transitionDelay: `${520 + index * 60}ms` }}
                  >
                    <div className="h-2 bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-400" />
                    <div className="p-4">
                      <h3 className="line-clamp-2 font-semibold text-slate-900 transition group-hover:text-indigo-700">{book.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{book.author}</p>
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700">{book.category?.name || 'General'}</span>
                        <span className="font-semibold text-emerald-700">{book.available_copies} available</span>
                      </div>
                      <div className="mt-3 inline-flex items-center text-xs font-semibold text-indigo-700">
                        Open details
                        <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
