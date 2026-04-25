import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Boxes,
  Download,
  Edit,
  Plus,
  RefreshCcw,
  Search,
  ShieldAlert,
  Trash2
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import api from '../../utils/api';

const STOCK_FILTERS = [
  { key: 'all', label: 'All Stock' },
  { key: 'healthy', label: 'Healthy' },
  { key: 'low', label: 'Low Stock' },
  { key: 'empty', label: 'Out of Stock' }
];

const formatNumber = (value) => Number(value || 0).toLocaleString();

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title_az');

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category_id: '',
    total_copies: 1,
    description: '',
    publication_year: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [search]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/books', {
        params: { search, limit: 100 }
      });

      const payload = response?.data?.data;
      const rows = Array.isArray(payload?.books)
        ? payload.books
        : Array.isArray(payload)
          ? payload
          : [];

      setBooks(rows);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load books');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      const payload = response?.data?.data;
      setCategories(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setCategories([]);
    }
  };

  const resetForm = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      isbn: '',
      category_id: '',
      total_copies: 1,
      description: '',
      publication_year: ''
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      category_id: book.category_id || '',
      total_copies: book.total_copies || 1,
      description: book.description || '',
      publication_year: book.publication_year || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        total_copies: Number(formData.total_copies),
        category_id: Number(formData.category_id)
      };

      if (formData.publication_year) {
        payload.publication_year = Number(formData.publication_year);
      }

      if (!formData.isbn) {
        delete payload.isbn;
      }

      if (!formData.description) {
        delete payload.description;
      }

      if (editingBook) {
        await api.put(`/books/${editingBook.id}`, payload);
        alert('Book updated successfully');
      } else {
        await api.post('/books', payload);
        alert('Book created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchBooks();
    } catch (err) {
      const backendErrors = err.response?.data?.errors;
      const message = Array.isArray(backendErrors) && backendErrors.length > 0
        ? backendErrors.map((item) => item.message).join(', ')
        : err.response?.data?.message || 'Failed to save book';
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book?')) {
      return;
    }

    try {
      await api.delete(`/books/${id}`);
      alert('Book deleted');
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete book');
    }
  };

  const visibleBooks = useMemo(() => {
    let result = [...books];

    if (categoryFilter !== 'all') {
      result = result.filter((book) => String(book.category_id) === categoryFilter);
    }

    if (stockFilter === 'low') {
      result = result.filter((book) => Number(book.available_copies || 0) > 0 && Number(book.available_copies || 0) <= 2);
    } else if (stockFilter === 'empty') {
      result = result.filter((book) => Number(book.available_copies || 0) === 0);
    } else if (stockFilter === 'healthy') {
      result = result.filter((book) => Number(book.available_copies || 0) > 2);
    }

    if (sortBy === 'title_az') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortBy === 'title_za') {
      result.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    } else if (sortBy === 'copies_desc') {
      result.sort((a, b) => Number(b.total_copies || 0) - Number(a.total_copies || 0));
    } else if (sortBy === 'copies_asc') {
      result.sort((a, b) => Number(a.total_copies || 0) - Number(b.total_copies || 0));
    }

    return result;
  }, [books, categoryFilter, stockFilter, sortBy]);

  const dashboardStats = useMemo(() => {
    const totalTitles = books.length;
    const totalCopies = books.reduce((sum, b) => sum + Number(b.total_copies || 0), 0);
    const availableCopies = books.reduce((sum, b) => sum + Number(b.available_copies || 0), 0);
    const lowStock = books.filter((b) => Number(b.available_copies || 0) <= 2).length;

    return { totalTitles, totalCopies, availableCopies, lowStock };
  }, [books]);

  const exportVisibleBooks = () => {
    if (!visibleBooks.length) {
      return;
    }

    const header = ['Title', 'Author', 'Category', 'ISBN', 'Year', 'Total Copies', 'Available Copies'];
    const rows = visibleBooks.map((book) => [
      book.title || '-',
      book.author || '-',
      book.category?.name || '-',
      book.isbn || '-',
      book.publication_year || '-',
      Number(book.total_copies || 0),
      Number(book.available_copies || 0)
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).split('"').join('""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'books-export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-6">
        <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-orange-50 via-white to-sky-50 p-6 shadow-[0_18px_60px_-35px_rgba(30,64,175,0.45)] md:p-8">
          <div className="pointer-events-none absolute -left-10 -top-16 h-40 w-40 rounded-full bg-orange-200/45 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 -bottom-16 h-44 w-44 rounded-full bg-sky-200/40 blur-3xl" />

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center rounded-full border border-orange-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-orange-700">
                Book Inventory Command
              </p>
              <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Manage Books</h1>
              <p className="mt-2 text-sm text-slate-600 md:text-base">
                Curate your library catalog, monitor stock pressure, and keep inventory clean.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <button
                onClick={fetchBooks}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/85 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-700"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </button>
              <button
                onClick={exportVisibleBooks}
                disabled={!visibleBooks.length}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/85 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </button>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Book
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="flex items-center rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
            <ShieldAlert className="mr-2 h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 inline-flex rounded-xl bg-slate-100 p-2.5 text-slate-700">
              <BookOpen className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-500">Total Titles</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formatNumber(dashboardStats.totalTitles)}</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 inline-flex rounded-xl bg-sky-100 p-2.5 text-sky-700">
              <Boxes className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-500">Total Copies</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formatNumber(dashboardStats.totalCopies)}</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 inline-flex rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
              <BookOpen className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-500">Available Now</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formatNumber(dashboardStats.availableCopies)}</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 inline-flex rounded-xl bg-amber-100 p-2.5 text-amber-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-500">Low Stock Titles</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formatNumber(dashboardStats.lowStock)}</p>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="xl:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Search</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Title, author, ISBN..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-all focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={String(category.id)}>{category.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Stock State</label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              >
                {STOCK_FILTERS.map((filter) => (
                  <option key={filter.key} value={filter.key}>{filter.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Sort</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              >
                <option value="title_az">Title A-Z</option>
                <option value="title_za">Title Z-A</option>
                <option value="copies_desc">Copies High-Low</option>
                <option value="copies_asc">Copies Low-High</option>
              </select>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="py-14">
              <LoadingSpinner size="md" className="py-2" />
            </div>
          ) : visibleBooks.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-sm font-semibold text-slate-700">No books found</p>
              <p className="mt-1 text-xs text-slate-500">Try changing search or filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50/90">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Available</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {visibleBooks.map((book) => {
                    const available = Number(book.available_copies || 0);
                    const availabilityClass = available === 0
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : available <= 2
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                    return (
                      <tr key={book.id} className="group transition-colors hover:bg-sky-50/40">
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-900">{book.title}</p>
                          <p className="mt-0.5 text-xs text-slate-500">ISBN: {book.isbn || '-'}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">{book.author}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{book.category?.name || '-'}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-800">{formatNumber(book.total_copies)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${availabilityClass}`}>
                            {formatNumber(available)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(book)}
                              className="inline-flex items-center rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-100"
                            >
                              <Edit className="mr-1 h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(book.id)}
                              className="inline-flex items-center rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                            >
                              <Trash2 className="mr-1 h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingBook ? 'Edit Book' : 'Add Book'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition-all focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Author *</label>
            <input
              type="text"
              required
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition-all focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Category *</label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition-all focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Total Copies *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.total_copies}
                onChange={(e) => setFormData({ ...formData, total_copies: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition-all focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">ISBN</label>
              <input
                type="text"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition-all focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Year</label>
              <input
                type="number"
                min="1000"
                max="9999"
                value={formData.publication_year}
                onChange={(e) => setFormData({ ...formData, publication_year: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition-all focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition-all focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-orange-500 to-sky-600 px-4 py-2 font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default ManageBooks;
