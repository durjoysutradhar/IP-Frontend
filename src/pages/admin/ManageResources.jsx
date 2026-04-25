import { useEffect, useMemo, useState } from 'react';
import {
  Edit3,
  ExternalLink,
  FileDown,
  Plus,
  Save,
  Search,
  Trash2,
  X
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../utils/api';

const RESOURCE_TYPES = [
  { value: 'research_paper', label: 'Research Paper' },
  { value: 'ebook', label: 'eBook' },
  { value: 'journal', label: 'Journal' },
  { value: 'thesis', label: 'Thesis' },
  { value: 'lecture_notes', label: 'Lecture Notes' },
  { value: 'faculty_publication', label: 'Faculty Publication' }
];

const ACCESS_TYPES = [
  { value: 'open_access', label: 'Open Access' },
  { value: 'subscribed', label: 'Subscribed' },
  { value: 'university_repository', label: 'University Repository' }
];

const INITIAL_FORM = {
  title: '',
  author_source: '',
  resource_type: 'research_paper',
  access_type: 'open_access',
  department: '',
  description: '',
  external_link: '',
  file: null,
  is_active: true
};

const getAccessBadgeClass = (accessType) => {
  if (accessType === 'subscribed') return 'border-indigo-200 bg-indigo-50 text-indigo-700';
  if (accessType === 'university_repository') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  return 'border-cyan-200 bg-cyan-50 text-cyan-700';
};

const accessLabel = (value) => ACCESS_TYPES.find((item) => item.value === value)?.label || value;
const typeLabel = (value) => RESOURCE_TYPES.find((item) => item.value === value)?.label || value;

const ManageResources = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [accessType, setAccessType] = useState('all');
  const [resourceType, setResourceType] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await api.get('/resources', {
        params: {
          limit: 100,
          search: search || undefined,
          accessType: accessType !== 'all' ? accessType : undefined,
          resourceType: resourceType !== 'all' ? resourceType : undefined
        }
      });
      setResources(response.data.data.resources || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      alert(error.response?.data?.message || 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingResource(null);
    setForm(INITIAL_FORM);
    setModalOpen(true);
  };

  const openEditModal = (resource) => {
    setEditingResource(resource);
    setForm({
      title: resource.title || '',
      author_source: resource.author_source || '',
      resource_type: resource.resource_type || 'research_paper',
      access_type: resource.access_type || 'open_access',
      department: resource.department || '',
      description: resource.description || '',
      external_link: resource.external_link || '',
      file: null,
      is_active: Boolean(resource.is_active)
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingResource(null);
    setForm(INITIAL_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.file && !form.external_link.trim() && !editingResource?.file_url) {
      alert('Please provide either a file upload or an external link.');
      return;
    }

    try {
      setSaving(true);
      const payload = new FormData();
      payload.append('title', form.title);
      payload.append('author_source', form.author_source);
      payload.append('resource_type', form.resource_type);
      payload.append('access_type', form.access_type);
      payload.append('department', form.department);
      payload.append('description', form.description);
      payload.append('external_link', form.external_link);
      payload.append('is_active', String(form.is_active));
      if (form.file) {
        payload.append('file', form.file);
      }

      if (editingResource) {
        await api.put(`/resources/${editingResource.id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/resources', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      closeModal();
      fetchResources();
    } catch (error) {
      console.error('Error saving resource:', error);
      alert(error.response?.data?.message || 'Failed to save resource');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;

    try {
      await api.delete(`/resources/${resourceId}`);
      fetchResources();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete resource');
    }
  };

  const activeCount = useMemo(() => resources.filter((item) => item.is_active).length, [resources]);
  const groupedCount = useMemo(
    () => ({
      open_access: resources.filter((item) => item.access_type === 'open_access').length,
      subscribed: resources.filter((item) => item.access_type === 'subscribed').length,
      university_repository: resources.filter((item) => item.access_type === 'university_repository').length
    }),
    [resources]
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="deck-hero dashboard-reveal overflow-hidden rounded-3xl p-6 sm:p-8">
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200">
                Digital Library Administration
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-white">Manage Resources</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-200">
                Add, organize, and control digital academic content across Open Access, Subscribed,
                and University Repository collections.
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center rounded-xl border border-cyan-200/35 bg-cyan-300/20 px-4 py-2.5 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/30"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Resource
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-white/20 bg-white/10 p-3">
              <p className="text-xs text-slate-300">Total</p>
              <p className="text-2xl font-semibold text-white">{resources.length}</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-3">
              <p className="text-xs text-slate-300">Active</p>
              <p className="text-2xl font-semibold text-white">{activeCount}</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-3">
              <p className="text-xs text-slate-300">Open Access</p>
              <p className="text-2xl font-semibold text-white">{groupedCount.open_access}</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-3">
              <p className="text-xs text-slate-300">Repository</p>
              <p className="text-2xl font-semibold text-white">{groupedCount.university_repository}</p>
            </div>
          </div>
        </section>

        <section className="deck-panel dashboard-reveal dashboard-delay-2 rounded-2xl p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Search
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Title, source, description"
                  className="input pl-9"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Access Type
              </label>
              <select
                value={accessType}
                onChange={(e) => setAccessType(e.target.value)}
                className="input"
              >
                <option value="all">All</option>
                {ACCESS_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Resource Type
              </label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                className="input"
              >
                <option value="all">All</option>
                {RESOURCE_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <button onClick={fetchResources} className="btn-primary text-sm">
              Apply Filters
            </button>
          </div>
        </section>

        <section className="deck-panel dashboard-reveal dashboard-delay-3 rounded-2xl p-4 sm:p-5">
          {loading ? (
            <LoadingSpinner size="md" className="py-12" />
          ) : resources.length === 0 ? (
            <p className="py-10 text-center text-slate-500">No resources found.</p>
          ) : (
            <div className="space-y-3">
              {resources.map((resource) => (
                <article
                  key={resource.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-900">{resource.title}</h3>
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getAccessBadgeClass(resource.access_type)}`}>
                          {accessLabel(resource.access_type)}
                        </span>
                        {!resource.is_active && (
                          <span className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">
                        {typeLabel(resource.resource_type)} • {resource.author_source}
                        {resource.department ? ` • ${resource.department}` : ''}
                      </p>
                      <p className="text-sm text-slate-500">{resource.description || 'No description provided.'}</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {resource.file_url && (
                          <a
                            href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}${resource.file_url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <FileDown className="mr-1.5 h-3.5 w-3.5" />
                            File
                          </a>
                        )}
                        {resource.external_link && (
                          <a
                            href={resource.external_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-100"
                          >
                            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                            External Link
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => openEditModal(resource)}
                        className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Edit3 className="mr-1.5 h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(resource.id)}
                        className="inline-flex items-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        <Trash2 className="mr-1.5 h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingResource ? 'Edit Resource' : 'Add New Resource'}
              </h2>
              <button onClick={closeModal} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">Resource Title</label>
                  <input
                    required
                    className="input"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Author / Source</label>
                  <input
                    required
                    className="input"
                    value={form.author_source}
                    onChange={(e) => setForm((prev) => ({ ...prev, author_source: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Department (Optional)</label>
                  <input
                    className="input"
                    value={form.department}
                    onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Resource Type</label>
                  <select
                    className="input"
                    value={form.resource_type}
                    onChange={(e) => setForm((prev) => ({ ...prev, resource_type: e.target.value }))}
                  >
                    {RESOURCE_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Access Type</label>
                  <select
                    className="input"
                    value={form.access_type}
                    onChange={(e) => setForm((prev) => ({ ...prev, access_type: e.target.value }))}
                  >
                    {ACCESS_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    rows={3}
                    className="input"
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">External Link</label>
                  <input
                    type="url"
                    className="input"
                    placeholder="https://..."
                    value={form.external_link}
                    onChange={(e) => setForm((prev) => ({ ...prev, external_link: e.target.value }))}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">File Upload</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                    onChange={(e) => setForm((prev) => ({ ...prev, file: e.target.files?.[0] || null }))}
                    className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Upload a file or provide an external link.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                    />
                    Keep this resource active for student access
                  </label>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary inline-flex items-center justify-center">
                  <Save className="mr-1.5 h-4 w-4" />
                  {saving ? 'Saving...' : editingResource ? 'Update Resource' : 'Create Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageResources;
