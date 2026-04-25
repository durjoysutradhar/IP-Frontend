import { useState, useEffect, useMemo } from 'react';
import StudentLayout from '../../components/StudentLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  AlertCircle,
  RotateCcw,
  BookX,
  Clock,
  BookCheck,
  Library,
  CalendarClock,
  History,
  ArrowRight,
  ShieldAlert,
  Search,
  Sparkles
} from 'lucide-react';
import api from '../../utils/api';

const MyBorrows = () => {
  const defaultMaxAllowed = 10;

  const [activeBorrows, setActiveBorrows] = useState([]);
  const [historyBorrows, setHistoryBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCount, setActiveCount] = useState(0);
  const [maxAllowed, setMaxAllowed] = useState(defaultMaxAllowed);
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [historyQuery, setHistoryQuery] = useState('');
  const [historyVisibleCount, setHistoryVisibleCount] = useState(10);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    fetchBorrows();
  }, []);

  useEffect(() => {
    if (loading) {
      setAnimateIn(false);
      return;
    }

    const timer = setTimeout(() => setAnimateIn(true), 90);
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    // Reset visible rows when user searches history
    setHistoryVisibleCount(10);
  }, [historyQuery]);

  const fetchBorrows = async () => {
    setLoading(true);
    setError('');
    try {
      const [currentRes, historyRes] = await Promise.all([
        api.get('/borrow/current'),
        api.get('/borrow/history', { params: { limit: 100 } })
      ]);

      const currentData = currentRes.data.data || {};
      const currentBorrows = Array.isArray(currentData)
        ? currentData
        : (currentData.borrows || []);

      setActiveBorrows(currentBorrows);
      setActiveCount(currentData.total_active_borrows || currentBorrows.length);
      setMaxAllowed(currentData.max_allowed_borrows || defaultMaxAllowed);

      const history = historyRes.data.data?.borrows || [];
      const historyFiltered = history.filter(borrow =>
        ['returned', 'closed'].includes(borrow.status)
      );
      setHistoryBorrows(historyFiltered);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Error fetching borrowed books';
      setError(errorMsg);
    }
    setLoading(false);
  };

  const handleRenew = async (borrowId) => {
    if (!window.confirm('Renew this book?')) return;

    try {
      await api.put(`/borrow/${borrowId}/renew`);
      alert('Book renewed successfully!');
      fetchBorrows();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to renew book');
    }
  };

  const handleReturn = async (borrowId) => {
    if (!window.confirm('Submit a return request for this book?')) return;

    try {
      const response = await api.put(`/borrow/${borrowId}/return`);
      const { message } = response.data;
      
      alert(message);
      
      fetchBorrows();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to return book');
    }
  };

  const handleReportLost = async (borrowId) => {
    if (!window.confirm('Report this book as lost?')) return;

    try {
      await api.post(`/fine/report-lost/${borrowId}`);
      alert('Book reported as lost.');
      fetchBorrows();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to report lost book');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      issued: 'bg-blue-100 text-blue-700 border-blue-200',
      overdue: 'bg-rose-100 text-rose-700 border-rose-200',
      return_requested: 'bg-amber-100 text-amber-700 border-amber-200',
      returned: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      lost: 'bg-slate-100 text-slate-700 border-slate-200',
      closed: 'bg-slate-200 text-slate-700 border-slate-300'
    };

    const label = status === 'return_requested' ? 'return requested' : status;

    return (
      <span className={`inline-block rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${styles[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
        {label}
      </span>
    );
  };

  const getCountdownMeta = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        text: `Overdue by ${Math.abs(diffDays)} days`,
        tone: 'text-rose-700 bg-rose-100 border-rose-200'
      };
    }

    if (diffDays <= 3) {
      return {
        text: `Due in ${diffDays} days`,
        tone: 'text-amber-700 bg-amber-100 border-amber-200'
      };
    }

    return {
      text: `Due in ${diffDays} days`,
      tone: 'text-emerald-700 bg-emerald-100 border-emerald-200'
    };
  };

  const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getBorrowCardTone = (status) => {
    const tones = {
      issued: {
        border: 'border-cyan-300/70',
        bg: 'bg-gradient-to-br from-cyan-50 via-white to-blue-50',
        rail: 'from-sky-500 to-cyan-500'
      },
      overdue: {
        border: 'border-rose-300/70',
        bg: 'bg-gradient-to-br from-rose-50 via-white to-orange-50',
        rail: 'from-rose-500 to-orange-500'
      },
      return_requested: {
        border: 'border-amber-300/70',
        bg: 'bg-gradient-to-br from-amber-50 via-white to-yellow-50',
        rail: 'from-amber-500 to-yellow-500'
      }
    };

    return tones[status] || {
      border: 'border-slate-300/70',
      bg: 'bg-gradient-to-br from-slate-50 via-white to-slate-100',
      rail: 'from-slate-500 to-slate-400'
    };
  };

  const overdueCount = activeBorrows.filter((borrow) => borrow.status === 'overdue').length;
  const returnRequestedCount = activeBorrows.filter((borrow) => borrow.status === 'return_requested').length;
  const availableSlots = Math.max(maxAllowed - activeCount, 0);
  const capacityPercent = maxAllowed > 0 ? Math.min((activeCount / maxAllowed) * 100, 100) : 0;

  const filteredActiveBorrows = useMemo(() => {
    if (activeFilter === 'all') return activeBorrows;
    return activeBorrows.filter((borrow) => borrow.status === activeFilter);
  }, [activeBorrows, activeFilter]);

  const filteredHistoryBorrows = useMemo(() => {
    const query = historyQuery.trim().toLowerCase();
    if (!query) return historyBorrows;

    return historyBorrows.filter((borrow) => {
      const title = (borrow.book?.title || '').toLowerCase();
      const author = (borrow.book?.author || '').toLowerCase();
      return title.includes(query) || author.includes(query) || String(borrow.id).includes(query);
    });
  }, [historyBorrows, historyQuery]);

  const visibleHistoryBorrows = filteredHistoryBorrows.slice(0, historyVisibleCount);

  return (
    <StudentLayout>
      <div className="deck-shell space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">

        <div className="relative z-10 space-y-6 sm:space-y-8">
          <section
            className={`deck-hero sd-enter sd-shine overflow-hidden rounded-3xl p-6 text-white sm:p-8 ${
              animateIn ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-sky-100">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  Borrow Intelligence Desk
                </div>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">My Borrows</h1>
                <p className="mt-2 max-w-2xl text-sm text-sky-100/90 sm:text-base">
                  Monitor active borrows, renew on time, and track your complete borrowing record with clarity.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-sm">
                  <p className="text-xs text-sky-100">Active</p>
                  <p className="text-xl font-black text-white">{activeCount}</p>
                </div>
                <div className="rounded-xl border border-rose-200/40 bg-rose-400/10 px-3 py-2 backdrop-blur-sm">
                  <p className="text-xs text-rose-100">Overdue</p>
                  <p className="text-xl font-black text-rose-100">{overdueCount}</p>
                </div>
                <div className="col-span-2 rounded-xl border border-emerald-200/40 bg-emerald-400/10 px-3 py-2 backdrop-blur-sm sm:col-span-1">
                  <p className="text-xs text-emerald-100">Slots Left</p>
                  <p className="text-xl font-black text-emerald-100">{availableSlots}</p>
                </div>
              </div>
            </div>

            <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm xl:col-span-2">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Library className="h-5 w-5 text-cyan-200" />
                    <h2 className="text-lg font-semibold text-white">Borrow Capacity</h2>
                  </div>
                  <span className="text-sm font-semibold text-sky-100">{activeCount} / {maxAllowed}</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/20">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${capacityPercent > 85 ? 'bg-rose-400' : 'bg-cyan-300'}`}
                    style={{ width: `${capacityPercent}%` }}
                  />
                </div>

                <p className="mt-3 text-sm text-sky-100/90">
                  {availableSlots > 0
                    ? `You can still borrow ${availableSlots} book(s).`
                    : 'Borrow limit reached. Return a book to borrow more.'}
                </p>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-200" />
                  <h3 className="text-base font-semibold text-white">Attention Queue</h3>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between rounded-lg bg-amber-300/20 px-3 py-2 text-amber-100">
                    <span>Return requested</span>
                    <span className="font-semibold">{returnRequestedCount}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-rose-300/20 px-3 py-2 text-rose-100">
                    <span>Overdue books</span>
                    <span className="font-semibold">{overdueCount}</span>
                  </div>
                </div>
              </div>
            </section>
          </section>

          {error && (
            <div className="flex items-center rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0" />
              <div>
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          <section
            className={`sd-enter relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-sky-50/50 to-indigo-50/40 p-5 shadow-2xl backdrop-blur-sm ${
              animateIn ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: '180ms' }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500" />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900">Active Borrows</h2>
              <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                {filteredActiveBorrows.length} shown
              </span>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'issued', label: 'Issued' },
                { key: 'overdue', label: 'Overdue' },
                { key: 'return_requested', label: 'Return Requested' }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveFilter(item.key)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-300 ${
                    activeFilter === item.key
                      ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                      : 'border-slate-300 bg-white text-slate-700 hover:-translate-y-0.5 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

          {loading ? (
            <LoadingSpinner size="md" className="py-12" />
          ) : filteredActiveBorrows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-slate-500">
              <p>No borrows match this filter</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActiveBorrows.map((borrow, index) => {
                const countdownMeta = getCountdownMeta(borrow.due_date);
                const tone = getBorrowCardTone(borrow.status);

                return (
                  <div
                    key={borrow.id}
                    className={`sd-enter sd-shine group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_40px_-28px_rgba(15,23,42,0.55)] ${tone.border} ${tone.bg} ${
                      animateIn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    }`}
                    style={{ transitionDelay: `${220 + index * 50}ms` }}
                  >
                    <div className={`pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${tone.rail}`} />
                    <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white/60 blur-2xl" />
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1 pl-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <p className="truncate text-base font-semibold text-slate-900">{borrow.book?.title}</p>
                          {getStatusBadge(borrow.status)}
                        </div>

                        <p className="mb-3 text-sm text-slate-500">{borrow.book?.author || 'Unknown author'}</p>

                        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                          <div className="rounded-lg border border-slate-200/80 bg-white/90 px-3 py-2 shadow-sm">
                            <p className="text-xs text-slate-500">Issue Date</p>
                            <p className="font-medium text-slate-700">{formatDate(borrow.issue_date)}</p>
                          </div>
                          <div className="rounded-lg border border-slate-200/80 bg-white/90 px-3 py-2 shadow-sm">
                            <p className="text-xs text-slate-500">Due Date</p>
                            <p className="font-medium text-slate-700">{formatDate(borrow.due_date)}</p>
                          </div>
                          <div className={`rounded-lg border px-3 py-2 ${countdownMeta.tone}`}>
                            <p className="text-xs opacity-80">Countdown</p>
                            <p className="font-semibold">{countdownMeta.text}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        {(borrow.status === 'issued' || borrow.status === 'overdue') && (
                          <>
                            <button
                              onClick={() => handleReturn(borrow.id)}
                              className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-100"
                            >
                              <BookCheck className="mr-1.5 h-4 w-4" />
                              Return
                            </button>

                            {borrow.status === 'issued' && (
                              <button
                                onClick={() => handleRenew(borrow.id)}
                                className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-100"
                              >
                                <RotateCcw className="mr-1.5 h-4 w-4" />
                                Renew
                              </button>
                            )}

                            <button
                              onClick={() => handleReportLost(borrow.id)}
                              className="inline-flex items-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:-translate-y-0.5 hover:bg-rose-100"
                            >
                              <BookX className="mr-1.5 h-4 w-4" />
                              Lost
                            </button>
                          </>
                        )}

                        {borrow.status === 'return_requested' && (
                          <span className="inline-flex items-center rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
                            <Clock className="mr-1.5 h-4 w-4" />
                            Pending approval
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </section>

          <section
            className={`sd-enter relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-indigo-50/40 to-cyan-50/30 p-5 shadow-2xl backdrop-blur-sm ${
              animateIn ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: '280ms' }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-500" />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
                <History className="h-5 w-5 text-slate-600" />
                Borrow History
              </h2>
              <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                {visibleHistoryBorrows.length} of {filteredHistoryBorrows.length} records
              </span>
            </div>

            <div className="mb-4 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={historyQuery}
                  onChange={(e) => setHistoryQuery(e.target.value)}
                  placeholder="Search history by title, author, or ID..."
                  className="w-full rounded-xl border border-slate-300 bg-white/90 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
            </div>

            {loading ? (
              <LoadingSpinner size="md" className="py-12" />
            ) : filteredHistoryBorrows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-slate-500">
                <p>No history records found</p>
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="hidden bg-gradient-to-r from-slate-100 via-white to-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 md:grid md:grid-cols-12">
                    <span className="md:col-span-5">Book</span>
                    <span className="md:col-span-2">Issue Date</span>
                    <span className="md:col-span-2">Return Date</span>
                    <span className="md:col-span-2">Status</span>
                    <span className="text-right">Details</span>
                  </div>

                  <div className="divide-y divide-slate-200">
                    {visibleHistoryBorrows.map((borrow) => {
                    const isOpen = expandedHistoryId === borrow.id;

                    return (
                      <div key={borrow.id} className="bg-white">
                        <div className="grid grid-cols-1 gap-3 bg-gradient-to-r from-white via-slate-50/30 to-white px-4 py-3 text-sm transition hover:from-cyan-50 hover:via-white hover:to-indigo-50 md:grid-cols-12 md:items-center">
                          <div className="md:col-span-5">
                            <p className="font-semibold text-slate-900">{borrow.book?.title || 'Unknown book'}</p>
                            <p className="text-xs text-slate-500">Borrow ID #{borrow.id}</p>
                          </div>
                          <div className="text-slate-600 md:col-span-2">{formatDate(borrow.issue_date)}</div>
                          <div className="text-slate-600 md:col-span-2">{borrow.return_date ? formatDate(borrow.return_date) : '-'}</div>
                          <div className="md:col-span-2">{getStatusBadge(borrow.status)}</div>
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => setExpandedHistoryId(isOpen ? null : borrow.id)}
                              className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold text-primary-700 transition hover:bg-primary-50"
                            >
                              {isOpen ? 'hide' : 'record'}
                              <ArrowRight className={`ml-1 h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {isOpen && (
                          <div className="grid grid-cols-1 gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Author</p>
                              <p className="text-slate-700">{borrow.book?.author || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Due Date</p>
                              <p className="text-slate-700">{borrow.due_date ? formatDate(borrow.due_date) : '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Returned On</p>
                              <p className="text-slate-700">{borrow.return_date ? formatDate(borrow.return_date) : '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
                              <div className="mt-1">{getStatusBadge(borrow.status)}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                    })}
                  </div>
                </div>

                {filteredHistoryBorrows.length > 10 && (
                  <div className="mt-4 flex items-center justify-center">
                    {historyVisibleCount < filteredHistoryBorrows.length ? (
                      <button
                        type="button"
                        onClick={() => setHistoryVisibleCount((prev) => Math.min(prev + 10, filteredHistoryBorrows.length))}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        See more
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setHistoryVisibleCount(10)}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Show less
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </StudentLayout>
  );
};

export default MyBorrows;
