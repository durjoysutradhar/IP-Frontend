import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Search, BookOpen, ArrowRight, Sparkles, SlidersHorizontal } from 'lucide-react';
import api from '../../utils/api';

const coverFallback =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' fill='%236b7280' font-size='20' font-family='Arial, sans-serif' text-anchor='middle' dominant-baseline='middle'>No Cover</text></svg>";

const BrowseBooks = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [pagination.page, search, selectedCategory]);

  useEffect(() => {
    if (loading) {
      setAnimateIn(false);
      return;
    }

    const timer = setTimeout(() => setAnimateIn(true), 90);
    return () => clearTimeout(timer);
  }, [loading]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search,
        category: selectedCategory
      };

      const response = await api.get('/books', { params });
      setBooks(response.data.data.books);
      setPagination((prev) => ({
        ...prev,
        ...response.data.data.pagination
      }));
    } catch (error) {
      console.error('Error fetching books:', error);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const displayedBooks = useMemo(() => {
    const filtered = availableOnly ? books.filter((book) => book.available_copies > 0) : books;

    if (sortBy === 'title-asc') {
      return [...filtered].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    if (sortBy === 'title-desc') {
      return [...filtered].sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    }

    if (sortBy === 'available-desc') {
      return [...filtered].sort((a, b) => (b.available_copies || 0) - (a.available_copies || 0));
    }

    return filtered;
  }, [books, sortBy, availableOnly]);

  return (
    <StudentLayout>
      <div className="deck-shell space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">
        <div className="relative z-10 space-y-6 sm:space-y-8">
          <section
            className={`deck-hero sd-enter sd-shine rounded-3xl p-6 sm:p-8 ${
              animateIn ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  Curated Discovery Catalog
                </div>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Browse Books</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
                  Find your next read through elegant search, refined filters, and visual-first book cards.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-sm">
                  <p className="text-xs text-slate-300">Results</p>
                  <p className="text-xl font-black text-white">{pagination.total || books.length}</p>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-sm">
                  <p className="text-xs text-slate-300">Page</p>
                  <p className="text-xl font-black text-white">{pagination.page}</p>
                </div>
                <div className="col-span-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-sm sm:col-span-1">
                  <p className="text-xs text-slate-300">Categories</p>
                  <p className="text-xl font-black text-white">{categories.length}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSearch} className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-12">
              <div className="xl:col-span-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by title, author, or ISBN..."
                    className="w-full rounded-xl border border-slate-300/80 bg-white/90 py-2.5 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="xl:col-span-3">
                <select
                  className="w-full rounded-xl border border-slate-300/80 bg-white/90 px-3 py-2.5 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-400"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="xl:col-span-2">
                <select
                  className="w-full rounded-xl border border-slate-300/80 bg-white/90 px-3 py-2.5 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-400"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="relevance">Sort: Relevance</option>
                  <option value="title-asc">Title A-Z</option>
                  <option value="title-desc">Title Z-A</option>
                  <option value="available-desc">Most Available</option>
                </select>
              </div>

              <div className="xl:col-span-2">
                <button
                  type="button"
                  onClick={() => setAvailableOnly((prev) => !prev)}
                  className={`inline-flex w-full items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all duration-300 ${
                    availableOnly
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : 'border-slate-300 bg-white/90 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  {availableOnly ? 'Available Only: ON' : 'Available Only'}
                </button>
              </div>
            </form>
          </section>

          {loading ? (
            <LoadingSpinner size="lg" className="py-12" />
          ) : displayedBooks.length === 0 ? (
            <section className="deck-panel rounded-2xl py-14 text-center">
              <BookOpen className="mx-auto mb-4 h-16 w-16 text-slate-400" />
              <p className="text-lg font-semibold text-slate-700">No books match this filter</p>
              <p className="mt-1 text-sm text-slate-500">Try another category or disable the availability filter.</p>
            </section>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">
                  Showing {displayedBooks.length} book{displayedBooks.length > 1 ? 's' : ''}
                </p>
                {availableOnly && (
                  <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                    Availability filter enabled
                  </span>
                )}
              </div>

              <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {displayedBooks.map((book, index) => (
                  <Link
                    key={book.id}
                    to={`/student/books/${book.id}`}
                    className={`deck-panel deck-hover sd-enter sd-shine group overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm ${
                      animateIn ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}
                    style={{ transitionDelay: `${120 + index * 45}ms` }}
                  >
                    <div className="mb-4 flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-sky-100 via-blue-100 to-indigo-100">
                      {book.cover_image ? (
                        <img
                          src={book.cover_image}
                          alt={book.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                          onError={(e) => {
                            e.currentTarget.src = coverFallback;
                          }}
                        />
                      ) : (
                        <BookOpen className="h-12 w-12 text-primary-600" />
                      )}
                    </div>

                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 font-semibold text-slate-900 transition group-hover:text-primary-700">
                        {book.title}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          book.available_copies > 0
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {book.available_copies > 0 ? 'Available' : 'Out'}
                      </span>
                    </div>

                    <p className="mb-2 text-sm text-slate-600">{book.author}</p>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                      <span className="text-xs text-slate-500">{book.category?.name || 'General'}</span>
                      <span
                        className={`text-xs font-semibold ${
                          book.available_copies > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {book.available_copies > 0 ? `${book.available_copies} copies` : 'Not available'}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>View details</span>
                      <ArrowRight className="h-3.5 w-3.5 text-primary-600 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </section>

              {pagination.pages > 1 && (
                <section className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="rounded-lg border border-slate-300 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-700">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="rounded-lg border border-slate-300 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default BrowseBooks;
