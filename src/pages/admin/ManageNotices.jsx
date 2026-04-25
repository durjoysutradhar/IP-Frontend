import { useEffect, useMemo, useState } from 'react';
import {
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  Search,
  Calendar,
  Eye,
  EyeOff,
  X,
  Save
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../utils/api';

const INITIAL_FORM = {
  title: '',
  content: '',
  is_published: true
};

const formatDateTime = (value) => {
  if (!value) return 'Not published';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not published';
  return date.toLocaleString();
};

const ManageNotices = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notices, setNotices] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notices', {
        params: {
          page: 1,
          limit: 100,
          search: search || undefined,
          status
        }
      });

      setNotices(response.data.data?.notices || []);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingNotice(null);
    setForm(INITIAL_FORM);
    setShowModal(true);
  };

  const openEditModal = (notice) => {
    setEditingNotice(notice);
    setForm({
      title: notice.title || '',
      content: notice.content || '',
      is_published: Boolean(notice.is_published)
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingNotice(null);
    setForm(INITIAL_FORM);
  };

  const submitNotice = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        is_published: form.is_published
      };

      if (editingNotice) {
        await api.put(`/notices/${editingNotice.id}`, payload);
      } else {
        await api.post('/notices', payload);
      }

      closeModal();
      fetchNotices();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save notice');
    } finally {
      setSaving(false);
    }
  };

  const deleteNotice = async (noticeId) => {
    if (!window.confirm('Delete this notice?')) return;

    try {
      await api.delete(`/notices/${noticeId}`);
      fetchNotices();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete notice');
    }
  };

  const filteredNotices = useMemo(() => {
    const key = search.trim().toLowerCase();

    return notices.filter((notice) => {
      const matchesSearch = !key
        || notice.title?.toLowerCase().includes(key)
        || notice.content?.toLowerCase().includes(key);

      const matchesStatus = status === 'all'
        || (status === 'published' && notice.is_published)
        || (status === 'draft' && !notice.is_published);

      return matchesSearch && matchesStatus;
    });
  }, [notices, search, status]);

  const publishedCount = notices.filter((n) => n.is_published).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="deck-hero dashboard-reveal overflow-hidden rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200">
                Public Communication Center
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-white">Manage Notices</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-200">
                Publish announcements for the landing page notice section. Draft notices are saved but hidden publicly.
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center rounded-xl border border-cyan-200/35 bg-cyan-300/20 px-4 py-2.5 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/30"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Notice
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/20 bg-white/10 p-3">
              <p className="text-xs text-slate-300">Total Notices</p>
              <p className="text-2xl font-semibold text-white">{notices.length}</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-3">
              <p className="text-xs text-slate-300">Published</p>
              <p className="text-2xl font-semibold text-white">{publishedCount}</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-3">
              <p className="text-xs text-slate-300">Drafts</p>
              <p className="text-2xl font-semibold text-white">{Math.max(0, notices.length - publishedCount)}</p>
            </div>
          </div>
        </section>

        <section className="deck-panel dashboard-reveal dashboard-delay-2 rounded-2xl p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="md:col-span-3">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Search</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-9"
                  placeholder="Search title or content"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <button onClick={fetchNotices} className="btn-primary text-sm">Apply Filters</button>
          </div>
        </section>

        <section className="deck-panel dashboard-reveal dashboard-delay-3 rounded-2xl p-4 sm:p-5">
          {loading ? (
            <LoadingSpinner size="md" className="py-12" />
          ) : filteredNotices.length === 0 ? (
            <p className="py-10 text-center text-slate-500">No notices found.</p>
          ) : (
            <div className="space-y-3">
              {filteredNotices.map((notice) => (
                <article key={notice.id} className="rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-900">{notice.title}</h3>
                        {notice.is_published ? (
                          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            <Eye className="mr-1 h-3.5 w-3.5" /> Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            <EyeOff className="mr-1 h-3.5 w-3.5" /> Draft
                          </span>
                        )}
                      </div>

                      <p className="line-clamp-3 text-sm text-slate-600">{notice.content}</p>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2 py-1">
                          <Calendar className="mr-1 h-3.5 w-3.5" />
                          {notice.is_published ? `Published: ${formatDateTime(notice.published_at)}` : 'Not published'}
                        </span>
                        <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2 py-1">
                          <Megaphone className="mr-1 h-3.5 w-3.5" />
                          Updated: {formatDateTime(notice.updated_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(notice)}
                        className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Pencil className="mr-1.5 h-4 w-4" /> Edit
                      </button>

                      <button
                        onClick={() => deleteNotice(notice.id)}
                        className="inline-flex items-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingNotice ? 'Edit Notice' : 'Create Notice'}
              </h2>
              <button onClick={closeModal} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitNotice} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
                <input
                  className="input"
                  required
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Notice Content</label>
                <textarea
                  className="input"
                  rows={6}
                  required
                  value={form.content}
                  onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                />
              </div>

              <div>
                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setForm((prev) => ({ ...prev, is_published: e.target.checked }))}
                  />
                  Publish this notice on the landing page
                </label>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary inline-flex items-center justify-center">
                  <Save className="mr-1.5 h-4 w-4" />
                  {saving ? 'Saving...' : editingNotice ? 'Update Notice' : 'Create Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageNotices;
