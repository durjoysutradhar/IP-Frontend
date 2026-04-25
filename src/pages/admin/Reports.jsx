import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  BookOpen,
  Users,
  BookMarked,
  AlertTriangle,
  Wallet,
  BadgeDollarSign,
  Download,
  ChevronDown,
  ChevronUp,
  Filter,
  Flame,
  Gauge,
  Search,
  ShieldAlert,
  Sparkles,
  Trophy,
  TrendingUp
} from 'lucide-react';
import api from '../../utils/api';

const formatCurrency = (value) => {
  const num = Number(value) || 0;
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const DepartmentDonutChart = ({ data }) => {
  const normalized = data
    .map((item) => ({
      name: item.department_name,
      value: Number(item.active_borrows || 0)
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  if (normalized.length === 0) {
    return <p className="text-gray-500">No data available</p>;
  }

  const top = normalized.slice(0, 5);
  const others = normalized.slice(5).reduce((sum, item) => sum + item.value, 0);
  const chartData = others > 0 ? [...top, { name: 'Others', value: others }] : top;
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const colors = ['#0ea5e9', '#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#94a3b8'];
  const size = 220;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;
  return (
    <div className="grid gap-5 md:grid-cols-[0.9fr_1.1fr] md:items-center">
      <div className="relative mx-auto h-[220px] w-[220px]">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
          {chartData.map((item, index) => {
            const portion = item.value / total;
            const dash = portion * circumference;
            const gap = circumference - dash;
            const segment = (
              <circle
                key={item.name}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={colors[index % colors.length]}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-cumulative}
                className="transition-all duration-700"
                strokeLinecap="butt"
              />
            );
            cumulative += dash;
            return segment;
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Active borrows</p>
            <p className="text-2xl font-semibold text-slate-900">{total}</p>
            <p className="text-xs text-slate-500">Top departments</p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {chartData.map((item, index) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={item.name} className="rounded-xl border border-slate-200 bg-white/80 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                  <p className="truncate text-sm font-semibold text-slate-800">{item.name}</p>
                </div>
                <p className="text-sm font-semibold text-slate-900">{item.value}</p>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(6, pct)}%`, backgroundColor: colors[index % colors.length] }}
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">{pct}% share</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const HorizontalBarChart = ({ data, labelKey, valueKey }) => {
  const maxValue = Math.max(...data.map((item) => Number(item[valueKey] || 0)), 0);
  if (data.length === 0) {
    return <p className="text-gray-500">No data available</p>;
  }

  return (
    <div className="space-y-4">
      {data.map((item) => {
        const value = Number(item[valueKey] || 0);
        const width = maxValue > 0 ? (value / maxValue) * 100 : 0;
        return (
          <div key={item[labelKey]} className="grid grid-cols-12 items-center gap-3 rounded-xl border border-slate-200/80 bg-white/75 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
            <div className="col-span-4">
              <p className="line-clamp-2 text-sm font-semibold text-slate-900">{item[labelKey]}</p>
              <p className="text-xs text-slate-500">{item.department || '—'}</p>
            </div>
            <div className="col-span-6">
              <div className="h-2.5 rounded-full bg-slate-100">
                <div
                  className="h-2.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-500"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
            <div className="col-span-2 text-right text-sm font-semibold text-slate-900">
              {value}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const LineChart = ({ data, valueKey, labelKey, strokeClass }) => {
  if (data.length < 2) {
    return <p className="text-gray-500">Not enough data to render a trend.</p>;
  }

  const width = 520;
  const height = 160;
  const padding = 24;
  const values = data.map((item) => Number(item[valueKey] || 0));
  const maxValue = Math.max(...values, 1);

  const points = data
    .map((item, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - (Number(item[valueKey] || 0) / maxValue) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full overflow-visible">
        <defs>
          <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(59,130,246,0.28)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0)" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={width} height={height} fill="transparent" />
        {[0, 1, 2, 3].map((idx) => {
          const y = padding + ((height - padding * 2) / 3) * idx;
          return <line key={idx} x1={padding} y1={y} x2={width - padding} y2={y} className="stroke-slate-200" strokeDasharray="4 4" />;
        })}
        <polyline
          fill="none"
          className={strokeClass}
          strokeWidth="3"
          points={points}
        />
        <polyline
          fill="url(#lineFill)"
          className="stroke-none"
          points={`${points} ${width - padding},${height - padding} ${padding},${height - padding}`}
        />
        {data.map((item, index) => {
          const x = padding + (index / (data.length - 1)) * (width - padding * 2);
          const y = height - padding - (Number(item[valueKey] || 0) / maxValue) * (height - padding * 2);
          return (
            <circle key={item[labelKey]} cx={x} cy={y} r="4" className={strokeClass} />
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        {data.map((item) => (
          <span key={item[labelKey]}>{item[labelKey]}</span>
        ))}
      </div>
    </div>
  );
};

const DualLineChart = ({ data }) => {
  if (data.length < 2) {
    return <p className="text-gray-500">Not enough data to render a trend.</p>;
  }

  const width = 520;
  const height = 160;
  const padding = 24;
  const maxValue = Math.max(
    ...data.map((item) => Math.max(Number(item.total_collected || 0), Number(item.total_pending || 0))),
    1
  );

  const buildPoints = (key) =>
    data
      .map((item, index) => {
        const x = padding + (index / (data.length - 1)) * (width - padding * 2);
        const y = height - padding - (Number(item[key] || 0) / maxValue) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(' ');

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full overflow-visible">
        {[0, 1, 2, 3].map((idx) => {
          const y = padding + ((height - padding * 2) / 3) * idx;
          return <line key={idx} x1={padding} y1={y} x2={width - padding} y2={y} className="stroke-slate-200" strokeDasharray="4 4" />;
        })}
        <polyline fill="none" className="stroke-emerald-500" strokeWidth="3" points={buildPoints('total_collected')} />
        <polyline fill="none" className="stroke-amber-500" strokeWidth="3" points={buildPoints('total_pending')} />
        {data.map((item, index) => {
          const x = padding + (index / (data.length - 1)) * (width - padding * 2);
          const collectedY = height - padding - (Number(item.total_collected || 0) / maxValue) * (height - padding * 2);
          const pendingY = height - padding - (Number(item.total_pending || 0) / maxValue) * (height - padding * 2);
          return (
            <g key={item.month}>
              <circle cx={x} cy={collectedY} r="4" className="fill-emerald-500" />
              <circle cx={x} cy={pendingY} r="4" className="fill-amber-500" />
            </g>
          );
        })}
      </svg>
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          Collected
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
          Pending
        </span>
      </div>
    </div>
  );
};

const Reports = () => {
  const [overview, setOverview] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [fineTrend, setFineTrend] = useState([]);
  const [borrowTrend, setBorrowTrend] = useState([]);
  const [topBorrowed, setTopBorrowed] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [resourceInsights, setResourceInsights] = useState(null);
  const [activeStudents, setActiveStudents] = useState([]);
  const [categoryMix, setCategoryMix] = useState([]);
  const [generalStatsOverview, setGeneralStatsOverview] = useState(null);
  const [overdueStats, setOverdueStats] = useState(null);
  const [borrowingTrends6m, setBorrowingTrends6m] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [appliedRange, setAppliedRange] = useState({ from: '', to: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'days_overdue', direction: 'desc' });
  const [overdueSearch, setOverdueSearch] = useState('');
  const [overdueSeverity, setOverdueSeverity] = useState('all');
  const [activeTab, setActiveTab] = useState('operations');
  const [showOverduePanel, setShowOverduePanel] = useState(false);

  useEffect(() => {
    const fetchStaticData = async () => {
      setLoading(true);
      try {
        const [overviewRes, departmentsRes, topBorrowedRes, overdueRes, resourceRes, activeStudentsRes, statisticsRes, overdueStatsRes, borrow6mRes] = await Promise.all([
          api.get('/reports/overview'),
          api.get('/reports/departments'),
          api.get('/reports/top-borrowed'),
          api.get('/reports/overdue'),
          api.get('/reports/resource-insights'),
          api.get('/reports/most-active-students?limit=6'),
          api.get('/reports/statistics'),
          api.get('/reports/overdue-statistics'),
          api.get('/reports/borrowing-trends')
        ]);

        setOverview(overviewRes.data.data);
        setDepartments(departmentsRes.data.data || []);
        setTopBorrowed(topBorrowedRes.data.data || []);
        setOverdue(overdueRes.data.data || []);
        setResourceInsights(resourceRes.data.data || null);
        setActiveStudents(activeStudentsRes.data.data || []);
        setCategoryMix(statisticsRes.data.data?.booksByCategory || []);
        setGeneralStatsOverview(statisticsRes.data.data?.overview || null);
        setOverdueStats(overdueStatsRes.data.data || null);
        setBorrowingTrends6m(borrow6mRes.data.data || []);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
      setLoading(false);
    };

    fetchStaticData();
  }, []);

  useEffect(() => {
    const fetchTrends = async () => {
      setTrendLoading(true);
      try {
        const params = {};
        if (appliedRange.from) params.from = appliedRange.from;
        if (appliedRange.to) params.to = appliedRange.to;

        const [fineRes, borrowRes] = await Promise.all([
          api.get('/reports/fine-trend', { params }),
          api.get('/reports/borrow-trend', { params })
        ]);

        setFineTrend(fineRes.data.data || []);
        setBorrowTrend(borrowRes.data.data || []);
      } catch (error) {
        console.error('Error fetching trends:', error);
      }
      setTrendLoading(false);
    };

    fetchTrends();
  }, [appliedRange]);

  const sortedOverdue = useMemo(() => {
    const normalizedSearch = overdueSearch.trim().toLowerCase();
    const data = overdue.filter((row) => {
      const days = Number(row.days_overdue || 0);

      const severityMatch =
        overdueSeverity === 'all' ||
        (overdueSeverity === 'critical' && days >= 30) ||
        (overdueSeverity === 'high' && days >= 14 && days < 30) ||
        (overdueSeverity === 'moderate' && days < 14);

      if (!severityMatch) return false;

      if (!normalizedSearch) return true;

      const haystack = [
        row.student_name,
        row.department,
        row.book_title
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });

    const { key, direction } = sortConfig;

    data.sort((a, b) => {
      const aValue = a[key] ?? '';
      const bValue = b[key] ?? '';

      if (key === 'due_date') {
        return direction === 'asc'
          ? new Date(aValue) - new Date(bValue)
          : new Date(bValue) - new Date(aValue);
      }

      if (typeof aValue === 'number' || typeof bValue === 'number') {
        return direction === 'asc' ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
      }

      return direction === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

    return data;
  }, [overdue, sortConfig, overdueSearch, overdueSeverity]);

  const analyticsHighlights = useMemo(() => {
    const pending = Number(overview?.pending_fines || 0);
    const collected = Number(overview?.total_fine_collected || 0);
    const totalFinePool = pending + collected;
    const collectionRate = totalFinePool > 0 ? Math.round((collected / totalFinePool) * 100) : 0;

    const topDepartment = departments.reduce(
      (best, item) =>
        Number(item.active_borrows || 0) > Number(best.active_borrows || 0) ? item : best,
      departments[0] || { department_name: 'N/A', active_borrows: 0 }
    );

    const peakBorrowMonth = borrowTrend.reduce(
      (best, item) =>
        Number(item.total_borrows || 0) > Number(best.total_borrows || 0) ? item : best,
      borrowTrend[0] || { month: 'N/A', total_borrows: 0 }
    );

    return {
      collectionRate,
      topDepartment,
      peakBorrowMonth
    };
  }, [overview, departments, borrowTrend]);

  const resourceSummary = useMemo(() => {
    const base = resourceInsights?.overview || {};
    const total = Number(base.total_resources || 0);
    const openAccess = Number(base.open_access_count || 0);
    const subscribed = Number(base.subscribed_count || 0);
    const repository = Number(base.repository_count || 0);

    const toPercent = (value) => (total > 0 ? Math.round((value / total) * 100) : 0);

    return {
      total,
      totalAccess: Number(base.total_access_count || 0),
      openAccess,
      subscribed,
      repository,
      openPercent: toPercent(openAccess),
      subscribedPercent: toPercent(subscribed),
      repositoryPercent: toPercent(repository)
    };
  }, [resourceInsights]);

  const opsIndices = useMemo(() => {
    const totalBooks = Number(overview?.total_books || 0);
    const activeBorrows = Number(overview?.active_borrows || 0);
    const overdueBooks = Number(overview?.overdue_books || 0);
    const pending = Number(overview?.pending_fines || 0);
    const collected = Number(overview?.total_fine_collected || 0);

    const utilization = totalBooks > 0 ? Math.round((activeBorrows / totalBooks) * 100) : 0;
    const overdueRatio = activeBorrows > 0 ? Math.round((overdueBooks / activeBorrows) * 100) : 0;
    const collectionEfficiency = pending + collected > 0 ? Math.round((collected / (pending + collected)) * 100) : 0;

    const latestBorrow = Number(borrowTrend[borrowTrend.length - 1]?.total_borrows || 0);
    const previousBorrow = Number(borrowTrend[borrowTrend.length - 2]?.total_borrows || 0);
    const borrowDelta = previousBorrow > 0 ? Math.round(((latestBorrow - previousBorrow) / previousBorrow) * 100) : 0;

    const latestCollected = Number(fineTrend[fineTrend.length - 1]?.total_collected || 0);
    const previousCollected = Number(fineTrend[fineTrend.length - 2]?.total_collected || 0);
    const collectionDelta = previousCollected > 0
      ? Math.round(((latestCollected - previousCollected) / previousCollected) * 100)
      : 0;

    return {
      utilization,
      overdueRatio,
      collectionEfficiency,
      borrowDelta,
      collectionDelta
    };
  }, [overview, borrowTrend, fineTrend]);

  const deepMetrics = useMemo(() => {
    const outstanding = Number(overdueStats?.totalOutstandingFines || 0);
    const overdueCount = Number(overdueStats?.totalOverdue || 0);
    const avgFinePerOverdue = overdueCount > 0 ? outstanding / overdueCount : 0;
    const availableBooks = Number(generalStatsOverview?.availableBooks || 0);
    const dueSoon = Number(overdueStats?.dueSoon || 0);

    const maxBorrow6m = Math.max(...borrowingTrends6m.map((item) => Number(item.borrows || 0)), 0);
    const peakBorrow6m = borrowingTrends6m.find((item) => Number(item.borrows || 0) === maxBorrow6m);

    return {
      outstanding,
      avgFinePerOverdue,
      availableBooks,
      dueSoon,
      peakBorrowMonth: peakBorrow6m?.month || 'N/A',
      peakBorrowCount: maxBorrow6m
    };
  }, [overdueStats, generalStatsOverview, borrowingTrends6m]);

  const resourcePerformance = useMemo(() => {
    const totalResources = Number(resourceSummary.total || 0);
    const totalAccess = Number(resourceSummary.totalAccess || 0);
    const accessPerResource = totalResources > 0 ? (totalAccess / totalResources).toFixed(1) : '0.0';
    const openDominance = resourceSummary.openPercent;

    return {
      accessPerResource,
      openDominance,
      recentUploads: Number(resourceInsights?.recent?.length || 0)
    };
  }, [resourceSummary, resourceInsights]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleApplyFilter = () => {
    setAppliedRange({ from: fromDate, to: toDate });
  };

  const handleExport = async (type) => {
    try {
      const params = {};
      if (appliedRange.from) params.from = appliedRange.from;
      if (appliedRange.to) params.to = appliedRange.to;

      const endpoint = type === 'overdue' ? '/reports/export/overdue' : '/reports/export/fines';
      const response = await api.get(endpoint, { params, responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = type === 'overdue' ? 'overdue_report.csv' : 'fine_report.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="deck-shell p-4 sm:p-6 lg:p-8">
        <div className="pointer-events-none absolute -top-24 right-10 h-60 w-60 rounded-full bg-cyan-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-8 h-56 w-56 rounded-full bg-indigo-300/20 blur-3xl" />

        <div className="relative space-y-6">
          <section className="deck-hero dashboard-reveal overflow-hidden rounded-3xl p-6 sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.2),transparent_35%),radial-gradient(circle_at_88%_18%,rgba(99,102,241,0.25),transparent_32%)]" />
            <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  Premium Analytics Suite
                </p>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl" style={{ fontFamily: 'Fraunces, serif' }}>
                  Reports & Analytics
                </h1>
                <p className="mt-3 max-w-xl text-sm text-slate-200 sm:text-base">
                  Elegant visibility into borrow behavior, overdue pressure, and fine performance across your institution.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur">
                    <p className="text-xs uppercase tracking-wider text-slate-300">Top Department</p>
                    <p className="mt-1 text-lg font-semibold text-white">{analyticsHighlights.topDepartment.department_name || 'N/A'}</p>
                    <p className="text-xs text-slate-300">{Number(analyticsHighlights.topDepartment.active_borrows || 0)} active borrows</p>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur">
                    <p className="text-xs uppercase tracking-wider text-slate-300">Peak Borrow Month</p>
                    <p className="mt-1 text-lg font-semibold text-white">{analyticsHighlights.peakBorrowMonth.month || 'N/A'}</p>
                    <p className="text-xs text-slate-300">{Number(analyticsHighlights.peakBorrowMonth.total_borrows || 0)} borrows</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-400/40 bg-slate-900/45 p-5 backdrop-blur">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-200">Fine Collection Health</h2>
                  <TrendingUp className="h-4.5 w-4.5 text-emerald-300" />
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm text-slate-200">
                      <span>Collection Rate</span>
                      <span className="font-semibold">{analyticsHighlights.collectionRate}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-700/70">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 transition-all duration-700"
                        style={{ width: `${Math.min(analyticsHighlights.collectionRate, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-500/50 bg-slate-950/35 p-3">
                    <p className="text-xs uppercase tracking-wider text-slate-300">Applied Window</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {appliedRange.from || appliedRange.to
                        ? `${appliedRange.from || 'Start'} - ${appliedRange.to || 'Today'}`
                        : 'All time data'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-500/50 bg-slate-950/35 p-3 text-sm text-slate-200">
                    <p className="text-xs uppercase tracking-wider text-slate-300">Collection vs Pending</p>
                    <p className="mt-1">
                      {formatCurrency(overview?.total_fine_collected)} collected / {formatCurrency(overview?.pending_fines)} pending
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="deck-panel dashboard-reveal dashboard-delay-1 rounded-2xl p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto]">
              <div>
                <label className="text-sm font-medium text-slate-600">From Date</label>
                <div className="relative mt-2">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 transition-all duration-300 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">To Date</label>
                <div className="relative mt-2">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 transition-all duration-300 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleApplyFilter}
                  className="inline-flex items-center rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-lg"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Apply Filters
                </button>
              </div>
            </div>
          </section>

          {loading || !overview ? (
            <LoadingSpinner size="lg" className="py-16" />
          ) : (
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[
                { label: 'Total Books', value: overview.total_books, Icon: BookOpen, iconClass: 'text-cyan-600', chip: 'bg-cyan-50 border-cyan-200' },
                { label: 'Total Students', value: overview.total_students, Icon: Users, iconClass: 'text-indigo-600', chip: 'bg-indigo-50 border-indigo-200' },
                { label: 'Active Borrows', value: overview.active_borrows, Icon: BookMarked, iconClass: 'text-emerald-600', chip: 'bg-emerald-50 border-emerald-200' },
                { label: 'Overdue Books', value: overview.overdue_books, Icon: AlertTriangle, iconClass: 'text-amber-600', chip: 'bg-amber-50 border-amber-200' }
              ].map((item, idx) => (
                <article
                  key={item.label}
                  className={`deck-panel deck-hover dashboard-reveal rounded-2xl p-5 dashboard-delay-${Math.min(idx + 1, 5)}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
                    </div>
                    <div className={`rounded-xl border p-2.5 transition duration-300 group-hover:scale-105 ${item.chip}`}>
                      <item.Icon className={`h-5 w-5 ${item.iconClass}`} />
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}

          {!loading && overview && (
            <section className="deck-panel dashboard-reveal dashboard-delay-2 rounded-2xl p-4">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: 'operations', label: 'Operations' },
                  { key: 'resources', label: 'Resources' },
                  { key: 'people', label: 'People & Catalog' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition-all duration-300 ${
                      activeTab === tab.key
                        ? 'border-primary-200 bg-primary-50 text-primary-700'
                        : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'resources' && (
          <section className="dashboard-reveal dashboard-delay-2 grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <article className="overflow-hidden rounded-2xl border border-slate-800/20 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-5 text-white shadow-[0_24px_56px_-32px_rgba(2,6,23,0.75)]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight" style={{ fontFamily: 'Fraunces, serif' }}>
                  Resource Intelligence Hub
                </h2>
                <span className="rounded-full border border-emerald-300/35 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100">
                  New module
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-[0.46fr_0.54fr]">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-300">Access Mix</p>
                  <div className="mt-3 flex items-center gap-4">
                    <div
                      className="h-28 w-28 rounded-full border border-white/20"
                      style={{
                        background: `conic-gradient(#34d399 0 ${resourceSummary.openPercent}%, #60a5fa ${resourceSummary.openPercent}% ${resourceSummary.openPercent + resourceSummary.subscribedPercent}%, #f59e0b ${resourceSummary.openPercent + resourceSummary.subscribedPercent}% 100%)`
                      }}
                    >
                      <div className="m-3 flex h-[88px] w-[88px] items-center justify-center rounded-full bg-slate-900/90 text-center">
                        <div>
                          <p className="text-[11px] text-slate-300">Total</p>
                          <p className="text-lg font-semibold text-white">{resourceSummary.total}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <p className="flex items-center gap-2 text-slate-200">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        Open Access: {resourceSummary.openAccess}
                      </p>
                      <p className="flex items-center gap-2 text-slate-200">
                        <span className="h-2 w-2 rounded-full bg-sky-400" />
                        Subscribed: {resourceSummary.subscribed}
                      </p>
                      <p className="flex items-center gap-2 text-slate-200">
                        <span className="h-2 w-2 rounded-full bg-amber-400" />
                        Repository: {resourceSummary.repository}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-300">Top Resource Types</p>
                  <div className="mt-3 space-y-2.5">
                    {(resourceInsights?.byType || []).slice(0, 5).map((row) => {
                      const maxTypeCount = Math.max(...(resourceInsights?.byType || []).map((item) => Number(item.total_items || 0)), 1);
                      const width = Math.max(8, Math.round((Number(row.total_items || 0) / maxTypeCount) * 100));

                      return (
                        <div key={row.resource_type} className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-slate-200">
                            <span className="capitalize">{String(row.resource_type || '').replace(/_/g, ' ')}</span>
                            <span className="font-semibold">{row.total_items}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-700/70">
                            <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400" style={{ width: `${width}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    {(resourceInsights?.byType || []).length === 0 && <p className="text-xs text-slate-300">No resource type data yet.</p>}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(resourceInsights?.byDepartment || []).map((row) => (
                  <span key={row.department} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-slate-200">
                    {row.department}: {row.total_items}
                  </span>
                ))}
              </div>
            </article>

            <article className="deck-panel rounded-2xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Recent Resource Uploads</h3>
                <p className="text-xs text-slate-500">Total access: {resourceSummary.totalAccess}</p>
              </div>

              <div className="space-y-3">
                {(resourceInsights?.recent || []).map((item) => (
                  <div key={item.id} className="group rounded-xl border border-slate-200 bg-white p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {String(item.resource_type || '').replace(/_/g, ' ')} • {String(item.access_type || '').replace(/_/g, ' ')}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                        {item.access_count} views
                      </span>
                    </div>
                  </div>
                ))}
                {(resourceInsights?.recent || []).length === 0 && (
                  <p className="rounded-xl border border-slate-200 bg-slate-50 py-6 text-center text-sm text-slate-500">
                    No recent resources available.
                  </p>
                )}
              </div>
            </article>
          </section>
          )}

          {activeTab === 'resources' && (
            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <article className="deck-panel rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Access per resource</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{resourcePerformance.accessPerResource}</p>
                <p className="text-xs text-slate-500">Average interactions per item</p>
              </article>
              <article className="deck-panel rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Open access share</p>
                <p className="mt-1 text-2xl font-semibold text-emerald-600">{resourcePerformance.openDominance}%</p>
                <p className="text-xs text-slate-500">Of total published resources</p>
              </article>
              <article className="deck-panel rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Recent uploads</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{resourcePerformance.recentUploads}</p>
                <p className="text-xs text-slate-500">Latest items in spotlight</p>
              </article>
            </section>
          )}

          {activeTab === 'people' && (
          <section className="dashboard-reveal dashboard-delay-3 grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <article className="deck-panel rounded-2xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Most Active Students</h3>
                <Trophy className="h-4.5 w-4.5 text-amber-500" />
              </div>

              <div className="space-y-3">
                {activeStudents.slice(0, 6).map((student, idx) => (
                  <div
                    key={student.id}
                    className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        #{idx + 1} {student.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">{student.department || 'No department'} • {student.email}</p>
                    </div>
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                      {student.borrow_count || 0} borrows
                    </span>
                  </div>
                ))}
                {activeStudents.length === 0 && (
                  <p className="rounded-xl border border-slate-200 bg-slate-50 py-6 text-center text-sm text-slate-500">
                    No active student borrowing data yet.
                  </p>
                )}
              </div>
            </article>

            <article className="deck-panel rounded-2xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Category Concentration</h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Collection depth</span>
              </div>

              <div className="space-y-3">
                {categoryMix.slice(0, 6).map((category) => {
                  const maxCategoryBooks = Math.max(...categoryMix.map((c) => Number(c.dataValues?.book_count || c.book_count || 0)), 1);
                  const current = Number(category.dataValues?.book_count || category.book_count || 0);
                  const width = Math.max(8, Math.round((current / maxCategoryBooks) * 100));

                  return (
                    <div key={category.id} className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-800">{category.name}</span>
                        <span className="font-semibold text-slate-900">{current}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100">
                        <div className="h-2.5 rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-sky-500 transition-all duration-700" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
                {categoryMix.length === 0 && (
                  <p className="rounded-xl border border-slate-200 bg-slate-50 py-6 text-center text-sm text-slate-500">
                    No category concentration data available.
                  </p>
                )}
              </div>
            </article>
          </section>
          )}

          {activeTab === 'people' && (
            <section className="deck-panel rounded-2xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Department Performance Matrix</h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Borrow vs Overdue vs Recovery</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Department</th>
                      <th className="px-4 py-3 font-semibold">Active Borrows</th>
                      <th className="px-4 py-3 font-semibold">Overdue</th>
                      <th className="px-4 py-3 font-semibold">Fine Collected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.slice(0, 8).map((dept) => (
                      <tr key={dept.category_id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-medium text-slate-900">{dept.department_name}</td>
                        <td className="px-4 py-3 text-slate-700">{Number(dept.active_borrows || 0)}</td>
                        <td className="px-4 py-3 font-semibold text-amber-600">{Number(dept.overdue_count || 0)}</td>
                        <td className="px-4 py-3 font-semibold text-emerald-600">{formatCurrency(dept.total_fines_collected || 0)}</td>
                      </tr>
                    ))}
                    {departments.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-slate-500">No department analytics available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'operations' && (
          <>
          <section className="dashboard-reveal dashboard-delay-2 grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <article className="deck-panel rounded-2xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Executive Health Index</h2>
                <Gauge className="h-4.5 w-4.5 text-indigo-600" />
              </div>

              <div className="space-y-4">
                {[
                  {
                    label: 'Catalog Utilization',
                    value: opsIndices.utilization,
                    helper: `${overview?.active_borrows || 0} active / ${overview?.total_books || 0} books`,
                    bar: 'from-cyan-500 to-blue-500'
                  },
                  {
                    label: 'Overdue Risk Ratio',
                    value: opsIndices.overdueRatio,
                    helper: `${overview?.overdue_books || 0} overdue out of ${overview?.active_borrows || 0} active loans`,
                    bar: 'from-amber-500 to-rose-500'
                  },
                  {
                    label: 'Collection Efficiency',
                    value: opsIndices.collectionEfficiency,
                    helper: `${formatCurrency(overview?.total_fine_collected)} captured`,
                    bar: 'from-emerald-500 to-teal-500'
                  }
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-800">{item.label}</span>
                      <span className="font-semibold text-slate-900">{item.value}%</span>
                    </div>
                    <p className="mb-2 text-xs text-slate-500">{item.helper}</p>
                    <div className="h-2.5 rounded-full bg-slate-100">
                      <div className={`h-2.5 rounded-full bg-gradient-to-r transition-all duration-700 ${item.bar}`} style={{ width: `${Math.min(100, Math.max(4, item.value))}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="deck-panel rounded-2xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Trend Pulse</h2>
                <Flame className="h-4.5 w-4.5 text-orange-500" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Borrow Momentum</p>
                  <p className={`mt-1 text-2xl font-semibold ${opsIndices.borrowDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {opsIndices.borrowDelta >= 0 ? '+' : ''}{opsIndices.borrowDelta}%
                  </p>
                  <p className="text-xs text-slate-500">vs previous month</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Collection Momentum</p>
                  <p className={`mt-1 text-2xl font-semibold ${opsIndices.collectionDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {opsIndices.collectionDelta >= 0 ? '+' : ''}{opsIndices.collectionDelta}%
                  </p>
                  <p className="text-xs text-slate-500">vs previous month</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                <p className="mb-2 text-xs uppercase tracking-[0.12em] text-slate-500">Borrow Pulse Timeline</p>
                <div className="flex flex-wrap gap-2">
                  {borrowTrend.slice(-6).map((row) => (
                    <span key={row.month} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                      {row.month}: {row.total_borrows}
                    </span>
                  ))}
                  {borrowTrend.length === 0 && <span className="text-xs text-slate-500">No trend data.</span>}
                </div>
              </div>
            </article>
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <article className="deck-panel dashboard-reveal dashboard-delay-3 rounded-2xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Department-wise Borrow Distribution</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Donut view</span>
              </div>
              <DepartmentDonutChart data={departments} />
            </article>

            <article className="deck-panel dashboard-reveal dashboard-delay-3 rounded-2xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Top Borrowed Books</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Top movers</span>
              </div>
              <HorizontalBarChart data={topBorrowed} labelKey="book_title" valueKey="total_borrows" />
            </article>
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <article className="deck-panel dashboard-reveal dashboard-delay-4 rounded-2xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Monthly Fine Collection</h2>
                <ArrowUpRight className="h-4.5 w-4.5 text-emerald-600" />
              </div>
              {trendLoading ? <LoadingSpinner size="md" className="py-8" /> : <DualLineChart data={fineTrend} />}
            </article>

            <article className="deck-panel dashboard-reveal dashboard-delay-4 rounded-2xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Monthly Borrow Trend</h2>
                <Activity className="h-4.5 w-4.5 text-blue-600" />
              </div>
              {trendLoading ? (
                <LoadingSpinner size="md" className="py-8" />
              ) : (
                <LineChart data={borrowTrend} valueKey="total_borrows" labelKey="month" strokeClass="stroke-blue-500 fill-blue-500" />
              )}
            </article>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="deck-panel rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Due soon</p>
              <p className="mt-1 text-2xl font-semibold text-amber-600">{deepMetrics.dueSoon}</p>
              <p className="text-xs text-slate-500">Loans approaching due date (3 days)</p>
            </article>
            <article className="deck-panel rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Outstanding fines</p>
              <p className="mt-1 text-2xl font-semibold text-rose-600">{formatCurrency(deepMetrics.outstanding)}</p>
              <p className="text-xs text-slate-500">Current overdue fine exposure</p>
            </article>
            <article className="deck-panel rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Avg fine per overdue</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{formatCurrency(deepMetrics.avgFinePerOverdue)}</p>
              <p className="text-xs text-slate-500">Average burden per overdue item</p>
            </article>
            <article className="deck-panel rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Peak borrow (6M)</p>
              <p className="mt-1 text-2xl font-semibold text-indigo-600">{deepMetrics.peakBorrowCount}</p>
              <p className="text-xs text-slate-500">{deepMetrics.peakBorrowMonth}</p>
            </article>
          </section>
          </>
          )}

          <section className="deck-panel dashboard-reveal dashboard-delay-5 rounded-2xl p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Overdue Monitoring</h2>
                <p className="text-sm text-slate-500">Sortable list of overdue borrowers with export-ready data.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowOverduePanel((prev) => !prev)}
                  className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-slate-400 hover:shadow-md"
                >
                  {showOverduePanel ? 'Hide Details' : 'Show Details'}
                  {showOverduePanel ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                </button>
                <button
                  onClick={() => handleExport('overdue')}
                  className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Overdue
                </button>
                <button
                  onClick={() => handleExport('fines')}
                  className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Fine Report
                </button>
              </div>
            </div>

            {!showOverduePanel && (
              <p className="rounded-xl border border-slate-200 bg-slate-50 py-6 text-center text-sm text-slate-500">
                Detailed overdue table is collapsed to keep this page focused.
              </p>
            )}

            {showOverduePanel && (
              <>

            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={overdueSearch}
                  onChange={(e) => setOverdueSearch(e.target.value)}
                  placeholder="Search by student, department, or book"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 transition-all duration-300 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'critical', label: 'Critical 30+' },
                  { key: 'high', label: 'High 14-29' },
                  { key: 'moderate', label: 'Moderate <14' }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setOverdueSeverity(item.key)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-300 ${
                      overdueSeverity === item.key
                        ? 'border-rose-200 bg-rose-50 text-rose-700'
                        : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              <ShieldAlert className="h-3.5 w-3.5" />
              Showing {sortedOverdue.length} overdue records
            </div>

            {loading ? (
              <LoadingSpinner size="md" className="py-10" />
            ) : overdue.length === 0 ? (
              <p className="rounded-xl border border-slate-200 bg-slate-50 py-8 text-center text-slate-500">No overdue records found.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="cursor-pointer px-4 py-3 font-semibold" onClick={() => handleSort('student_name')}>Student</th>
                      <th className="cursor-pointer px-4 py-3 font-semibold" onClick={() => handleSort('department')}>Department</th>
                      <th className="cursor-pointer px-4 py-3 font-semibold" onClick={() => handleSort('book_title')}>Book</th>
                      <th className="cursor-pointer px-4 py-3 font-semibold" onClick={() => handleSort('due_date')}>Due Date</th>
                      <th className="cursor-pointer px-4 py-3 font-semibold" onClick={() => handleSort('days_overdue')}>Days Overdue</th>
                      <th className="cursor-pointer px-4 py-3 font-semibold" onClick={() => handleSort('fine_amount')}>Fine</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedOverdue.map((row, index) => (
                      <tr key={`${row.book_title}-${index}`} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-medium text-slate-900">{row.student_name}</td>
                        <td className="px-4 py-3 text-slate-600">{row.department || '—'}</td>
                        <td className="px-4 py-3 text-slate-700">{row.book_title}</td>
                        <td className="px-4 py-3 text-slate-600">{new Date(row.due_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 font-semibold text-amber-600">{row.days_overdue}</td>
                        <td className="px-4 py-3 font-semibold text-rose-600">{formatCurrency(row.fine_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
              </>
            )}
          </section>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reports;
