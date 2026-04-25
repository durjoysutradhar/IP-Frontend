import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  BookX,
  AlertTriangle,
  Wallet,
  Activity,
  ChevronDown,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import api from '../../utils/api';
import StudentLayout from '../../components/StudentLayout';

export default function Fines() {
  const [fines, setFines] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [expandedFine, setExpandedFine] = useState(null);
  const [paying, setPaying] = useState(null);
  const [transactionIds, setTransactionIds] = useState({});
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [reportingLost, setReportingLost] = useState(null);
  const [showLostModal, setShowLostModal] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchData({ silent: false });
    const interval = setInterval(() => fetchData({ silent: true }), 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);
      const [finesRes, borrowsRes] = await Promise.all([
        api.get('/fine/my-fines'),
        api.get('/fine/my-borrows')
      ]);

      setFines(finesRes.data.data || []);
      setBorrows(borrowsRes.data.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching data');
      console.error('Error fetching data:', err);
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handlePayFine = async (fineId) => {
    const enteredTransactionId = transactionIds[fineId]?.trim();
    if (!enteredTransactionId) {
      alert('Please enter a transaction ID');
      return;
    }

    try {
      setPaying(fineId);
      await api.post(`/fine/${fineId}/pay`, { transactionId: enteredTransactionId });
      setPaymentSuccess(fineId);
      setTransactionIds((prev) => ({ ...prev, [fineId]: '' }));
      setPaying(null);
      
      // Refresh data after successful payment
      setTimeout(() => {
        fetchData({ silent: true });
        setPaymentSuccess(null);
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing payment');
      setPaying(null);
    }
  };

  const handleReportLost = async (borrowId) => {
    try {
      setReportingLost(borrowId);
      await api.post(`/fine/report-lost/${borrowId}`);
      setShowLostModal(null);
      alert('Book reported as lost. Fine has been recorded.');
      fetchData({ silent: true });
    } catch (err) {
      alert(err.response?.data?.message || 'Error reporting lost book');
    } finally {
      setReportingLost(null);
    }
  };

  const getStatusMeta = (status) => {
    switch (status) {
      case 'paid':
        return {
          label: 'Paid',
          badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          hint: 'Payment verified successfully'
        };
      case 'pending':
        return {
          label: 'Pending',
          badge: 'bg-rose-100 text-rose-700 border-rose-200',
          hint: 'Payment not submitted yet'
        };
      case 'verification_pending':
        return {
          label: 'Verification Pending',
          badge: 'bg-blue-100 text-blue-700 border-blue-200',
          hint: 'Awaiting admin review'
        };
      case 'rejected':
        return {
          label: 'Rejected',
          badge: 'bg-orange-100 text-orange-700 border-orange-200',
          hint: 'Resubmission needed'
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          badge: 'bg-slate-100 text-slate-700 border-slate-200',
          hint: 'No further action required'
        };
      default:
        return {
          label: status,
          badge: 'bg-blue-100 text-blue-700 border-blue-200',
          hint: ''
        };
    }
  };

  const getReasonDisplay = (reason) => {
    const reasons = {
      overdue: 'Overdue Fine',
      lost_book: 'Lost Book',
      damaged_book: 'Damaged Book'
    };
    return reasons[reason] || reason;
  };

  const formatDateTime = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const pendingFines = fines.filter((f) => f.payment_status === 'pending');
  const verificationPendingFines = fines.filter((f) => f.payment_status === 'verification_pending');
  const paidFines = fines.filter((f) => f.payment_status === 'paid');

  const totalPendingValue = pendingFines
    .reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);

  const totalPaidValue = paidFines
    .reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);

  const totalPending = totalPendingValue.toFixed(2);
  const totalPaid = totalPaidValue.toFixed(2);

  const totalFineValue = totalPendingValue + totalPaidValue;
  const collectionRate = totalFineValue > 0 ? (totalPaidValue / totalFineValue) * 100 : 0;
  const pendingRate = totalFineValue > 0 ? (totalPendingValue / totalFineValue) * 100 : 0;

  if (loading) {
    return (
      <StudentLayout>
        <div className="mx-auto max-w-7xl animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-3xl bg-slate-200" />
          ))}
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-700 bg-slate-950 p-6 text-slate-100 shadow-2xl sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(56,189,248,0.18),transparent_34%),radial-gradient(circle_at_85%_10%,rgba(249,115,22,0.18),transparent_28%),radial-gradient(circle_at_70%_88%,rgba(236,72,153,0.12),transparent_34%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(148,163,184,0.28)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.28)_1px,transparent_1px)] [background-size:26px_26px]" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300" />
                  </span>
                  FINANCE LEDGER // LIVE
                </div>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Fine Settlement Console</h1>
                <p className="mt-2 max-w-3xl text-sm text-slate-300 sm:text-base">
                  A command-style ledger where pending fines, verification state, and payment throughput are monitored in real time.
                </p>
              </div>

              <div className="rounded-xl border border-slate-600 bg-slate-900/70 p-3 backdrop-blur-sm">
                <button
                  onClick={() => fetchData({ silent: true })}
                  className="inline-flex items-center rounded-lg border border-slate-500 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Sync Ledger
                </button>
                <p className="mt-1 text-xs text-slate-400">
                  Last sync: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Not available'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3">
                <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-wide text-rose-200">
                  <span>Pending Amount</span>
                  <Clock className="h-4 w-4" />
                </div>
                <p className="text-2xl font-black text-rose-100">৳{totalPending}</p>
                <p className="text-xs text-rose-200/80">{pendingFines.length} pending fine(s)</p>
              </div>

              <div className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-3">
                <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-wide text-sky-200">
                  <span>Under Verification</span>
                  <Activity className="h-4 w-4" />
                </div>
                <p className="text-2xl font-black text-sky-100">{verificationPendingFines.length}</p>
                <p className="text-xs text-sky-200/80">Awaiting admin approval</p>
              </div>

              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3">
                <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-wide text-emerald-200">
                  <span>Paid Amount</span>
                  <CheckCircle className="h-4 w-4" />
                </div>
                <p className="text-2xl font-black text-emerald-100">৳{totalPaid}</p>
                <p className="text-xs text-emerald-200/80">{paidFines.length} paid fine(s)</p>
              </div>

              <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3">
                <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-wide text-amber-200">
                  <span>Total Records</span>
                  <Wallet className="h-4 w-4" />
                </div>
                <p className="text-2xl font-black text-amber-100">{fines.length}</p>
                <p className="text-xs text-amber-200/80">All fine entries</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
                  <span>Collection Progress</span>
                  <span className="text-emerald-300">{collectionRate.toFixed(1)}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-emerald-400 transition-all duration-700" style={{ width: `${collectionRate}%` }} />
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
                  <span>Outstanding Pressure</span>
                  <span className="text-rose-300">{pendingRate.toFixed(1)}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-rose-400 transition-all duration-700" style={{ width: `${pendingRate}%` }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
            {error}
          </div>
        )}

        {borrows.length > 0 && (
          <section className="overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-orange-50 p-5 shadow-lg">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
              <BookX className="h-5 w-5 text-amber-700" />
              Risk Watchlist: Active Borrows
            </h2>
            <div className="space-y-3">
              {borrows.map((borrow) => (
                <div
                  key={borrow.id}
                  className="group rounded-xl border border-amber-200/70 bg-white/90 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="mb-1 font-semibold text-slate-900">{borrow.book?.title}</h3>
                      <p className="mb-2 text-sm text-slate-500">{borrow.book?.author}</p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <div>
                          <span className="text-slate-500">Due: </span>
                          <span className="font-medium text-slate-700">{new Date(borrow.due_date).toLocaleDateString()}</span>
                        </div>
                        {borrow.overdueInfo && (
                          <>
                            <div>
                              <span className="text-slate-500">Status: </span>
                              <span className={`font-semibold ${
                                borrow.overdueInfo.status === 'overdue' ? 'text-rose-600' :
                                borrow.overdueInfo.status === 'in_grace_period' ? 'text-amber-600' :
                                'text-emerald-600'
                              }`}>
                                {borrow.overdueInfo.status === 'overdue' ? 'Overdue' :
                                 borrow.overdueInfo.status === 'in_grace_period' ? 'Grace Period' :
                                 'On Track'}
                              </span>
                            </div>
                            {borrow.overdueInfo.fine > 0 && (
                              <div>
                                <span className="text-slate-500">Pending Fine: </span>
                                <span className="font-bold text-amber-600">৳{borrow.overdueInfo.fine.toFixed(2)}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-slate-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        Hovering highlights records with live fine updates.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => setShowLostModal(borrow.id)}
                        disabled={reportingLost === borrow.id}
                        className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        Report Lost
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {showLostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 text-white">
              <div className="mb-4 flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-rose-400" />
                <h3 className="text-xl font-bold">Report Lost Book</h3>
              </div>
              <p className="mb-6 text-slate-300">
                Are you sure you want to report this book as lost? This will:
              </p>
              <ul className="mb-6 list-inside list-disc space-y-2 text-sm text-slate-400">
                <li>Create a lost book fine (৳500)</li>
                <li>Close this borrow record</li>
                <li>Cannot be undone</li>
              </ul>
              <div className="flex gap-3">
                <button
                  onClick={() => handleReportLost(showLostModal)}
                  disabled={reportingLost === showLostModal}
                  className="flex-1 rounded-lg bg-rose-600 py-2 font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
                >
                  {reportingLost === showLostModal ? 'Processing...' : 'Confirm'}
                </button>
                <button
                  onClick={() => setShowLostModal(null)}
                  disabled={reportingLost === showLostModal}
                  className="flex-1 rounded-lg bg-slate-700 py-2 font-semibold text-white transition-colors hover:bg-slate-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <section className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 p-5 text-slate-100 shadow-2xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
              <AlertCircle className="h-5 w-5 text-amber-300" />
              Fine Records
            </h2>
            <p className="text-xs text-slate-400">Ledger stream mode - click a row to expand details</p>
          </div>

          {fines.length === 0 && !error ? (
            <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50 py-10 text-center">
              <CheckCircle className="mx-auto mb-3 h-10 w-10 text-emerald-600" />
              <p className="font-semibold text-emerald-700">No fines on record</p>
              <p className="mt-1 text-sm text-emerald-600">Great work. Keep returning books on time.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-700">
              <div className="hidden bg-slate-900 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 md:grid md:grid-cols-12">
                <span className="md:col-span-4">Fine Type</span>
                <span className="md:col-span-2">Status</span>
                <span className="md:col-span-3">Created</span>
                <span className="md:col-span-2">Amount</span>
                <span className="text-right">Action</span>
              </div>

              <div className="divide-y divide-slate-800">
              {fines.map((fine) => {
                const statusMeta = getStatusMeta(fine.payment_status);
                const isOpen = expandedFine === fine.id;

                return (
                  <div key={fine.id} className="overflow-hidden bg-slate-950">
                    <button
                      className={`w-full px-4 py-3 text-left transition-all duration-200 ${
                        isOpen ? 'bg-slate-900' : 'bg-slate-950 hover:bg-slate-900/80'
                      }`}
                      onClick={() => setExpandedFine(isOpen ? null : fine.id)}
                    >
                      <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-12 md:items-center">
                        <div className="md:col-span-4">
                          <p className="font-semibold text-slate-100">{getReasonDisplay(fine.fine_reason)}</p>
                          <p className="mt-0.5 text-xs text-slate-400">ID #{fine.id}</p>
                        </div>

                        <div className="md:col-span-2">
                          <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.badge}`}>
                            {statusMeta.label}
                          </span>
                          <p className="mt-1 text-xs text-slate-400">{statusMeta.hint}</p>
                        </div>

                        <div className="text-sm text-slate-400 md:col-span-3">
                          {formatDateTime(fine.created_at)}
                        </div>

                        <div className="md:col-span-2">
                          <p className="text-lg font-bold text-amber-300">৳{parseFloat(fine.amount || 0).toFixed(2)}</p>
                        </div>

                        <div className="flex items-center justify-end gap-2 md:col-span-1">
                          {isOpen ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
                          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="space-y-4 border-t border-slate-800 bg-slate-900/80 p-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="text-xs uppercase tracking-wider text-slate-400">Created Date</label>
                            <p className="font-medium text-slate-100">{formatDateTime(fine.created_at)}</p>
                          </div>

                          {fine.payment_status === 'paid' && (
                            <div>
                              <label className="text-xs uppercase tracking-wider text-slate-400">Payment Date</label>
                              <p className="font-medium text-slate-100">{formatDateTime(fine.payment_date)}</p>
                            </div>
                          )}

                          {fine.transaction_id && (
                            <div>
                              <label className="text-xs uppercase tracking-wider text-slate-400">Transaction ID</label>
                              <p className="break-all rounded-md bg-slate-800 px-2 py-1 font-mono text-sm text-slate-200">
                                {fine.transaction_id}
                              </p>
                            </div>
                          )}

                          {fine.notes && (
                            <div className="md:col-span-2">
                              <label className="text-xs uppercase tracking-wider text-slate-400">Notes</label>
                              <p className="text-sm text-slate-200">{fine.notes}</p>
                            </div>
                          )}
                        </div>

                        {fine.borrowedBook && (
                          <div className="rounded-lg border border-slate-700 bg-slate-950 p-3">
                            <label className="text-xs uppercase tracking-wider text-slate-400">Associated Book</label>
                            {fine.borrowedBook.book ? (
                              <div className="mt-2 space-y-1">
                                <p className="font-semibold text-slate-100">{fine.borrowedBook.book.title}</p>
                                <p className="text-sm text-slate-300">{fine.borrowedBook.book.author}</p>
                                <p className="text-xs text-slate-400">ISBN: {fine.borrowedBook.book.isbn}</p>
                              </div>
                            ) : (
                              <p className="mt-2 text-sm text-slate-400">No book info available</p>
                            )}
                          </div>
                        )}

                        {fine.payment_status === 'pending' && (
                          <div className="rounded-lg border border-rose-300/40 bg-rose-500/10 p-4">
                            <h4 className="mb-3 font-semibold text-rose-100">Pay This Fine</h4>

                            {paymentSuccess === fine.id ? (
                              <div className="flex items-center gap-2 text-emerald-700">
                                <CheckCircle className="h-5 w-5" />
                                <span>Payment submitted for verification.</span>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div>
                                  <label className="mb-2 block text-sm font-medium text-slate-200">Transaction ID *</label>
                                  <input
                                    type="text"
                                    value={transactionIds[fine.id] || ''}
                                    onChange={(e) => setTransactionIds((prev) => ({ ...prev, [fine.id]: e.target.value }))}
                                    placeholder="Bank reference, bKash/Nagad TXN, or receipt number"
                                    className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    disabled={paying === fine.id}
                                  />
                                  <p className="mt-1 text-xs text-slate-400">
                                    Submit valid transaction details for admin verification.
                                  </p>
                                </div>

                                <button
                                  onClick={() => handlePayFine(fine.id)}
                                  disabled={paying === fine.id}
                                  className="inline-flex w-full items-center justify-center rounded-lg bg-cyan-500 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {paying === fine.id ? 'Processing...' : `Pay ৳${parseFloat(fine.amount || 0).toFixed(2)}`}
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {fine.payment_status === 'verification_pending' && (
                          <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                            <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                            <div>
                              <p className="font-semibold text-blue-800">Waiting for Admin Verification</p>
                              <p className="mt-1 text-sm text-blue-700">
                                Submitted transaction ID: <span className="font-mono">{fine.transaction_id}</span>
                              </p>
                              <p className="mt-1 text-sm text-blue-700">
                                An admin will review and approve/reject this payment.
                              </p>
                            </div>
                          </div>
                        )}

                        {fine.payment_status === 'rejected' && (
                          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                            <h4 className="mb-2 flex items-center gap-2 font-semibold text-orange-800">
                              <AlertTriangle className="h-5 w-5" />
                              Payment Rejected
                            </h4>
                            <p className="mb-3 text-sm text-orange-700">
                              Please review the admin note and submit payment details correctly.
                            </p>
                            {fine.notes && (
                              <div className="mb-3 rounded-md border border-orange-200 bg-orange-100 p-3 text-sm text-orange-800">
                                {fine.notes}
                              </div>
                            )}
                            <button
                              onClick={() => setExpandedFine(null)}
                              className="inline-flex items-center text-sm font-semibold text-orange-300 hover:text-orange-200"
                            >
                              Close and review
                              <ArrowRight className="ml-1 h-4 w-4" />
                            </button>
                          </div>
                        )}

                        {fine.payment_status === 'paid' && (
                          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
                            <CheckCircle className="h-5 w-5 flex-shrink-0" />
                            <div>
                              <p className="font-semibold">Payment Confirmed</p>
                              <p className="text-sm">Thank you for paying this fine.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
            </div>
          )}
        </section>

        {(fines.length > 0 || borrows.length > 0) && (
          <section className="overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-sky-50 to-cyan-50 p-4 text-sm text-slate-700 shadow-sm">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <p>
                <strong className="text-slate-900">How to Pay:</strong> Use bank transfer, bKash, Nagad, or counter payment and submit transaction ID.
              </p>
              <p>
                <strong className="text-slate-900">Grace Period:</strong> Fines start after the 30-day grace period from due date.
              </p>
              <p>
                <strong className="text-slate-900">Lost Books:</strong> Reporting a lost book creates a ৳500 fine and closes the borrow.
              </p>
            </div>
          </section>
        )}
      </div>
    </StudentLayout>
  );
}
