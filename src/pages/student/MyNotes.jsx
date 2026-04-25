import { useState, useEffect } from 'react';
import StudentLayout from '../../components/StudentLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FileText, Download, Trash2, Clock, CheckCircle, Activity } from 'lucide-react';
import api from '../../utils/api';

const apiRoot = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || window.location.origin;

const MyNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyNotes();
  }, []);

  const fetchMyNotes = async () => {
    try {
      const response = await api.get('/notes/my-notes');
      setNotes(response.data.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
    setLoading(false);
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await api.delete(`/notes/${noteId}`);
      alert('Note deleted successfully');
      fetchMyNotes();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete note');
    }
  };

  const approvedCount = notes.filter((note) => note.approved).length;
  const pendingCount = notes.filter((note) => !note.approved).length;

  return (
    <StudentLayout>
      <div className="space-y-6 sm:space-y-8">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-primary-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
                Notes Workflow Live
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">My Notes</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
                Manage your uploaded study notes and track approval status professionally.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2">
                <p className="text-xs text-slate-300">Total</p>
                <p className="text-xl font-bold">{notes.length}</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2">
                <p className="text-xs text-slate-300">Approved</p>
                <p className="text-xl font-bold text-emerald-200">{approvedCount}</p>
              </div>
              <div className="col-span-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 sm:col-span-1">
                <p className="text-xs text-slate-300">Pending</p>
                <p className="text-xl font-bold text-amber-200">{pendingCount}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {loading ? (
            <LoadingSpinner size="md" className="py-12" />
          ) : notes.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <FileText className="mx-auto mb-4 h-16 w-16 text-slate-400" />
              <p>You haven't uploaded any notes yet</p>
              <p className="mt-2 text-sm">Upload notes from book details pages</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="group flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:border-primary-200 hover:bg-white hover:shadow-md sm:flex-row sm:items-center"
                >
                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-3">
                      <h3 className="font-semibold text-slate-900">{note.title}</h3>
                      {note.approved ? (
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          <Clock className="mr-1 h-3 w-3" />
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">Book: {note.book?.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Uploaded on {new Date(note.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={`${apiRoot}${note.file_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </a>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="inline-flex items-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </StudentLayout>
  );
};

export default MyNotes;
