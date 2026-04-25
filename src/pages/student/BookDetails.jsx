import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { BookOpen, Calendar, FileText, Upload, Download, CheckCircle, ArrowLeft, Sparkles } from 'lucide-react';
import api from '../../utils/api';

const coverFallback =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' fill='%236b7280' font-size='20' font-family='Arial, sans-serif' text-anchor='middle' dominant-baseline='middle'>No Cover</text></svg>";

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    file: null
  });

  useEffect(() => {
    fetchBookDetails();
    fetchNotes();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      const response = await api.get(`/books/${id}`);
      setBook(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching book:', error);
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await api.get(`/notes/book/${id}`);
      setNotes(response.data.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleBorrow = async () => {
    if (!window.confirm('Do you want to borrow this book?')) return;

    setBorrowing(true);
    try {
      await api.post('/borrow', { book_id: parseInt(id) });
      alert('Book borrowed successfully!');
      fetchBookDetails(); // Refresh availability
      navigate('/student/my-borrows');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to borrow book');
    }
    setBorrowing(false);
  };

  const handleUploadNote = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', uploadForm.title);
    formData.append('book_id', id);
    formData.append('file', uploadForm.file);

    try {
      await api.post('/notes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Note uploaded successfully! Awaiting admin approval.');
      setShowUploadModal(false);
      setUploadForm({ title: '', file: null });
      fetchNotes();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to upload note');
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <LoadingSpinner size="lg" className="min-h-screen" />
      </StudentLayout>
    );
  }

  if (!book) {
    return (
      <StudentLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Book not found</p>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to books
        </button>

        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-primary-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                <Sparkles className="h-3.5 w-3.5" />
                Book Intelligence
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{book.title}</h1>
              <p className="mt-1 text-slate-300">by {book.author}</p>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
              <p className="text-xs text-slate-300">Availability</p>
              <p className="text-2xl font-bold text-emerald-200">{book.available_copies}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="aspect-[3/4] overflow-hidden rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              {book.cover_image ? (
                <img
                  src={book.cover_image}
                  alt={book.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = coverFallback;
                  }}
                />
              ) : (
                <BookOpen className="h-24 w-24 text-primary-600" />
              )}
            </div>

            <div className="space-y-5 md:col-span-2">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Publication</p>
                  <p className="mt-1 flex items-center text-sm font-semibold text-slate-700">
                    <Calendar className="mr-2 h-4 w-4" />
                    {book.publication_year || 'N/A'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Category</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">{book.category?.name || 'General'}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">ISBN</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">{book.isbn || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Total Copies</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{book.total_copies}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Available</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-600">{book.available_copies}</p>
                </div>
              </div>

              {book.description && (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h3 className="mb-2 text-sm font-semibold text-slate-900">Description</h3>
                  <p className="text-sm text-slate-600">{book.description}</p>
                </div>
              )}

              <button
                onClick={handleBorrow}
                disabled={book.available_copies === 0 || borrowing}
                className="inline-flex items-center rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {borrowing ? 'Borrowing...' : book.available_copies > 0 ? 'Borrow Book' : 'Not Available'}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold text-slate-900">Study Notes</h2>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-sm font-semibold text-primary-700 transition hover:bg-primary-100"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Note
            </button>
          </div>

          {notes.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-slate-500">
              No approved notes available yet
            </p>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-white sm:flex-row sm:items-center"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{note.title}</h3>
                    <p className="text-sm text-slate-500">
                      Uploaded by {note.uploader?.name} on {new Date(note.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                  <a
                    href={`http://localhost:5000${note.file_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Study Note"
      >
        <form onSubmit={handleUploadNote} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Note Title
            </label>
            <input
              type="text"
              required
              className="input"
              placeholder="e.g., Chapter 1 Summary"
              value={uploadForm.title}
              onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              PDF File
            </label>
            <input
              type="file"
              required
              accept=".pdf"
              className="input"
              onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
            />
            <p className="mt-1 text-xs text-gray-500">Only PDF files (max 5MB)</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowUploadModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Upload
            </button>
          </div>
        </form>
      </Modal>
    </StudentLayout>
  );
};

export default BookDetails;
