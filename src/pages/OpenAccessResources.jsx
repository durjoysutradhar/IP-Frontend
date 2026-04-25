import { ArrowLeft, ExternalLink, FileText, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const toResourceUrl = (rawUrl) => {
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
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const OpenAccessResources = () => {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadResources = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/resources/public', {
          params: {
            page: 1,
            limit: 60,
            ...(query ? { search: query } : {})
          }
        });

        if (!isMounted) {
          return;
        }

        setResources(response?.data?.data?.resources || []);
      } catch (err) {
        if (isMounted) {
          setError('Unable to load open access resources right now. Please try again.');
          setResources([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadResources();

    return () => {
      isMounted = false;
    };
  }, [query]);

  const countText = useMemo(() => {
    if (loading) return 'Loading...';
    return `${resources.length} resource${resources.length === 1 ? '' : 's'} found`;
  }, [loading, resources.length]);

  const handleSearch = (event) => {
    event.preventDefault();
    setQuery(search.trim());
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#f8fafc_0%,#f0fdfa_45%,#fffbeb_100%)] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/landing#resources" className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Landing
          </Link>

          <Link to="/login" className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
            Login
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Public Academic Collection</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Open Access Resources</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
            Browse publicly available research papers, journals, eBooks, and other open academic materials without login.
          </p>

          <form onSubmit={handleSearch} className="mt-5 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, author, or keyword"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-teal-500 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </button>
          </form>

          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{countText}</p>
        </section>

        {error && (
          <section className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
            {error}
          </section>
        )}

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {resources.map((resource) => {
            const link = toResourceUrl(resource.external_link || resource.file_url);
            return (
              <article key={resource.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h2 className="text-base font-semibold text-slate-900">{resource.title}</h2>
                  <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-700">
                    Open
                  </span>
                </div>
                <p className="text-sm text-slate-600">{resource.author_source || 'Unknown source'}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                  {formatResourceType(resource.resource_type)}
                </p>
                {resource.description && (
                  <p className="mt-2 text-sm text-slate-600">{resource.description}</p>
                )}

                <div className="mt-4">
                  {link ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-800 transition hover:bg-slate-100"
                    >
                      Open Resource
                      <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                      <FileText className="mr-2 h-3.5 w-3.5" />
                      Link Unavailable
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </section>

        {!loading && !error && resources.length === 0 && (
          <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <p className="text-sm text-slate-600">No open access resources found for your search.</p>
          </section>
        )}
      </main>
    </div>
  );
};

export default OpenAccessResources;
