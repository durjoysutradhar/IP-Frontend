import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Ban,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Filter,
  Plus,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingDown,
  TrendingUp,
  User as UserIcon,
  X,
  XCircle
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'verification_pending', label: 'Verification Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' }
];

const REASON_OPTIONS = [
  { value: '', label: 'All Reasons' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'lost_book', label: 'Lost Book' },
  { value: 'damaged_book', label: 'Damaged Book' }
];

const VIEW_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'review', label: 'Needs Review' },
  { key: 'closed', label: 'Closed' }
];

const formatCurrency = (value) => `৳${Number(value || 0).toFixed(2)}`;

const staggerClass = (isReady) =>
  `transition-all duration-700 ${isReady ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`;

const ManageFines = () => {
  const [stats, setStats] = useState(null);
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPageReady, setIsPageReady] = useState(false);

  const [statusFilter, setStatusFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [highValueOnly, setHighValueOnly] = useState(false);
  const [quickView, setQuickView] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [recordForm, setRecordForm] = useState({
    userId: '',
    borrowId: '',
    amount: '',
    fineReason: 'lost_book',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter, reasonFilter, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => setIsPageReady(true), 40);
    return () => clearTimeout(timer);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsResult, finesResult] = await Promise.allSettled([
        api.get('/fine/stats'),
        api.get('/fine/admin/all', {
          params: {
            status: statusFilter,
            reason: reasonFilter,
            page: currentPage,
            limit: 20
          }
        })
      ]);

      const statsRes = statsResult.status === 'fulfilled' ? statsResult.value : null;
      const finesRes = finesResult.status === 'fulfilled' ? finesResult.value : null;

      const finePayload = finesRes?.data?.data;
      const normalizedFines = Array.isArray(finePayload)
        ? finePayload
        : Array.isArray(finePayload?.rows)
          ? finePayload.rows
          : Array.isArray(finesRes?.data?.rows)
            ? finesRes.data.rows
            : [];

      setStats(statsRes?.data?.data || {
        totalUnpaidAmount: 0,
        totalPaidAmount: 0,
        finesByReason: [],
        byPaymentStatus: [],
        topFineStudents: []
      });
      setFines(normalizedFines);
      setTotalPages(
        finesRes?.data?.pages ||
        finesRes?.data?.totalPages ||
        finesRes?.data?.pagination?.totalPages ||
        1
      );

      if (finesResult.status === 'rejected') {
        throw finesResult.reason;
      }

      setError(statsResult.status === 'rejected' ? 'Stats temporarily unavailable. Fines list is loaded.' : '');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelFine = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    try {
      await api.put(`/fine/${selectedFine.id}/cancel`, { reason: cancelReason });
      alert('Fine cancelled successfully');
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedFine(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel fine');
    }
  };

  const handleApproveFine = async (fineId) => {
    try {
      setIsProcessing(true);
      await api.put(`/fine/${fineId}/approve`);
      alert('Fine payment approved successfully');
      setShowApprovalModal(false);
      setSelectedFine(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve fine');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectFine = async (fineId) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setIsProcessing(true);
      await api.put(`/fine/${fineId}/reject`, { reason: rejectionReason });
      alert('Fine payment rejected. Student will need to resubmit.');
      setShowApprovalModal(false);
      setRejectionReason('');
      setSelectedFine(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject fine');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecordFine = async (e) => {
    e.preventDefault();

    if (!recordForm.userId || !recordForm.amount || !recordForm.fineReason) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await api.post('/fine', {
        userId: parseInt(recordForm.userId, 10),
        borrowId: recordForm.borrowId ? parseInt(recordForm.borrowId, 10) : null,
        amount: parseFloat(recordForm.amount),
        fineReason: recordForm.fineReason,
        notes: recordForm.notes
      });

      alert('Fine recorded successfully');
      setShowRecordModal(false);
      setRecordForm({ userId: '', borrowId: '', amount: '', fineReason: 'lost_book', notes: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record fine');
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setReasonFilter('');
    setSortBy('latest');
    setHighValueOnly(false);
    setQuickView('all');
    setCurrentPage(1);
  };

  const exportCurrentView = () => {
    const header = ['Student', 'Email', 'Book', 'Reason', 'Amount', 'Status', 'Date'];
    const rows = visibleFines.map((fine) => [
      fine.user?.name || '-',
      fine.user?.email || '-',
      fine.borrowedBook?.book?.title || '-',
      fine.fine_reason || '-',
      Number(fine.amount || 0).toFixed(2),
      fine.payment_status || '-',
      fine.createdAt ? new Date(fine.createdAt).toLocaleDateString() : '-'
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).split('"').join('""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fines-page-${currentPage}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const statusCountMap = useMemo(() => {
    return (Array.isArray(fines) ? fines : []).reduce((acc, fine) => {
      const key = fine.payment_status || 'pending';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [fines]);

  const visibleFines = useMemo(() => {
    let result = [...(Array.isArray(fines) ? fines : [])];

    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();
      result = result.filter((fine) => {
        return (
          fine.user?.name?.toLowerCase().includes(search) ||
          fine.user?.email?.toLowerCase().includes(search) ||
          fine.borrowedBook?.book?.title?.toLowerCase().includes(search)
        );
      });
    }

    if (highValueOnly) {
      result = result.filter((fine) => Number(fine.amount || 0) >= 500);
    }

    if (quickView === 'open') {
      result = result.filter((fine) => ['pending', 'verification_pending', 'rejected'].includes(fine.payment_status));
    } else if (quickView === 'review') {
      result = result.filter((fine) => fine.payment_status === 'verification_pending');
    } else if (quickView === 'closed') {
      result = result.filter((fine) => ['paid', 'cancelled'].includes(fine.payment_status));
    }

    if (sortBy === 'amount_high') {
      result.sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0));
    } else if (sortBy === 'amount_low') {
      result.sort((a, b) => Number(a.amount || 0) - Number(b.amount || 0));
    } else if (sortBy === 'name_az') {
      result.sort((a, b) => (a.user?.name || '').localeCompare(b.user?.name || ''));
    } else {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return result;
  }, [fines, highValueOnly, quickView, searchQuery, sortBy]);

  const unpaid = Number(stats?.totalUnpaidAmount || 0);
  const paid = Number(stats?.totalPaidAmount || 0);
  const totalCashFlow = unpaid + paid;
  const recoveredRate = totalCashFlow > 0 ? (paid / totalCashFlow) * 100 : 0;

  const pendingVerification = statusCountMap.verification_pending || 0;
  const pendingManual = statusCountMap.pending || 0;

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      verification_pending: 'bg-sky-50 text-sky-700 border-sky-200',
      paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      rejected: 'bg-orange-50 text-orange-700 border-orange-200',
      cancelled: 'bg-slate-100 text-slate-700 border-slate-200'
    };

    const icons = {
      pending: Clock,
      verification_pending: Clock,
      paid: CheckCircle,
      rejected: XCircle,
      cancelled: XCircle
    };

    const Icon = icons[status] || Clock;
    const label = status === 'verification_pending'
      ? 'Verifying'
      : `${status?.charAt(0)?.toUpperCase() || 'P'}${status?.slice(1) || 'ending'}`;

    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status] || styles.pending}`}>
        <Icon className="mr-1 h-3.5 w-3.5" />
        {label}
      </span>
    );
  };

  const getReasonBadge = (reason) => {
    const styles = {
      overdue: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
      lost_book: 'bg-rose-50 text-rose-700 ring-rose-200',
      damaged_book: 'bg-orange-50 text-orange-700 ring-orange-200'
    };

    const labels = {
      overdue: 'Overdue',
      lost_book: 'Lost Book',
      damaged_book: 'Damaged'
    };

    return (
      <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[reason] || 'bg-slate-50 text-slate-700 ring-slate-200'}`}>
        {labels[reason] || reason}
      </span>
    );
  };

  if (loading && !stats) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-600"></div>
            <p className="mt-4 text-gray-600">Loading fine command center...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
    <div className="space-y-6 pb-4">
      <section className={`relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-amber-50 via-white to-teal-50 p-6 shadow-[0_20px_70px_-35px_rgba(21,128,61,0.45)] md:p-8 ${staggerClass(isPageReady)}`}>
        <div className="pointer-events-none absolute -left-16 -top-12 h-44 w-44 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 right-0 h-48 w-48 rounded-full bg-teal-200/35 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Fine Command Center
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Fine Management</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
              Monitor collection flow, verify incoming payments quickly, and resolve penalties with confidence.
            </p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto">
            <button
              onClick={fetchData}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:text-teal-700"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={exportCurrentView}
              disabled={!visibleFines.length}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="mr-2 h-4 w-4" />
              Export View
            </button>
            <button
              onClick={() => setShowRecordModal(true)}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-teal-500/30"
            >
              <Plus className="mr-2 h-4 w-4" />
              Record Fine
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-center rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
          <AlertCircle className="mr-2 h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className={`${staggerClass(isPageReady)} rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm`} style={{ transitionDelay: '80ms' }}>
          <div className="mb-3 flex items-start justify-between">
            <div className="rounded-xl bg-cyan-100 p-2.5 text-cyan-700">
              <DollarSign className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-700">Open Balance</span>
          </div>
          <p className="text-sm text-slate-500">Total Unpaid</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(unpaid)}</p>
        </article>

        <article className={`${staggerClass(isPageReady)} rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm`} style={{ transitionDelay: '140ms' }}>
          <div className="mb-3 flex items-start justify-between">
            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
              <CheckCircle className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Collected</span>
          </div>
          <p className="text-sm text-slate-500">Total Paid</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(paid)}</p>
        </article>

        <article className={`${staggerClass(isPageReady)} rounded-2xl border border-sky-100 bg-white p-5 shadow-sm`} style={{ transitionDelay: '200ms' }}>
          <div className="mb-3 flex items-start justify-between">
            <div className="rounded-xl bg-sky-100 p-2.5 text-sky-700">
              <Clock className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700">Action Queue</span>
          </div>
          <p className="text-sm text-slate-500">Verification + Pending</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{pendingVerification + pendingManual}</p>
        </article>

        <article className={`${staggerClass(isPageReady)} rounded-2xl border border-amber-100 bg-white p-5 shadow-sm`} style={{ transitionDelay: '260ms' }}>
          <div className="mb-3 flex items-start justify-between">
            <div className="rounded-xl bg-amber-100 p-2.5 text-amber-700">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">Efficiency</span>
          </div>
          <p className="text-sm text-slate-500">Recovery Rate</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{recoveredRate.toFixed(1)}%</p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <article className={`${staggerClass(isPageReady)} rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-8`} style={{ transitionDelay: '320ms' }}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <SlidersHorizontal className="h-4 w-4" />
                Smart Filters
              </div>
              <p className="mt-1 text-xs text-slate-500">Narrow down by status, reason, value, and keyword in one pass.</p>
            </div>
            <div className="flex items-center gap-2">
              {VIEW_OPTIONS.map((view) => (
                <button
                  key={view.key}
                  onClick={() => setQuickView(view.key)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    quickView === view.key
                      ? 'border-teal-300 bg-teal-100 text-teal-800'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:text-teal-700'
                  }`}
                >
                  {view.label}
                </button>
              ))}
              <button
                onClick={resetFilters}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-teal-200 hover:text-teal-700"
              >
                Reset Filters
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value || 'all'} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Reason</label>
              <select
                value={reasonFilter}
                onChange={(e) => {
                  setReasonFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
              >
                {REASON_OPTIONS.map((option) => (
                  <option key={option.value || 'all'} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
              >
                <option value="latest">Latest First</option>
                <option value="amount_high">Amount: High to Low</option>
                <option value="amount_low">Amount: Low to High</option>
                <option value="name_az">Student: A to Z</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Search</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Name, email, book..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-all focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setStatusFilter('verification_pending');
                setCurrentPage(1);
              }}
              className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 transition-transform hover:-translate-y-0.5"
            >
              Verification Queue ({pendingVerification})
            </button>
            <button
              onClick={() => {
                setReasonFilter('lost_book');
                setCurrentPage(1);
              }}
              className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 transition-transform hover:-translate-y-0.5"
            >
              Lost Books
            </button>
            <button
              onClick={() => setHighValueOnly((prev) => !prev)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-transform hover:-translate-y-0.5 ${
                highValueOnly
                  ? 'border-amber-300 bg-amber-100 text-amber-800'
                  : 'border-slate-200 bg-slate-100 text-slate-700'
              }`}
            >
              High Value (&gt;= 500)
            </button>
          </div>
        </article>

        <article className={`${staggerClass(isPageReady)} rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-4`} style={{ transitionDelay: '380ms' }}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Filter className="h-4 w-4" />
              Operational Pulse
            </div>
            <TrendingDown className="h-4 w-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {[
              { label: 'Pending', key: 'pending', color: 'bg-amber-400' },
              { label: 'Verifying', key: 'verification_pending', color: 'bg-sky-400' },
              { label: 'Paid', key: 'paid', color: 'bg-emerald-400' },
              { label: 'Rejected', key: 'rejected', color: 'bg-orange-400' }
            ].map((row) => {
              const value = statusCountMap[row.key] || 0;
              const percent = fines.length ? Math.round((value / fines.length) * 100) : 0;

              return (
                <div key={row.key}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">{row.label}</span>
                    <span className="text-slate-500">{value} ({percent}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className={`h-2 rounded-full ${row.color} transition-all duration-700`}
                      style={{ width: `${Math.max(percent, value ? 8 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-xl border border-cyan-100 bg-cyan-50/60 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-cyan-700">Current Slice</p>
            <p className="mt-1 text-lg font-bold text-cyan-900">{visibleFines.length} Records Visible</p>
            <p className="text-xs text-cyan-700">From page {currentPage} dataset after local filters</p>
          </div>
        </article>
      </section>

      <section className={`${staggerClass(isPageReady)} overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm`} style={{ transitionDelay: '440ms' }}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/90">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Student</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Book</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {visibleFines.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-14 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <AlertCircle className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">No fines found</p>
                    <p className="mt-1 text-xs text-slate-500">Try resetting filters or changing the search text.</p>
                  </td>
                </tr>
              ) : (
                visibleFines.map((fine) => (
                  <tr key={fine.id} className="group transition-colors hover:bg-cyan-50/40">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 transition-transform duration-200 group-hover:scale-105">
                          <UserIcon className="h-5 w-5" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-semibold text-slate-900">{fine.user?.name || '-'}</p>
                          <p className="text-xs text-slate-500">{fine.user?.email || '-'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {fine.borrowedBook?.book ? (
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{fine.borrowedBook.book.title}</p>
                          <p className="text-xs text-slate-500">{fine.borrowedBook.book.author}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">N/A</span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">{getReasonBadge(fine.fine_reason)}</td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{formatCurrency(fine.amount)}</p>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">{getStatusBadge(fine.payment_status)}</td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center text-sm text-slate-500">
                        <Calendar className="mr-1.5 h-4 w-4" />
                        {fine.createdAt ? new Date(fine.createdAt).toLocaleDateString() : '-'}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {fine.payment_status === 'verification_pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedFine(fine);
                              setShowApprovalModal(true);
                            }}
                            className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                          >
                            <CheckCircle className="mr-1 inline h-3.5 w-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedFine(fine);
                              setShowApprovalModal(true);
                            }}
                            className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                          >
                            <XCircle className="mr-1 inline h-3.5 w-3.5" />
                            Reject
                          </button>
                        </div>
                      )}

                      {fine.payment_status === 'pending' && (
                        <button
                          onClick={() => {
                            setSelectedFine(fine);
                            setShowCancelModal(true);
                          }}
                          className="inline-flex items-center rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                        >
                          <Ban className="mr-1 h-3.5 w-3.5" />
                          Cancel
                        </button>
                      )}

                      {fine.payment_status === 'paid' && fine.transaction_id && (
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">Txn: {fine.transaction_id}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/80 px-6 py-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm font-medium text-slate-600">Page {currentPage} of {totalPages}</span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </section>

      {showApprovalModal && selectedFine?.payment_status === 'verification_pending' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Verify Payment</h3>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setRejectionReason('');
                  setSelectedFine(null);
                }}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 p-4">
              <p className="text-sm text-slate-700">
                <strong>Student:</strong> {selectedFine?.user?.name}<br />
                <strong>Amount:</strong> {formatCurrency(selectedFine?.amount || 0)}<br />
                <strong>Transaction ID:</strong> <span className="font-mono">{selectedFine?.transaction_id || '-'}</span>
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleApproveFine(selectedFine.id)}
                disabled={isProcessing}
                className="flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                {isProcessing ? 'Processing...' : 'Approve Payment'}
              </button>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Reject Reason</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows="3"
                  placeholder="Invalid transaction ID, duplicate payment, etc."
                  className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition-all focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                />
              </div>

              <button
                onClick={() => handleRejectFine(selectedFine.id)}
                disabled={isProcessing || !rejectionReason.trim()}
                className="flex w-full items-center justify-center rounded-xl bg-rose-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
              >
                <XCircle className="mr-2 h-5 w-5" />
                {isProcessing ? 'Processing...' : 'Reject Payment'}
              </button>

              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setRejectionReason('');
                  setSelectedFine(null);
                }}
                disabled={isProcessing}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Cancel Fine</h3>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setSelectedFine(null);
                }}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <p className="mb-3 text-sm text-slate-600">
              Fine: <span className="font-semibold text-slate-900">{formatCurrency(selectedFine?.amount || 0)}</span> for {selectedFine?.user?.name || 'Unknown'}
            </p>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
              rows="4"
              className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition-all focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setSelectedFine(null);
                }}
                className="rounded-xl border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={handleCancelFine}
                className="rounded-xl bg-rose-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-rose-700"
              >
                Cancel Fine
              </button>
            </div>
          </div>
        </div>
      )}

      {showRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Record New Fine</h3>
              <button
                onClick={() => {
                  setShowRecordModal(false);
                  setRecordForm({ userId: '', borrowId: '', amount: '', fineReason: 'lost_book', notes: '' });
                }}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleRecordFine} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">User ID *</label>
                <input
                  type="number"
                  required
                  value={recordForm.userId}
                  onChange={(e) => setRecordForm({ ...recordForm, userId: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition-all focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Borrow ID (optional)</label>
                <input
                  type="number"
                  value={recordForm.borrowId}
                  onChange={(e) => setRecordForm({ ...recordForm, borrowId: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition-all focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Fine Reason *</label>
                <select
                  required
                  value={recordForm.fineReason}
                  onChange={(e) => setRecordForm({ ...recordForm, fineReason: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition-all focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                >
                  <option value="overdue">Overdue</option>
                  <option value="lost_book">Lost Book</option>
                  <option value="damaged_book">Damaged Book</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Amount (৳) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={recordForm.amount}
                  onChange={(e) => setRecordForm({ ...recordForm, amount: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition-all focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
                <textarea
                  rows="3"
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                  className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition-all focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowRecordModal(false);
                    setRecordForm({ userId: '', borrowId: '', amount: '', fineReason: 'lost_book', notes: '' });
                  }}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 px-4 py-2.5 font-semibold text-white transition-opacity hover:opacity-95"
                >
                  Record Fine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
};

export default ManageFines;
