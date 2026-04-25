import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, Download, RefreshCcw, Search, ShieldAlert, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../utils/api';

const apiRoot = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || globalThis.location?.origin || '';

const ManageNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchNotes = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/notes', { params: { limit: 100 } });
      const payload = response?.data?.data;
      setNotes(Array.isArray(payload?.notes) ? payload.notes : []);
    } catch (err) {
      setNotes([]);
      setError(err.response?.data?.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const visibleNotes = useMemo(() => {
    let result = [...notes];

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      result = result.filter((note) => {
        const title = note.title || '';
        const bookTitle = note.book?.title || '';
        const uploader = note.uploader?.name || '';
        return [title, bookTitle, uploader].some((value) => value.toLowerCase().includes(term));
      });
    }

    if (statusFilter === 'approved') {
      result = result.filter((note) => note.approved);
    } else if (statusFilter === 'pending') {
      result = result.filter((note) => !note.approved);
    }

    return result;
  }, [notes, search, statusFilter]);

  const updateStatus = async (id, approved) => {
    setSavingId(id);
    try {
      await api.put(`/notes/${id}/approve`, { approved });
      await fetchNotes();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update note status');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!globalThis.confirm('Delete this note?')) return;

    setSavingId(id);
    try {
      await api.delete(`/notes/${id}`);
      await fetchNotes();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete note');
    } finally {
      setSavingId(null);
    }
  };

  const getNoteUrl = (fileUrl) => {
    if (!fileUrl) return '#';
    return `${apiRoot}${fileUrl}`;
  };

  const approvedCount = notes.filter((note) => note.approved).length;

  let notesContent;

  if (loading) {
    notesContent = (
      <div className="py-16">
        <LoadingSpinner size="md" className="py-2" />
      </div>
    );
  } else if (visibleNotes.length === 0) {
    notesContent = (
      <div className="py-16 text-center">
        <p className="text-sm font-semibold text-slate-700">No notes found</p>
        <p className="mt-1 text-xs text-slate-500">Try changing the search or status filter.</p>
      </div>
    );
  } else {
    notesContent = (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Title</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Book</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Uploader</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {visibleNotes.map((note) => (
              <tr key={note.id} className="transition hover:bg-sky-50/40">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900">{note.title}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{note.file_name}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">{note.book?.title || '-'}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{note.uploader?.name || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${note.approved ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                    {note.approved ? (
                      <>
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approved
                      </>
                    ) : (
                      <>
                        <Clock3 className="mr-1 h-3.5 w-3.5" /> Pending
                      </>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {note.file_url && (
                      <a
                        href={getNoteUrl(note.file_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Open
                      </a>
                    )}
                    <button
                      onClick={() => updateStatus(note.id, true)}
                      disabled={savingId === note.id || note.approved}
                      className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(note.id, false)}
                      disabled={savingId === note.id || !note.approved}
                      className="inline-flex items-center rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      disabled={savingId === note.id}
                      className="inline-flex items-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 pb-6">
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-sky-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-100">
                Note Moderation Command
              </p>
              <h1 className="text-3xl font-bold sm:text-4xl">Manage Notes</h1>
              <p className="mt-2 text-sm text-slate-200">Moderate uploaded study notes and control approval flow.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={fetchNotes}
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </button>
              <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white">
                Total: {notes.length}
              </div>
              <div className="rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-2.5 text-sm font-semibold text-emerald-100">
                Approved: {approvedCount}
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="flex items-center rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
            <ShieldAlert className="mr-2 h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="notes-search" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Search
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="notes-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Title, book, uploader..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-all focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes-status" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </label>
              <select
                id="notes-status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              >
                <option value="all">All Notes</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {notesContent}
        </section>
      </div>
    </AdminLayout>
  );
};

export default ManageNotes;
