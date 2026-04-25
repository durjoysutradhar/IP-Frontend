import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Edit,
  FolderOpen,
  Layers,
  Plus,
  RefreshCcw,
  Search,
  ShieldAlert,
  Trash2,
  X
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import api from '../../utils/api';

const SORT_OPTIONS = [
  { key: 'name_az', label: 'Name A-Z' },
  { key: 'name_za', label: 'Name Z-A' },
  { key: 'books_high', label: 'Books High-Low' },
  { key: 'books_low', label: 'Books Low-High' }
];

const revealClass = (isReady) =>
  `transition-all duration-700 ${isReady ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`;

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({ name: '', description: '' });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name_az');
  const [categoryBookCounts, setCategoryBookCounts] = useState({});

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryBooks, setCategoryBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsPageReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      const payload = response?.data?.data;
      const categoryRows = Array.isArray(payload) ? payload : [];
      setCategories(categoryRows);
      fetchCategoryBookCounts(categoryRows);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
      setCategories([]);
      setCategoryBookCounts({});
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryBookCounts = async (categoryRows) => {
    try {
      const countPairs = await Promise.all(
        categoryRows.map(async (category) => {
          const response = await api.get('/books', {
            params: {
              category: category.id,
              limit: 1,
              sortBy: 'title',
              order: 'ASC'
            }
          });

          const total =
            response?.data?.data?.pagination?.total ||
            response?.data?.data?.total ||
            (Array.isArray(response?.data?.data?.books) ? response.data.data.books.length : 0);

          return [category.id, Number(total || 0)];
        })
      );

      setCategoryBookCounts(Object.fromEntries(countPairs));
    } catch (err) {
      setCategoryBookCounts({});
    }
  };

  const fetchCategoryBooks = async (category) => {
    setBooksLoading(true);
    try {
      const response = await api.get('/books', {
        params: {
          category: category.id,
          limit: 100,
          sortBy: 'title',
          order: 'ASC'
        }
      });
      const payload = response?.data?.data;
      const books = Array.isArray(payload?.books)
        ? payload.books
        : Array.isArray(payload)
          ? payload
          : [];
      setCategoryBooks(books);
      setSelectedCategory(category);
    } catch (err) {
      setCategoryBooks([]);
      setSelectedCategory(category);
      alert(err.response?.data?.message || 'Failed to load books for this category');
    } finally {
      setBooksLoading(false);
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData);
        alert('Category updated successfully');
      } else {
        await api.post('/categories', formData);
        alert('Category created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete category "${category.name}"?`)) {
      return;
    }

    try {
      await api.delete(`/categories/${category.id}`);
      alert('Category deleted');
      if (selectedCategory?.id === category.id) {
        setSelectedCategory(null);
        setCategoryBooks([]);
      }
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    let result = term
      ? categories.filter((category) => `${category.name} ${category.description || ''}`.toLowerCase().includes(term))
      : [...categories];

    if (sortBy === 'name_az') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'name_za') {
      result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    } else if (sortBy === 'books_high') {
      result.sort((a, b) => Number(categoryBookCounts[b.id] || 0) - Number(categoryBookCounts[a.id] || 0));
    } else if (sortBy === 'books_low') {
      result.sort((a, b) => Number(categoryBookCounts[a.id] || 0) - Number(categoryBookCounts[b.id] || 0));
    }

    return result;
  }, [categories, categoryBookCounts, search, sortBy]);

  const stats = useMemo(() => {
    const total = categories.length;
    const described = categories.filter((c) => c.description && c.description.trim()).length;
    const noDescription = total - described;
    const selectedBooks = categoryBooks.length;

    return { total, described, noDescription, selectedBooks };
  }, [categories, categoryBooks]);

  return (
    <AdminLayout>
      <div className="space-y-6 pb-6">
        <section className={`relative overflow-hidden rounded-3xl border border-amber-200/60 bg-gradient-to-br from-stone-100 via-amber-50 to-rose-100 p-6 shadow-[0_22px_70px_-34px_rgba(146,64,14,0.35)] md:p-8 ${revealClass(isPageReady)}`}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(251,191,36,0.24),transparent_32%),radial-gradient(circle_at_85%_82%,rgba(251,113,133,0.22),transparent_36%)]" />
          <div className="pointer-events-none absolute right-5 top-5 h-24 w-24 rounded-full border border-amber-300/70" />
          <div className="pointer-events-none absolute left-6 bottom-6 h-20 w-20 rounded-full border border-rose-300/70" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 inline-flex rounded-full border border-amber-300 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">
                Category Studio
              </p>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Manage Categories</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-700 md:text-base">
                Organize the catalog structure and audit which books belong to each category.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={fetchCategories}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400 hover:text-amber-800"
              >
                <RefreshCcw className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                Refresh
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Category
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
          <article className={`${revealClass(isPageReady)} rounded-2xl border border-amber-200 bg-gradient-to-br from-white to-amber-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md`} style={{ transitionDelay: '80ms' }}>
            <div className="mb-3 inline-flex rounded-xl bg-amber-100 p-2.5 text-amber-700">
              <Layers className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-500">Total Categories</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</p>
          </article>

          <article className={`${revealClass(isPageReady)} rounded-2xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md`} style={{ transitionDelay: '140ms' }}>
            <div className="mb-3 inline-flex rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
              <FolderOpen className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-500">With Description</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{stats.described}</p>
          </article>

          <article className={`${revealClass(isPageReady)} rounded-2xl border border-rose-200 bg-gradient-to-br from-white to-rose-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md`} style={{ transitionDelay: '200ms' }}>
            <div className="mb-3 inline-flex rounded-xl bg-rose-100 p-2.5 text-rose-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-500">Need Description</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{stats.noDescription}</p>
          </article>

          <article className={`${revealClass(isPageReady)} rounded-2xl border border-sky-200 bg-gradient-to-br from-white to-sky-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md`} style={{ transitionDelay: '260ms' }}>
            <div className="mb-3 inline-flex rounded-xl bg-sky-100 p-2.5 text-sky-700">
              <BookOpen className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-500">Books In Selected</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{stats.selectedBooks}</p>
          </article>
        </section>

        <section className={`${revealClass(isPageReady)} rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-sm backdrop-blur-sm`} style={{ transitionDelay: '320ms' }}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Search</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search category name or description..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-all duration-200 focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Sort</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className={`${revealClass(isPageReady)} overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm`} style={{ transitionDelay: '380ms' }}>
          {loading ? (
            <div className="py-14">
              <LoadingSpinner size="md" className="py-2" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-sm font-semibold text-slate-700">No categories found</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="mt-4 rounded-xl bg-gradient-to-r from-lime-500 to-cyan-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Add your first category
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-gradient-to-r from-slate-900 to-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-100">#</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-100">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-100">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-100">Books</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-100">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredCategories.map((category, index) => (
                    <tr key={category.id} className="group transition-all duration-200 hover:bg-amber-50/55">
                      <td className="px-6 py-4 text-sm text-slate-500">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900 transition-transform duration-200 group-hover:translate-x-1">{category.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{category.description || 'No description added'}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-amber-700">{Number(categoryBookCounts[category.id] || 0)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => fetchCategoryBooks(category)}
                            className="inline-flex items-center rounded-md border border-slate-300 bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-800 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-200"
                          >
                            <BookOpen className="mr-1 h-3.5 w-3.5" />
                            View Books
                          </button>
                          <button
                            onClick={() => handleEdit(category)}
                            className="inline-flex items-center rounded-md border border-amber-300 bg-amber-100 px-2.5 py-1.5 text-xs font-semibold text-amber-800 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-200"
                          >
                            <Edit className="mr-1 h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            className="inline-flex items-center rounded-md border border-rose-300 bg-rose-100 px-2.5 py-1.5 text-xs font-semibold text-rose-800 transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-200"
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

        {selectedCategory && (
          <section className={`${revealClass(isPageReady)} rounded-2xl border border-slate-200 bg-white p-5 shadow-sm`} style={{ transitionDelay: '460ms' }}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Books in {selectedCategory.name}</h2>
                <p className="text-sm text-slate-500">{selectedCategory.description || 'No description'}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setCategoryBooks([]);
                }}
                className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Clear
              </button>
            </div>

            {booksLoading ? (
              <LoadingSpinner size="md" className="py-8" />
            ) : categoryBooks.length === 0 ? (
              <p className="text-sm text-slate-500">No books in this category yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50/90">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Author</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Copies</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Available</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {categoryBooks.map((book) => (
                      <tr key={book.id}>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">{book.title}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{book.author}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{book.total_copies}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-emerald-700">{book.available_copies}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition-all focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition-all focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
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
              disabled={isSaving}
              className="rounded-xl bg-gradient-to-r from-lime-500 to-cyan-600 px-4 py-2 font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default ManageCategories;
