import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Database,
  ExternalLink,
  FlaskConical,
  GraduationCap,
  Library,
  LifeBuoy,
  Newspaper,
  Search,
  ShieldCheck,
  Users,
  X
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const navigationItems = [
  { label: 'Home', href: '/landing#home' },
  { label: 'Services', href: '/landing#services' },
  { label: 'Resources', href: '/landing#resources' },
  { label: 'Notices', href: '/landing#notices' },
  { label: 'About', href: '/about' },
  { label: 'Login', href: '/login' }
];

const serviceCards = [
  {
    title: 'Book Borrowing Service',
    description: 'Borrow physical books, monitor due dates, and manage returns through one clean workflow.',
    icon: BookOpen,
    tone: 'from-sky-100 to-cyan-50',
    details:
      'Use streamlined circulation support to borrow books, track due dates, request returns, and avoid overdue penalties through clear reminders.',
    highlights: ['Issue and return tracking', 'Renewal support', 'Due-date visibility']
  },
  {
    title: 'Digital Resource Access',
    description: 'Explore eBooks, journals, research papers, and repository materials in one place.',
    icon: Database,
    tone: 'from-emerald-100 to-teal-50',
    details:
      'Search and access digital materials including eBooks, journals, and research collections with open and restricted access indicators.',
    highlights: ['Grouped discovery', 'Open vs restricted visibility', 'Fast landing-page search']
  },
  {
    title: 'Research Support',
    description: 'Discover curated academic references designed for university-level research and projects.',
    icon: FlaskConical,
    tone: 'from-amber-100 to-orange-50',
    details:
      'Receive guidance for academic research through curated references, topic-based discovery, and support for thesis and publication work.',
    highlights: ['Topic-focused resources', 'Research-ready materials', 'Academic reference support']
  },
  {
    title: 'Academic Materials',
    description: 'Access lecture notes, thesis collections, and faculty content organized by resource type.',
    icon: ShieldCheck,
    tone: 'from-indigo-100 to-violet-50',
    details:
      'Browse learning resources including lecture notes, thesis archives, and faculty publications organized for faster course support.',
    highlights: ['Lecture resources', 'Repository archives', 'Faculty publications']
  },
  {
    title: 'Reading Room Facility',
    description: 'Use quiet study-friendly reading spaces designed for focused academic work and exam preparation.',
    icon: BookOpen,
    tone: 'from-rose-100 to-pink-50',
    details:
      'Students can use designated reading zones for silent study, focused revision, and reference consultation in a supportive environment.',
    highlights: ['Quiet study zones', 'Extended study comfort', 'Academic concentration']
  },
  {
    title: 'Reference Service',
    description: 'Get guided support for locating textbooks, journals, references, and citation-ready sources.',
    icon: Search,
    tone: 'from-lime-100 to-green-50',
    details:
      'Reference librarians help users discover reliable sources quickly and efficiently for assignments, reports, and research activities.',
    highlights: ['Source discovery help', 'Citation assistance', 'Research guidance']
  },
  {
    title: 'Book Circulation Service',
    description: 'Manage issue, renewal, return requests, and circulation history with clear tracking.',
    icon: Database,
    tone: 'from-cyan-100 to-blue-50',
    details:
      'Circulation services handle book movement workflows so students can borrow, renew, and return materials with transparent records.',
    highlights: ['Issue and return control', 'Renewal workflow', 'History visibility']
  },
  {
    title: 'Research Consultation',
    description: 'Receive personalized consultation for topic scoping, literature review, and research planning.',
    icon: FlaskConical,
    tone: 'from-yellow-100 to-amber-50',
    details:
      'Consultation sessions help students and researchers refine topics, locate relevant literature, and structure effective research paths.',
    highlights: ['Topic refinement', 'Literature support', 'Planning assistance']
  },
  {
    title: 'Digital Repository Access',
    description: 'Access institutional repository collections including thesis documents and university materials.',
    icon: Library,
    tone: 'from-teal-100 to-emerald-50',
    details:
      'The repository offers curated internal materials such as theses, archived academic documents, and departmental publications.',
    highlights: ['Institutional archive', 'Thesis discovery', 'Departmental content']
  }
];

const resourceSections = [
  {
    title: 'Open Access Resources',
    description: 'Freely available journals, research papers, and open eBooks for all visitors.',
    actionLabel: 'Browse Open Access',
    actionType: 'open_access'
  },
  {
    title: 'Subscribed Resources',
    description: 'Institutional subscriptions such as IEEE, ACM, Springer, and Elsevier collections.',
    actionLabel: 'Login to Access',
    actionType: 'subscribed'
  },
  {
    title: 'University Repository',
    description: 'Internal CUET content including thesis documents, lecture notes, and faculty publications.',
    actionLabel: 'Login to Access',
    actionType: 'university_repository'
  }
];

const statisticsCards = [
  {
    key: 'books',
    label: 'Books',
    description: 'Total books available in the library catalogue.',
    icon: BookOpen,
    accent: 'from-sky-100 to-cyan-50 border-sky-200 text-sky-700'
  },
  {
    key: 'users',
    label: 'Users',
    description: 'Registered student and teacher accounts in EduLibrary.',
    icon: Users,
    accent: 'from-emerald-100 to-teal-50 border-emerald-200 text-emerald-700'
  },
  {
    key: 'resources',
    label: 'Resources',
    description: 'Digital academic materials from notes and repository content.',
    icon: Database,
    accent: 'from-amber-100 to-orange-50 border-amber-200 text-amber-700'
  },
  {
    key: 'activeBorrowings',
    label: 'Active Borrowings',
    description: 'Books currently issued and active in borrowing workflow.',
    icon: Library,
    accent: 'from-indigo-100 to-violet-50 border-indigo-200 text-indigo-700'
  }
];

const supportItems = [
  { title: 'Reference Help', detail: 'Guided support for finding books, journals, and citation materials.' },
  { title: 'Library Hours', detail: 'Mon-Thu: 9:00 AM to 8:00 PM | Fri: 9:00 AM to 1:00 PM' },
  { title: 'Contact', detail: 'library@cuet.ac.bd | +880-31-000000' },
  { title: 'Research Assistance', detail: 'Faculty and students can request curated support for source discovery.' }
];

const resultGroupLabels = {
  books: 'Books',
  researchPapers: 'Research Papers',
  ebooks: 'eBooks',
  journals: 'Journals',
  thesis: 'Thesis',
  lectureNotes: 'Lecture Notes',
  universityRepositoryMaterials: 'University Repository Materials'
};

const accessBadgeStyles = {
  open_access: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  subscribed: 'border-amber-200 bg-amber-50 text-amber-700',
  university_repository: 'border-rose-200 bg-rose-50 text-rose-700',
  catalogue: 'border-slate-300 bg-slate-100 text-slate-700'
};

const accessLabelByType = {
  open_access: 'Open Access',
  subscribed: 'Login Required',
  university_repository: 'Login Required',
  catalogue: 'Catalogue'
};

const resolveResourceUrl = (rawUrl) => {
  if (!rawUrl) return null;

  if (/^https?:\/\//i.test(rawUrl)) {
    return rawUrl;
  }

  const configuredApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const apiBase = configuredApiUrl.replace(/\/api\/?$/, '');
  return `${apiBase}${rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`}`;
};

const formatResourceType = (value) => {
  if (!value) return 'Resource';
  if (value === 'Book') return 'Book';
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const formatCount = (value) => new Intl.NumberFormat('en-US').format(Number(value) || 0);

const formatNoticeDate = (value) => {
  if (!value) return 'Recently published';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently published';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const isRecentNotice = (value) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const diff = Date.now() - date.getTime();
  return diff <= 7 * 24 * 60 * 60 * 1000;
};

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [libraryStats, setLibraryStats] = useState({
    books: 0,
    users: 0,
    resources: 0,
    activeBorrowings: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [landingNotices, setLandingNotices] = useState([]);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const [noticesError, setNoticesError] = useState('');
  const [serviceCursor, setServiceCursor] = useState(0);
  const [activeService, setActiveService] = useState(null);
  const [slideDirection, setSlideDirection] = useState('right');
  const [showAllResults, setShowAllResults] = useState(false);
  const [reduceVisualLoad, setReduceVisualLoad] = useState(false);
  const autoDirectionRef = useRef(1);
  const heroBackgroundImage = '/landing-hero-library.jpg';

  const servicesPerView = 3;
  const maxServiceCursor = Math.max(serviceCards.length - servicesPerView, 0);

  const resultGroups = useMemo(() => {
    if (!searchResults?.groupedResults) {
      return [];
    }

    return Object.entries(searchResults.groupedResults)
      .map(([key, items]) => ({
        key,
        label: resultGroupLabels[key] || key,
        items: Array.isArray(items) ? items : []
      }))
      .filter((group) => group.items.length > 0);
  }, [searchResults]);

  const visibleServices = useMemo(() => {
    return serviceCards.slice(serviceCursor, serviceCursor + servicesPerView);
  }, [serviceCursor]);

  const visibleStatistics = useMemo(() => {
    return statisticsCards.map((item) => ({
      ...item,
      value: libraryStats[item.key] || 0
    }));
  }, [libraryStats]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const lowCoreCount = (navigator.hardwareConcurrency || 8) <= 4;
    setReduceVisualLoad(Boolean(prefersReducedMotion || lowCoreCount));
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadStatistics = async () => {
      try {
        setStatsLoading(true);
        setStatsError('');
        const response = await api.get('/search/stats');
        const payload = response?.data?.data || {};

        if (!isMounted) {
          return;
        }

        setLibraryStats({
          books: Number(payload.books) || 0,
          users: Number(payload.users) || 0,
          resources: Number(payload.resources) || 0,
          activeBorrowings: Number(payload.activeBorrowings) || 0
        });
      } catch (error) {
        if (isMounted) {
          setStatsError('Live statistics are temporarily unavailable.');
        }
      } finally {
        if (isMounted) {
          setStatsLoading(false);
        }
      }
    };

    loadStatistics();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadNotices = async () => {
      try {
        setNoticesLoading(true);
        setNoticesError('');
        const response = await api.get('/notices/public', { params: { limit: 6 } });
        if (!isMounted) return;

        const data = Array.isArray(response?.data?.data) ? response.data.data : [];
        setLandingNotices(data);
      } catch (error) {
        if (isMounted) {
          setNoticesError('Notices are temporarily unavailable.');
          setLandingNotices([]);
        }
      } finally {
        if (isMounted) setNoticesLoading(false);
      }
    };

    loadNotices();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const sectionId = location.hash.replace('#', '');
    const target = document.getElementById(sectionId);

    if (!target) {
      return;
    }

    const timer = setTimeout(() => {
      if (sectionId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);

    return () => clearTimeout(timer);
  }, [location.hash]);

  useEffect(() => {
    if (reduceVisualLoad) {
      return undefined;
    }

    if (maxServiceCursor === 0) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setServiceCursor((prev) => {
        let next = prev + autoDirectionRef.current;

        if (next > maxServiceCursor || next < 0) {
          autoDirectionRef.current *= -1;
          next = prev + autoDirectionRef.current;
        }

        setSlideDirection(autoDirectionRef.current > 0 ? 'right' : 'left');

        return next;
      });
    }, 4000);

    return () => clearInterval(intervalId);
  }, [maxServiceCursor, reduceVisualLoad]);

  const handleSearchSubmit = async (event) => {
    event.preventDefault();

    const keyword = searchTerm.trim();
    if (keyword.length < 2) {
      setSearchError('Please enter at least 2 characters to search.');
      setSearchResults(null);
      return;
    }

    try {
      setSearching(true);
      setSearchError('');
      setShowAllResults(false);
      const response = await api.get('/search/public', { params: { q: keyword } });
      setSearchResults(response.data?.data || null);
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to search right now. Please try again.';
      setSearchError(message);
      setSearchResults(null);
    } finally {
      setSearching(false);
    }
  };

  const handleResultClick = (item) => {
    if (item.requiresLogin) {
      window.location.href = '/login';
      return;
    }

    const url = resolveResourceUrl(item.openUrl);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    window.location.href = '/login';
  };

  const handleServiceNext = () => {
    autoDirectionRef.current = 1;
    setSlideDirection('right');
    setServiceCursor((prev) => (prev >= maxServiceCursor ? 0 : prev + 1));
  };

  const handleServicePrev = () => {
    autoDirectionRef.current = -1;
    setSlideDirection('left');
    setServiceCursor((prev) => (prev <= 0 ? maxServiceCursor : prev - 1));
  };

  const handleResourceSectionClick = (actionType) => {
    if (actionType === 'open_access') {
      navigate('/open-access-resources');
      return;
    }

    navigate('/login');
  };

  return (
    <div className="lp-sans min-h-screen bg-[linear-gradient(165deg,#f8fafc_0%,#ecfeff_36%,#fffbeb_100%)] text-slate-900">
      <section id="home" className="relative h-screen overflow-hidden" aria-label="Landing Hero">
        <div
          className="absolute inset-0 scale-[1.04]"
          style={{
            backgroundImage: `url(${heroBackgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: reduceVisualLoad
              ? 'saturate(1.08) contrast(1.08) brightness(0.83)'
              : 'blur(1.35px) saturate(1.12) contrast(1.12) brightness(0.88)'
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_36%),linear-gradient(125deg,rgba(2,6,23,0.78),rgba(15,23,42,0.56),rgba(2,6,23,0.8))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_22%,rgba(0,0,0,0.42)_100%)]" />

        <header className="lp-reveal lp-delay-1 absolute inset-x-0 top-0 z-20">
          <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-white/25 bg-white/15 px-4 py-3 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
              <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/80 px-4 py-2 shadow-sm">
                <Library className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">CUET Library OS</span>
              </Link>

                <nav className="hidden items-center gap-1 md:flex">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${item.label === 'Login' ? 'border border-slate-900 bg-slate-900 text-white hover:bg-slate-700' : 'border border-white/25 bg-white/70 text-slate-700 hover:bg-white'}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <nav className="mt-3 flex flex-wrap gap-2 md:hidden">
                {navigationItems.map((item) => (
                  <Link
                    key={`mobile-${item.label}`}
                    to={item.href}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${item.label === 'Login' ? 'border border-slate-900 bg-slate-900 text-white hover:bg-slate-700' : 'border border-white/25 bg-white/70 text-slate-700 hover:bg-white'}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </header>

        <div className="relative z-10 flex h-full items-center justify-center px-4 pb-28 pt-24 sm:px-6 sm:pb-32 lg:px-8">
          <article className="lp-reveal lp-delay-2 w-full max-w-3xl rounded-3xl border border-white/55 bg-white/94 p-5 shadow-[0_24px_80px_-34px_rgba(15,23,42,0.9)] backdrop-blur-md sm:p-8">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Welcome To</p>
            <h1 className="lp-display mt-2 text-center text-4xl font-bold leading-tight text-[#0b1f3a] drop-shadow-[0_3px_10px_rgba(15,23,42,0.2)] sm:text-6xl">
                EduLibrary
            </h1>

            <form onSubmit={handleSearchSubmit} className="mt-6">
              <div className="flex flex-col gap-2 rounded-2xl border border-indigo-200 bg-white/80 p-2 sm:flex-row">
                <input
                  id="landing-search"
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search in library catalogue..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-700 px-6 py-3 text-base font-semibold text-white transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Search className="mr-2 h-5 w-5" />
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {searchError && <p className="mt-3 text-center text-xs font-medium text-rose-600">{searchError}</p>}
            </form>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/login"
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-3.5 text-base font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-700"
              >
                Continue to Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </article>
        </div>

        <div className="absolute inset-x-0 bottom-4 z-10 mx-auto w-full max-w-7xl px-4 sm:bottom-6 sm:px-6 lg:px-8">
          <section className="lp-reveal lp-delay-3 rounded-3xl border border-white/20 bg-slate-900/35 px-3 py-3 backdrop-blur-md sm:px-4">
            <div className="mb-2 flex items-center justify-between gap-3 px-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-100">EduLibrary Statistics</p>
              {statsError ? (
                <p className="text-[10px] font-semibold text-rose-200">{statsError}</p>
              ) : (
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-200/90">Live</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              {visibleStatistics.map((stat) => {
                const StatIcon = stat.icon;

                return (
                  <article key={stat.key} className="rounded-2xl border border-white/20 bg-white/12 p-3 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-200">{stat.label}</p>
                      <div className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white">
                        <StatIcon className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <p className="mt-1.5 text-xl font-bold leading-none text-white sm:text-2xl">
                      {statsLoading ? '...' : formatCount(stat.value)}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-24 lg:pt-10">
        {searchResults && (
          <section className="mt-8" aria-label="Search Results">
            <article className="lp-reveal lp-delay-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="lp-display text-2xl text-slate-900 sm:text-3xl">Search Results</h2>
                <p className="text-sm text-slate-600">
                  Keyword: <span className="font-semibold text-slate-900">{searchResults.keyword}</span> | {searchResults.total} items found
                </p>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAllResults((prev) => !prev)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:bg-slate-50"
                >
                  {showAllResults ? 'Show Less' : 'Show All'}
                </button>
              </div>

              {resultGroups.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  No resources found for this keyword. Try title, author, ISBN, research topic, or course name.
                </div>
              ) : (
                <div className="mt-5 space-y-6">
                  {resultGroups.map((group) => (
                    <div key={group.key}>
                      <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-700">
                        {group.label} ({group.items.length})
                      </h3>
                      <div className="grid gap-3 md:grid-cols-2">
                        {(showAllResults ? group.items : group.items.slice(0, 4)).map((item) => (
                          <article key={`${group.key}-${item.id}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <h4 className="text-base font-semibold text-slate-900">{item.title}</h4>
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${accessBadgeStyles[item.accessType] || accessBadgeStyles.catalogue}`}
                              >
                                {accessLabelByType[item.accessType] || 'Access'}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-slate-600">Author/Source: {item.author || 'N/A'}</p>
                            <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">Type: {formatResourceType(item.resourceType)}</p>
                            <p className="mt-2 line-clamp-2 text-sm text-slate-600">{item.description}</p>
                            <div className="mt-3">
                              <button
                                type="button"
                                onClick={() => handleResultClick(item)}
                                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-800 transition hover:bg-slate-100"
                              >
                                {item.requiresLogin ? 'Login to Access' : item.openUrl ? 'Open Resource' : 'View in Portal'}
                                {item.openUrl ? <ExternalLink className="ml-2 h-3.5 w-3.5" /> : <ArrowRight className="ml-2 h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>
        )}

        <section id="services" className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="lp-display text-2xl text-slate-900 sm:text-3xl">Library Services</h2>
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 sm:inline-flex">
              Academic Operations
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={handleServicePrev}
              className="absolute -left-4 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-md transition hover:bg-slate-50 lg:inline-flex"
              aria-label="Previous services"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={handleServiceNext}
              className="absolute -right-4 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-md transition hover:bg-slate-50 lg:inline-flex"
              aria-label="Next services"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 [perspective:1200px]">
              {visibleServices.map((item, index) => {
                const Icon = item.icon;
                const isCenter = index === 1;
                const depthClass = isCenter
                  ? 'lg:scale-[1.02] lg:translate-y-0 lg:rotate-y-0 opacity-100 z-[2]'
                  : 'lg:scale-[0.96] lg:translate-y-2 opacity-90 z-[1]';

                return (
                  <article
                    key={`${item.title}-${serviceCursor}-${slideDirection}`}
                    className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-lg ${reduceVisualLoad ? '' : (slideDirection === 'right' ? 'lp-service-enter-right' : 'lp-service-enter-left')} ${depthClass}`}
                    style={{
                      animationDelay: reduceVisualLoad ? '0ms' : `${index * 70}ms`,
                      transformOrigin: 'center center'
                    }}
                  >
                    <div className={`mb-5 inline-flex h-20 w-20 items-center justify-center rounded-full border text-white shadow-sm ${isCenter ? 'border-amber-300 bg-amber-500' : 'border-slate-300 bg-slate-500'}`}>
                      <Icon className="h-9 w-9" />
                    </div>
                    <h3 className={`font-semibold ${isCenter ? 'text-2xl text-slate-900' : 'text-xl text-slate-800'}`}>{item.title}</h3>
                    <p className={`mt-3 leading-relaxed ${isCenter ? 'text-lg text-slate-600' : 'text-base text-slate-600'}`}>{item.description}</p>
                    <button
                      type="button"
                      onClick={() => setActiveService(item)}
                      className="mt-5 inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-base font-semibold text-slate-800 transition hover:bg-slate-100"
                    >
                      View Details
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                  </article>
                );
              })}
            </div>

            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: maxServiceCursor + 1 }, (_, idx) => (
                <button
                  key={`service-dot-${idx}`}
                  type="button"
                  onClick={() => {
                    autoDirectionRef.current = idx >= serviceCursor ? 1 : -1;
                    setServiceCursor(idx);
                  }}
                  className={`h-2.5 rounded-full transition-all ${idx === serviceCursor ? 'w-8 bg-slate-900' : 'w-2.5 bg-slate-300 hover:bg-slate-400'}`}
                  aria-label={`Show services from position ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="resources" className="mt-12 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <article className="lp-reveal lp-delay-3 relative overflow-hidden rounded-3xl border border-slate-200/90 bg-[linear-gradient(145deg,#ffffff_0%,#f8fafc_58%,#eef2ff_100%)] p-6 shadow-[0_30px_65px_-42px_rgba(15,23,42,0.6)] sm:p-7">
            <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-cyan-300/20 blur-2xl" />
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-slate-700">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
                  <Database className="h-4.5 w-4.5" />
                </div>
                <h2 className="lp-display text-2xl text-slate-900">Academic Resources</h2>
              </div>
              <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                Curated Paths
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {resourceSections.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => handleResourceSectionClick(item.actionType)}
                  className="group w-full rounded-2xl border border-slate-200/90 bg-white/80 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-white hover:shadow-md"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Section {index + 1}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                      {item.actionType === 'open_access' ? 'Public' : 'Login'}
                    </span>
                  </div>
                  <h3 className="mt-1 text-base font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.description}</p>
                  <span className="mt-3 inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-700 transition group-hover:border-cyan-300 group-hover:bg-cyan-50 group-hover:text-cyan-700">
                    {item.actionLabel}
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </span>
                </button>
              ))}
            </div>
          </article>

          <article id="notices" className="lp-reveal lp-delay-4 relative overflow-hidden rounded-3xl border border-slate-700/70 bg-[linear-gradient(155deg,#0b1228_0%,#111a39_46%,#0f2940_100%)] p-6 text-white shadow-[0_34px_70px_-42px_rgba(2,6,23,0.95)] sm:p-7">
            <div className="pointer-events-none absolute -left-10 top-4 h-32 w-32 rounded-full bg-emerald-300/15 blur-2xl" />
            <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-cyan-300/15 blur-2xl" />

            <div className="mb-5 flex items-center justify-between gap-3 text-emerald-100">
              <div className="flex items-center gap-2">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-emerald-100">
                  <Newspaper className="h-4.5 w-4.5" />
                </div>
                <h2 className="lp-display text-2xl text-white">Notices and Announcements</h2>
              </div>
              <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-200">
                Live Feed
              </span>
            </div>
            <div className="space-y-3">
              {noticesLoading ? (
                <div className="rounded-xl border border-white/15 bg-white/10 p-4 text-sm text-slate-200">
                  Loading latest notices...
                </div>
              ) : noticesError ? (
                <div className="rounded-xl border border-amber-300/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                  {noticesError}
                </div>
              ) : landingNotices.length === 0 ? (
                <div className="rounded-xl border border-white/15 bg-white/10 p-4 text-sm text-slate-300">
                  No published notices yet.
                </div>
              ) : (
                landingNotices.map((notice) => (
                  <div key={notice.id} className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition hover:border-cyan-300/30 hover:bg-white/15">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-white">{notice.title}</h3>
                      <div className="flex items-center gap-1.5">
                        {isRecentNotice(notice.published_at) && (
                          <span className="rounded-full border border-emerald-300/50 bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-100">
                            New
                          </span>
                        )}
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                          {formatNoticeDate(notice.published_at)}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-slate-300">{notice.content}</p>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <article className="lp-reveal lp-delay-4 rounded-3xl border border-slate-200/90 bg-[linear-gradient(150deg,#ffffff_0%,#f8fafc_62%,#fff7ed_100%)] p-6 shadow-[0_28px_62px_-44px_rgba(15,23,42,0.58)] sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-3 text-slate-700">
              <div className="flex items-center gap-2">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <LifeBuoy className="h-4.5 w-4.5" />
                </div>
                <h2 className="lp-display text-2xl text-slate-900">Library Support</h2>
              </div>
              <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                Quick Help
              </span>
            </div>
            <div className="space-y-3">
              {supportItems.map((item) => (
                <div key={item.title} className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md">
                  <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="lp-reveal lp-delay-5 relative overflow-hidden rounded-3xl border border-slate-900/20 bg-[linear-gradient(140deg,#0f172a_0%,#0f3a3e_54%,#125c45_100%)] p-6 text-white shadow-[0_36px_72px_-44px_rgba(2,6,23,0.95)] sm:p-7">
            <div className="pointer-events-none absolute -bottom-10 -right-8 h-36 w-36 rounded-full bg-emerald-300/15 blur-2xl" />
            <div className="pointer-events-none absolute -top-8 left-8 h-28 w-28 rounded-full bg-cyan-300/15 blur-2xl" />

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">Call To Action</p>
            <h2 className="lp-display mt-2 max-w-lg text-3xl text-white">Access EduLibrary and Continue to Your Portal</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-emerald-100">
              Explore CUET library services, then continue through Login to enter your Student, Teacher, or Admin portal.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white px-5 py-3 text-sm font-extrabold uppercase tracking-[0.06em] text-slate-900 transition hover:-translate-y-0.5 hover:bg-emerald-50"
              >
                Login to EduLibrary
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-emerald-100 backdrop-blur-sm">
                <GraduationCap className="h-4 w-4" />
                Public Gateway to Role Portals
              </div>
            </div>
          </article>
        </section>
      </div>

      {activeService && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 px-4">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Service Details
                </p>
                <h3 className="mt-2 text-3xl font-bold text-slate-900">{activeService.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveService(null)}
                className="rounded-full border border-slate-300 bg-white p-2 text-slate-700 transition hover:bg-slate-100"
                aria-label="Close service details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-4 text-base leading-relaxed text-slate-700">{activeService.details}</p>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {activeService.highlights.map((point) => (
                <div key={point} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                  {point}
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Continue to Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => setActiveService(null)}
                className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
