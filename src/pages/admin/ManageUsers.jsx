import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Award,
  BookOpen,
  BookX,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  PieChart,
  RefreshCcw,
  Search,
  Shield,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  X
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../utils/api';

const revealClass = (ready) =>
  `transition-all duration-700 ${ready ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`;

const formatMoney = (value) => `৳${Number(value || 0).toFixed(2)}`;

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const [selectedUser, setSelectedUser] = useState(null);
  const [userActivity, setUserActivity] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => setIsPageReady(true), 40);
    return () => clearTimeout(timer);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users', {
        params: { search, limit: 100 }
      });
      const payload = response?.data?.data?.users;
      setUsers(Array.isArray(payload) ? payload : []);
      setError('');
    } catch (err) {
      setUsers([]);
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? All their data will be removed.')) {
      return;
    }

    try {
      await api.delete(`/users/${id}`);
      alert('User deleted successfully');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleViewActivity = async (user) => {
    setSelectedUser(user);
    setShowActivityModal(true);
    setActivityLoading(true);

    try {
      const response = await api.get(`/users/${user.id}/activity`);
      setUserActivity(response?.data?.data || null);
    } catch (err) {
      setUserActivity(null);
      alert('Failed to load user activity: ' + (err.response?.data?.message || err.message));
    } finally {
      setActivityLoading(false);
    }
  };

  const closeModal = () => {
    setShowActivityModal(false);
    setSelectedUser(null);
    setUserActivity(null);
  };

  const summary = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === 'admin').length;
    const teachers = users.filter((u) => u.role === 'teacher').length;
    const students = users.filter((u) => u.role === 'student').length;

    return { total, admins, teachers, students };
  }, [users]);

  const getRoleBadge = (role) => {
    const roleStyles = {
      admin: 'border-fuchsia-300 bg-fuchsia-100 text-fuchsia-800',
      teacher: 'border-cyan-300 bg-cyan-100 text-cyan-800',
      student: 'border-emerald-300 bg-emerald-100 text-emerald-800'
    };

    return (
      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${roleStyles[role] || 'border-slate-300 bg-slate-100 text-slate-700'}`}>
        {role}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      issued: 'bg-blue-100 text-blue-800',
      returned: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      lost: 'bg-gray-100 text-gray-800',
      closed: 'bg-gray-100 text-gray-600'
    };

    return (
      <span className={`rounded-full px-2 py-1 text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getFineStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-800',
      paid: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
      rejected: 'bg-orange-100 text-orange-800',
      verification_pending: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`rounded-full px-2 py-1 text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-6">
        <section className={`relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 p-6 shadow-[0_20px_70px_-32px_rgba(15,23,42,0.9)] md:p-8 ${revealClass(isPageReady)}`}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_30%,rgba(34,211,238,0.20),transparent_34%),radial-gradient(circle_at_82%_22%,rgba(236,72,153,0.16),transparent_36%),radial-gradient(circle_at_70%_88%,rgba(56,189,248,0.12),transparent_30%)]" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center rounded-full border border-cyan-400/40 bg-slate-800/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">
                User Intelligence Board
              </p>
              <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">Manage Users</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
                Review user lifecycle, inspect borrowing behavior, and take account-level actions quickly.
              </p>
            </div>

            <button
              onClick={fetchUsers}
              className="inline-flex items-center justify-center rounded-xl border border-cyan-400/40 bg-slate-800/70 px-4 py-2.5 text-sm font-semibold text-cyan-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-700/80"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh Users
            </button>
          </div>
        </section>

        {error && (
          <div className="flex items-center rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-800">
            <AlertCircle className="mr-2 h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className={`${revealClass(isPageReady)} rounded-2xl border border-cyan-200 bg-gradient-to-br from-white to-cyan-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md`} style={{ transitionDelay: '80ms' }}>
            <div className="mb-3 inline-flex rounded-xl bg-cyan-100 p-2.5 text-cyan-700"><Users className="h-5 w-5" /></div>
            <p className="text-sm text-slate-500">Total Users</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{summary.total}</p>
          </article>

          <article className={`${revealClass(isPageReady)} rounded-2xl border border-fuchsia-200 bg-gradient-to-br from-white to-fuchsia-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md`} style={{ transitionDelay: '140ms' }}>
            <div className="mb-3 inline-flex rounded-xl bg-fuchsia-100 p-2.5 text-fuchsia-700"><Shield className="h-5 w-5" /></div>
            <p className="text-sm text-slate-500">Admins</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{summary.admins}</p>
          </article>

          <article className={`${revealClass(isPageReady)} rounded-2xl border border-cyan-200 bg-gradient-to-br from-white to-sky-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md`} style={{ transitionDelay: '200ms' }}>
            <div className="mb-3 inline-flex rounded-xl bg-sky-100 p-2.5 text-sky-700"><UserCheck className="h-5 w-5" /></div>
            <p className="text-sm text-slate-500">Teachers</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{summary.teachers}</p>
          </article>

          <article className={`${revealClass(isPageReady)} rounded-2xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md`} style={{ transitionDelay: '260ms' }}>
            <div className="mb-3 inline-flex rounded-xl bg-emerald-100 p-2.5 text-emerald-700"><BookOpen className="h-5 w-5" /></div>
            <p className="text-sm text-slate-500">Students</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{summary.students}</p>
          </article>
        </section>

        <section className={`${revealClass(isPageReady)} rounded-2xl border border-slate-200 bg-white p-5 shadow-sm`} style={{ transitionDelay: '320ms' }}>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Search Users</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, department..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-all duration-200 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </section>

        <section className={`${revealClass(isPageReady)} overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm`} style={{ transitionDelay: '380ms' }}>
          {loading ? (
            <div className="py-14"><LoadingSpinner size="md" className="py-2" /></div>
          ) : users.length === 0 ? (
            <p className="py-14 text-center text-slate-500">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-gradient-to-r from-slate-900 to-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-100">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-100">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-100">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-100">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-100">Registered</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-100">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {users.map((user) => (
                    <tr key={user.id} className="group transition-colors duration-200 hover:bg-cyan-50/40">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900 transition-transform duration-200 group-hover:translate-x-1">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{user.department || '-'}</td>
                      <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{new Date(user.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewActivity(user)}
                            className="inline-flex items-center rounded-md border border-cyan-300 bg-cyan-100 px-2.5 py-1.5 text-xs font-semibold text-cyan-800 transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-200"
                            title="View Activity"
                          >
                            <Eye className="mr-1 h-3.5 w-3.5" />
                            Activity
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="inline-flex items-center rounded-md border border-rose-300 bg-rose-100 px-2.5 py-1.5 text-xs font-semibold text-rose-800 transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-200"
                            title="Delete User"
                          >
                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {showActivityModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="flex min-h-full items-start justify-center py-3 sm:py-6">
            <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]">
              <div className="z-10 flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-200">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedUser?.name || 'User'}</h2>
                  <p className="text-sm text-slate-300">{selectedUser?.email || ''}</p>
                </div>
              </div>
              <button onClick={closeModal} className="rounded-lg p-1 text-slate-300 transition hover:bg-slate-800 hover:text-white">
                <X className="h-6 w-6" />
              </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-6">
              {activityLoading ? (
                <LoadingSpinner size="lg" className="py-12" />
              ) : userActivity ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <TrendingUp className="h-5 w-5 text-cyan-600" />
                      Overview Statistics
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                      <div className="rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-4 text-white">
                        <BookOpen className="mb-2 h-8 w-8 opacity-85" />
                        <p className="text-sm opacity-90">Total Borrows</p>
                        <p className="text-3xl font-bold">{userActivity.statistics.totalBorrows}</p>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 p-4 text-white">
                        <CheckCircle className="mb-2 h-8 w-8 opacity-85" />
                        <p className="text-sm opacity-90">On-Time Returns</p>
                        <p className="text-3xl font-bold">{userActivity.statistics.onTimeReturns}</p>
                        <p className="mt-1 text-xs opacity-85">{userActivity.statistics.onTimePercentage}% rate</p>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-4 text-white">
                        <Clock className="mb-2 h-8 w-8 opacity-85" />
                        <p className="text-sm opacity-90">Late Returns</p>
                        <p className="text-3xl font-bold">{userActivity.statistics.lateReturns}</p>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-rose-500 to-red-600 p-4 text-white">
                        <BookX className="mb-2 h-8 w-8 opacity-85" />
                        <p className="text-sm opacity-90">Lost Books</p>
                        <p className="text-3xl font-bold">{userActivity.statistics.lostBooks}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <DollarSign className="h-5 w-5 text-cyan-600" />
                      Fine Summary
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm text-slate-600">Total Fines</p>
                        <p className="text-2xl font-bold text-slate-900">{formatMoney(userActivity.fines.total)}</p>
                      </div>
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <p className="text-sm text-amber-700">Pending</p>
                        <p className="text-2xl font-bold text-amber-900">{formatMoney(userActivity.fines.pending)}</p>
                      </div>
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <p className="text-sm text-emerald-700">Paid</p>
                        <p className="text-2xl font-bold text-emerald-900">{formatMoney(userActivity.fines.paid)}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                        <p className="font-semibold text-slate-800">By Type</p>
                        <p className="mt-1">Overdue: {userActivity.fines.counts.overdue}</p>
                        <p>Lost: {userActivity.fines.counts.lostBook}</p>
                        <p>Damaged: {userActivity.fines.counts.damagedBook}</p>
                      </div>
                    </div>
                  </div>

                  {userActivity.borrows.active.length > 0 && (
                    <div>
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                        <BookOpen className="h-5 w-5 text-cyan-600" />
                        Active Borrows ({userActivity.borrows.active.length})
                      </h3>
                      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Book</th>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Issue Date</th>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Due Date</th>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {userActivity.borrows.active.map((borrow) => (
                              <tr key={borrow.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3">
                                  <p className="text-sm font-medium text-slate-900">{borrow.book?.title}</p>
                                  <p className="text-xs text-slate-500">{borrow.book?.author}</p>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-600">{new Date(borrow.issue_date).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-sm text-slate-600">{new Date(borrow.due_date).toLocaleDateString()}</td>
                                <td className="px-4 py-3">{getStatusBadge(borrow.status)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {userActivity.borrows.mostBorrowedCategories.length > 0 && (
                    <div>
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                        <PieChart className="h-5 w-5 text-cyan-600" />
                        Most Borrowed Categories
                      </h3>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                        {userActivity.borrows.mostBorrowedCategories.map((cat, idx) => (
                          <div key={idx} className="rounded-lg border border-cyan-200 bg-cyan-50 p-3 text-center transition-transform duration-200 hover:-translate-y-0.5">
                            <p className="text-sm font-medium text-cyan-900">{cat.name}</p>
                            <p className="text-2xl font-bold text-cyan-700">{cat.count}</p>
                            <p className="text-xs text-cyan-700">books</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {userActivity.fines.history.length > 0 && (
                    <div>
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                        <AlertCircle className="h-5 w-5 text-cyan-600" />
                        Fine History ({userActivity.fines.history.length})
                      </h3>
                      <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white">
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="sticky top-0 bg-slate-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Book</th>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Reason</th>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Amount</th>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {userActivity.fines.history.map((fine) => (
                              <tr key={fine.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 text-sm text-slate-900">{fine.borrowedBook?.book?.title || 'N/A'}</td>
                                <td className="px-4 py-3 text-xs text-slate-700">
                                  {fine.fine_reason === 'overdue'
                                    ? 'Overdue'
                                    : fine.fine_reason === 'lost_book'
                                      ? 'Lost'
                                      : 'Damaged'}
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold text-slate-900">{formatMoney(fine.amount)}</td>
                                <td className="px-4 py-3">{getFineStatusBadge(fine.payment_status)}</td>
                                <td className="px-4 py-3 text-sm text-slate-600">{new Date(fine.createdAt).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <Calendar className="h-5 w-5 text-cyan-600" />
                      Recent Borrow History (Last 10)
                    </h3>
                    <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-200 bg-white">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="sticky top-0 bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Book</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Category</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Issue</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Due</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Return</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {userActivity.recentActivity.map((borrow) => (
                            <tr key={borrow.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3">
                                <p className="text-sm font-medium text-slate-900">{borrow.book?.title}</p>
                                <p className="text-xs text-slate-500">{borrow.book?.author}</p>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600">{borrow.book?.category?.name || '-'}</td>
                              <td className="px-4 py-3 text-sm text-slate-600">{new Date(borrow.issue_date).toLocaleDateString()}</td>
                              <td className="px-4 py-3 text-sm text-slate-600">{new Date(borrow.due_date).toLocaleDateString()}</td>
                              <td className="px-4 py-3 text-sm text-slate-600">{borrow.return_date ? new Date(borrow.return_date).toLocaleDateString() : '-'}</td>
                              <td className="px-4 py-3">{getStatusBadge(borrow.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="rounded-xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-sky-50 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
                          <Award className="h-8 w-8 text-cyan-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900">User Performance</h4>
                          <p className="text-sm text-slate-600">
                            {userActivity.statistics.onTimePercentage >= 90
                              ? 'Excellent'
                              : userActivity.statistics.onTimePercentage >= 70
                                ? 'Good'
                                : userActivity.statistics.onTimePercentage >= 50
                                  ? 'Fair'
                                  : 'Needs Improvement'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-cyan-700">{userActivity.statistics.onTimePercentage}%</p>
                        <p className="text-sm text-slate-600">On-time rate</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="py-12 text-center text-slate-500">Failed to load activity data</p>
              )}
              </div>

              <div className="flex justify-end border-t border-slate-200 bg-slate-50 p-6">
                <button
                  onClick={closeModal}
                  className="rounded-lg bg-slate-200 px-6 py-2 text-slate-700 transition-colors hover:bg-slate-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageUsers;
