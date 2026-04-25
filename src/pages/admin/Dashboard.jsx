import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Clock,
  ShieldAlert,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const formatMoney = (value) => `৳${Number(value || 0).toFixed(2)}`;

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [mostBorrowed, setMostBorrowed] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, overdueRes, borrowedRes] = await Promise.all([
        api.get('/reports/statistics'),
        api.get('/reports/overdue-statistics'),
        api.get('/reports/most-borrowed-books?limit=5')
      ]);

      setStats(statsRes.data.data.overview);
      setOverdueBooks(overdueRes.data.data.overdueBooks.slice(0, 5));
      setMostBorrowed(borrowedRes.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const overview = useMemo(() => {
    const totalBooks = stats?.totalBooks || 0;
    const availableBooks = stats?.availableBooks || 0;
    const currentlyIssued = stats?.currentlyIssued || 0;
    const overdueCount = stats?.overdueCount || 0;
    const totalUsers = stats?.totalUsers || 0;
    const monthlyBorrows = stats?.monthlyBorrows || 0;

    const overduePressure = currentlyIssued > 0 ? Math.round((overdueCount / currentlyIssued) * 100) : 0;
    const activityPerUser = totalUsers > 0 ? (monthlyBorrows / totalUsers).toFixed(2) : '0.00';

    return {
      totalBooks,
      availableBooks,
      currentlyIssued,
      overdueCount,
      totalUsers,
      monthlyBorrows,
      totalBorrows: stats?.totalBorrows || 0,
      totalCategories: stats?.totalCategories || 0,
      overduePressure,
      activityPerUser
    };
  }, [stats]);

  const statCards = [
    {
      label: 'Total Books',
      value: overview.totalBooks,
      hint: `${overview.availableBooks} currently available`,
      icon: BookOpen,
      iconStyle: 'text-cyan-200',
      chipStyle: 'border-cyan-300/30 bg-cyan-500/10 text-cyan-100'
    },
    {
      label: 'Registered Users',
      value: overview.totalUsers,
      hint: `${overview.activityPerUser} borrows per user this month`,
      icon: Users,
      iconStyle: 'text-emerald-200',
      chipStyle: 'border-emerald-300/30 bg-emerald-500/10 text-emerald-100'
    },
    {
      label: 'Currently Issued',
      value: overview.currentlyIssued,
      hint: `${overview.monthlyBorrows} borrow actions this month`,
      icon: Clock,
      iconStyle: 'text-amber-200',
      chipStyle: 'border-amber-300/30 bg-amber-500/10 text-amber-100'
    },
    {
      label: 'Overdue Books',
      value: overview.overdueCount,
      hint: `${overview.overduePressure}% of active loans are overdue`,
      icon: AlertCircle,
      iconStyle: 'text-rose-200',
      chipStyle: 'border-rose-300/30 bg-rose-500/10 text-rose-100'
    }
  ];

  const quickLinks = [
    { to: '/admin/manage-books', label: 'Manage Books', helper: 'Inventory, copies, cover updates' },
    { to: '/admin/issued-books', label: 'Issued Books', helper: 'Track active loans and due dates' },
    { to: '/admin/manage-users', label: 'Manage Users', helper: 'Student access and account controls' },
    { to: '/admin/reports', label: 'Reports Center', helper: 'Trends, exports, and statistics' }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner size="lg" className="min-h-screen" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="deck-shell p-4 sm:p-6 lg:p-8">
        <div className="pointer-events-none absolute -top-28 right-8 h-60 w-60 rounded-full bg-cyan-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-8 h-56 w-56 rounded-full bg-indigo-300/20 blur-3xl" />

        <div className="relative space-y-6">
          <section className="deck-hero dashboard-reveal overflow-hidden rounded-3xl p-6 sm:p-8 sm:dashboard-delay-1">
            <div className="pointer-events-none absolute -right-14 top-6 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="pointer-events-none absolute left-20 top-4 h-36 w-36 rounded-full bg-indigo-300/20 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_78%_25%,rgba(99,102,241,0.22),transparent_30%)]" />

            <div className="relative grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div>
                <p className="inline-flex items-center rounded-full border border-slate-400/40 bg-slate-900/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-100">
                  Admin Command Center
                </p>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Library Operations Dashboard
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-slate-200 sm:text-base">
                  Monitor lending pressure, overdue risk, and demand spikes from one live control
                  surface with animated operational insights.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="dashboard-hover-attract rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur">
                    <p className="text-xs uppercase tracking-wider text-slate-300">Monthly Borrows</p>
                    <p className="mt-1 text-2xl font-semibold text-white">{overview.monthlyBorrows}</p>
                  </div>
                  <div className="dashboard-hover-attract rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur">
                    <p className="text-xs uppercase tracking-wider text-slate-300">Total Borrows</p>
                    <p className="mt-1 text-2xl font-semibold text-white">{overview.totalBorrows}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-400/35 bg-slate-900/45 p-5 backdrop-blur">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-200">
                    Risk Snapshot
                  </h2>
                  <ShieldAlert className="h-5 w-5 text-amber-300" />
                </div>
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-slate-200">
                      <span>Overdue Pressure</span>
                      <span className="font-semibold">{overview.overduePressure}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-700/70">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 transition-all duration-700"
                        style={{ width: `${Math.min(overview.overduePressure, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-500/45 bg-slate-950/35 p-3">
                    <p className="text-xs uppercase tracking-wider text-slate-300">Categories Managed</p>
                    <p className="mt-1 text-xl font-semibold text-white">{overview.totalCategories}</p>
                    <p className="text-xs text-slate-300">Coverage across catalog groups</p>
                  </div>
                </div>

                <Link
                  to="/admin/issued-books?status=overdue"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20"
                >
                  Resolve Overdues
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map((item, index) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.label}
                  className={`deck-panel deck-hover dashboard-reveal dashboard-hover-attract rounded-2xl p-5 dashboard-delay-${Math.min(index + 1, 5)}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {item.label}
                      </p>
                      <p className="mt-2 text-3xl font-semibold text-slate-900">{item.value}</p>
                    </div>
                    <div className={`rounded-xl border p-2.5 ${item.chipStyle}`}>
                      <Icon className={`h-5 w-5 ${item.iconStyle}`} />
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{item.hint}</p>
                </article>
              );
            })}
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <article
              className="deck-panel dashboard-reveal dashboard-delay-4 rounded-2xl p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Overdue Watchlist</h2>
                <Link
                  to="/admin/issued-books?status=overdue"
                  className="inline-flex items-center text-sm font-semibold text-primary-700 transition hover:text-primary-800"
                >
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>

              {overdueBooks.length === 0 ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-8 text-center text-sm text-emerald-700">
                  Great news. There are no overdue books right now.
                </div>
              ) : (
                <div className="space-y-3">
                  {overdueBooks.map((borrow) => (
                    <div
                      key={borrow.id}
                      className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{borrow.book?.title || 'Unknown book'}</p>
                          <p className="text-xs text-slate-500">
                            {borrow.user?.name || 'Unknown user'} • {borrow.user?.email || 'No email'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                            {borrow.daysOverdue} days late
                          </span>
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            {formatMoney(borrow.currentFine)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span>Due: {new Date(borrow.due_date).toLocaleDateString()}</span>
                        <span className="inline-flex items-center text-rose-600 transition group-hover:translate-x-0.5">
                          Needs action
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article
              className="deck-panel dashboard-reveal dashboard-delay-5 rounded-2xl p-5"
            >
              <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
              <p className="mt-1 text-sm text-slate-600">Jump to high-impact admin workflows.</p>
              <div className="mt-4 space-y-3">
                {quickLinks.map((action) => (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50/40"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                      <p className="text-xs text-slate-500">{action.helper}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-sky-600" />
                  </Link>
                ))}
              </div>
            </article>
          </section>

          <section
            className="deck-panel dashboard-reveal dashboard-delay-5 rounded-2xl p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Most Borrowed Books</h2>
              <Link
                to="/admin/reports"
                className="inline-flex items-center text-sm font-semibold text-primary-700 transition hover:text-primary-800"
              >
                View reports
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {mostBorrowed.length === 0 ? (
              <p className="rounded-xl border border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
                No borrowing activity has been recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {mostBorrowed.map((book, index) => {
                  const ratio = mostBorrowed[0]?.borrow_count
                    ? Math.max(8, Math.round((book.borrow_count / mostBorrowed[0].borrow_count) * 100))
                    : 8;

                  return (
                    <div
                      key={book.id}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                              {index + 1}
                            </span>
                            <p className="truncate text-sm font-semibold text-slate-900">{book.title}</p>
                          </div>
                          <p className="truncate text-xs text-slate-500">{book.author}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-slate-900">{book.borrow_count || 0}</p>
                          <p className="text-xs text-slate-500">borrows</p>
                        </div>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 transition-all duration-700"
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
