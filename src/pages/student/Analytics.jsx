import { useState, useEffect, useMemo } from 'react';
import StudentLayout from '../../components/StudentLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  BarChart3,
  TrendingUp,
  CheckCircle,
  XCircle,
  Award,
  Activity,
  BookX,
  Flame,
  Gauge,
  Sparkles,
  CalendarClock,
  Target
} from 'lucide-react';
import api from '../../utils/api';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalBorrowed: 0,
    onTimeRate: 0,
    lateReturns: 0,
    lostBooks: 0,
    badge: '',
    borrowTrend: []
  });
  const [animateIn, setAnimateIn] = useState(false);
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState(null);
  const [hoveredHeatIndex, setHoveredHeatIndex] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (loading) {
      setAnimateIn(false);
      return;
    }

    const timer = setTimeout(() => setAnimateIn(true), 100);
    return () => clearTimeout(timer);
  }, [loading]);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/analytics/student');
      setAnalytics(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const getBadgeColor = (badge) => {
    if (badge === 'Excellent Return Record') return 'bg-green-100 text-green-800 border-green-300';
    if (badge === 'Good Return Record') return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

  const getBadgeIcon = (badge) => {
    if (badge === 'Excellent Return Record') return <Award className="w-6 h-6" />;
    if (badge === 'Good Return Record') return <CheckCircle className="w-6 h-6" />;
    return <TrendingUp className="w-6 h-6" />;
  };

  // Format month for display
  const formatMonth = (monthStr) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Find max value for chart scaling
  const maxTrend = analytics.borrowTrend.length > 0 
    ? Math.max(...analytics.borrowTrend.map(t => t.total))
    : 1;

  const performanceScore = Math.max(0, 100 - analytics.lateReturns * 3);
  const avgMonthlyBorrows = analytics.borrowTrend.length
    ? (analytics.borrowTrend.reduce((sum, item) => sum + item.total, 0) / analytics.borrowTrend.length)
    : 0;

  const longestPositiveRun = useMemo(() => {
    let run = 0;
    let maxRun = 0;
    analytics.borrowTrend.forEach((item) => {
      if (item.total > 0) {
        run += 1;
        maxRun = Math.max(maxRun, run);
      } else {
        run = 0;
      }
    });
    return maxRun;
  }, [analytics.borrowTrend]);

  const trendPoints = useMemo(() => {
    if (!analytics.borrowTrend.length) return '';
    const width = 520;
    const height = 220;
    const step = analytics.borrowTrend.length > 1 ? width / (analytics.borrowTrend.length - 1) : width;

    return analytics.borrowTrend
      .map((item, index) => {
        const x = index * step;
        const y = height - (item.total / Math.max(maxTrend, 1)) * height;
        return `${x},${Math.max(10, y)}`;
      })
      .join(' ');
  }, [analytics.borrowTrend, maxTrend]);

  const peakMonth = analytics.borrowTrend.length
    ? analytics.borrowTrend.reduce((best, current) => (current.total > best.total ? current : best), analytics.borrowTrend[0])
    : null;

  const hoveredTrendItem = hoveredTrendIndex !== null ? analytics.borrowTrend[hoveredTrendIndex] : null;

  if (loading) {
    return (
      <StudentLayout>
        <LoadingSpinner size="lg" className="min-h-[60vh]" />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="relative space-y-6 overflow-hidden rounded-[2rem] border border-slate-200/70 bg-gradient-to-br from-[#fdf4ff] via-[#eef2ff] to-[#ecfeff] p-4 sm:space-y-8 sm:p-6 lg:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(236,72,153,0.2),transparent_30%),radial-gradient(circle_at_90%_8%,rgba(79,70,229,0.18),transparent_32%),radial-gradient(circle_at_80%_82%,rgba(14,165,233,0.2),transparent_36%)]" />

        <div className="relative z-10 space-y-6 sm:space-y-8">
          <section
            className={`overflow-hidden rounded-3xl border border-slate-300/60 bg-slate-950 p-6 text-white shadow-2xl transition-all duration-700 sm:p-8 ${
              animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                  <Activity className="h-3.5 w-3.5" />
                  Analytics Studio
                </div>
                <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Student Analytics</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
                  Deep view into your borrowing behavior with trend signals, reliability metrics, and monthly movement.
                </p>

                <div className="mt-5 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-sky-300/30 bg-sky-500/10 px-3 py-1 font-semibold text-sky-200">
                    Avg/Month: {avgMonthlyBorrows.toFixed(1)}
                  </span>
                  <span className="rounded-full border border-emerald-300/30 bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-200">
                    On-Time: {analytics.onTimeRate}%
                  </span>
                  <span className="rounded-full border border-amber-300/30 bg-amber-500/10 px-3 py-1 font-semibold text-amber-200">
                    Consistency Run: {longestPositiveRun} mo
                  </span>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Performance Score</p>
                  <div className="mt-3 flex items-center gap-4">
                    <div
                      className="relative h-20 w-20 rounded-full p-1"
                      style={{ background: `conic-gradient(#22d3ee ${performanceScore}%, rgba(51,65,85,0.8) 0)` }}
                    >
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950 text-xl font-black text-cyan-200">
                        {performanceScore}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-300">Current Badge</p>
                      <p className="font-bold text-white">{analytics.badge}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Total Borrowed', value: analytics.totalBorrowed, hint: 'All-time books', Icon: BarChart3, tone: 'from-sky-500/20 to-cyan-500/20' },
              { label: 'On-Time Rate', value: `${analytics.onTimeRate}%`, hint: 'Return reliability', Icon: CheckCircle, tone: 'from-emerald-500/20 to-green-500/20' },
              { label: 'Late Returns', value: analytics.lateReturns, hint: 'Delays recorded', Icon: XCircle, tone: 'from-rose-500/20 to-orange-500/20' },
              { label: 'Lost Book', value: analytics.lostBooks, hint: 'Reported as lost', Icon: BookX, tone: 'from-indigo-500/20 to-fuchsia-500/20' }
            ].map((item, idx) => (
              <div
                key={item.label}
                className={`group rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg ${
                  animateIn ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${100 + idx * 80}ms` }}
              >
                <div className={`mb-3 rounded-xl bg-gradient-to-r ${item.tone} p-2`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-600">{item.label}</p>
                    <item.Icon className="h-5 w-5 text-slate-700" />
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-900">{item.value}</p>
                <p className="mt-1 text-xs text-slate-500">{item.hint}</p>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
            <div className="xl:col-span-3 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-lg backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Borrow Pulse Line</h3>
                <span className="text-xs font-semibold text-slate-500">Last 6 months</span>
              </div>

              {analytics.borrowTrend.length === 0 ? (
                <div className="py-16 text-center text-slate-500">
                  <BarChart3 className="mx-auto mb-3 h-10 w-10 opacity-40" />
                  <p>No borrowing data available for trend visualization</p>
                </div>
              ) : (
                <>
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-sky-50 to-white p-4">
                    {hoveredTrendItem && (
                      <div
                        className="pointer-events-none absolute z-20 rounded-lg border border-sky-200 bg-white/95 px-3 py-2 text-xs text-slate-700 shadow-md backdrop-blur-sm transition-all duration-200"
                        style={{
                          left: `${(hoveredTrendIndex / Math.max(analytics.borrowTrend.length - 1, 1)) * 100}%`,
                          top: '8px',
                          transform: 'translateX(-50%)'
                        }}
                      >
                        <p className="font-semibold text-slate-900">{formatMonth(hoveredTrendItem.month)}</p>
                        <p>Borrowed: {hoveredTrendItem.total}</p>
                      </div>
                    )}
                    <svg viewBox="0 0 520 240" className="h-64 w-full">
                      {[0, 1, 2, 3, 4].map((line) => (
                        <line
                          key={line}
                          x1="0"
                          x2="520"
                          y1={20 + line * 50}
                          y2={20 + line * 50}
                          stroke="rgba(148,163,184,0.35)"
                          strokeDasharray="4 4"
                        />
                      ))}
                      <polyline
                        fill={hoveredTrendIndex !== null ? 'rgba(14,165,233,0.24)' : 'rgba(14,165,233,0.15)'}
                        stroke="none"
                        points={`0,240 ${trendPoints} 520,240`}
                        style={{ transition: 'fill 220ms ease' }}
                      />
                      <polyline
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth={hoveredTrendIndex !== null ? '5' : '4'}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={trendPoints}
                        style={{
                          strokeDasharray: animateIn ? 'none' : '1200',
                          strokeDashoffset: animateIn ? '0' : '1200',
                          transition: 'stroke-dashoffset 1.2s ease, stroke-width 220ms ease'
                        }}
                      />
                      {analytics.borrowTrend.map((item, index) => {
                        const width = 520;
                        const height = 220;
                        const step = analytics.borrowTrend.length > 1 ? width / (analytics.borrowTrend.length - 1) : width;
                        const x = index * step;
                        const y = Math.max(10, height - (item.total / Math.max(maxTrend, 1)) * height);

                        return (
                          <g key={index}>
                            {hoveredTrendIndex === index && (
                              <circle cx={x} cy={y} r="11" fill="rgba(14,165,233,0.18)" />
                            )}
                            <circle
                              cx={x}
                              cy={y}
                              r={hoveredTrendIndex === index ? '7' : '5'}
                              fill="#0ea5e9"
                              style={{ transition: 'r 180ms ease' }}
                            />
                            <text x={x} y={y - 10} textAnchor="middle" fontSize="11" fill="#0f172a" fontWeight="700">
                              {item.total}
                            </text>
                            <circle
                              cx={x}
                              cy={y}
                              r="14"
                              fill="transparent"
                              onMouseEnter={() => setHoveredTrendIndex(index)}
                              onMouseLeave={() => setHoveredTrendIndex(null)}
                              style={{ cursor: 'pointer' }}
                            />
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
                    {analytics.borrowTrend.map((item, i) => (
                      <div
                        key={i}
                        className={`cursor-pointer rounded-lg border px-2 py-1 text-center text-xs transition-all duration-200 ${
                          hoveredTrendIndex === i
                            ? 'border-sky-300 bg-sky-50 text-sky-800 shadow-sm'
                            : 'border-slate-200 bg-slate-50 text-slate-600'
                        }`}
                        onMouseEnter={() => setHoveredTrendIndex(i)}
                        onMouseLeave={() => setHoveredTrendIndex(null)}
                      >
                        <p className="font-semibold">{formatMonth(item.month)}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="xl:col-span-2 space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-lg backdrop-blur-sm">
                <p className="text-sm font-semibold text-slate-700">Achievement Band</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className={`rounded-full p-3 ${getBadgeColor(analytics.badge).split(' ')[0]}`}>
                    {getBadgeIcon(analytics.badge)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{analytics.badge}</p>
                    <p className="text-xs text-slate-500">Based on on-time return performance</p>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-700" style={{ width: `${analytics.onTimeRate}%` }} />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-lg backdrop-blur-sm">
                <p className="text-sm font-semibold text-slate-700">Insight Signals</p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2 text-white">
                    <span className="inline-flex items-center"><Gauge className="mr-2 h-4 w-4" />Consistency Run</span>
                    <span className="font-bold">{longestPositiveRun} mo</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-amber-900">
                    <span className="inline-flex items-center"><Flame className="mr-2 h-4 w-4" />Peak Month</span>
                    <span className="font-bold">{peakMonth ? formatMonth(peakMonth.month) : '-'}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-cyan-50 px-3 py-2 text-cyan-900">
                    <span className="inline-flex items-center"><Target className="mr-2 h-4 w-4" />Avg Borrow Pace</span>
                    <span className="font-bold">{avgMonthlyBorrows.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-lg backdrop-blur-sm">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Monthly Borrow Heat Bars</h3>

            {analytics.borrowTrend.length === 0 ? (
              <div className="py-10 text-center text-slate-500">
                <p>No heat-bar data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.borrowTrend.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 items-center gap-3"
                    onMouseEnter={() => setHoveredHeatIndex(index)}
                    onMouseLeave={() => setHoveredHeatIndex(null)}
                  >
                    <p className={`col-span-4 text-sm font-semibold transition-colors duration-200 sm:col-span-3 md:col-span-2 ${
                      hoveredHeatIndex === index ? 'text-sky-700' : 'text-slate-700'
                    }`}>{formatMonth(item.month)}</p>
                    <div className="col-span-8 sm:col-span-9 md:col-span-10">
                      <div className="relative h-8 overflow-hidden rounded-xl bg-slate-200">
                        <div
                          className={`h-full rounded-xl bg-gradient-to-r transition-all duration-500 ${
                            hoveredHeatIndex === index
                              ? 'from-fuchsia-500 via-sky-500 to-cyan-400 shadow-[0_0_14px_rgba(14,165,233,0.45)]'
                              : 'from-indigo-500 via-sky-500 to-cyan-400'
                          }`}
                          style={{
                            width: animateIn ? `${Math.max(8, (item.total / Math.max(maxTrend, 1)) * 100)}%` : '0%',
                            transform: hoveredHeatIndex === index ? 'scaleY(1.06)' : 'scaleY(1)'
                          }}
                        />
                        <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold transition-colors duration-200 ${
                          hoveredHeatIndex === index ? 'text-sky-900' : 'text-slate-800'
                        }`}>{item.total}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-sky-50 to-cyan-50 p-5 shadow-sm">
            <div className="flex items-start space-x-3">
              <TrendingUp className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-700" />
              <div>
                <p className="text-sm font-semibold text-indigo-900">Analytics Coach Note</p>
                <p className="mt-1 text-sm text-indigo-800">
                  A high on-time score plus stable monthly trend builds a strong academic reading profile. Keep your borrowing rhythm consistent to improve your badge tier.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </StudentLayout>
  );
};

export default Analytics;
