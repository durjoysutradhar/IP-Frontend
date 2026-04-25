import { useEffect, useMemo, useState } from 'react';
import {
  Edit3,
  ExternalLink,
  FileDown,
  FolderUp,
  Plus,
  Save,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import StudentLayout from '../../components/StudentLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../utils/api';

const MATERIAL_TYPES = [
  { value: 'lecture_notes', label: 'Lecture Notes' },
  { value: 'course_slides', label: 'Course Slides' },
  { value: 'lab_manual', label: 'Lab Manual' },
  { value: 'research_paper', label: 'Research Paper' },
  { value: 'study_guide', label: 'Study Guide' },
  { value: 'reading_material', label: 'Reading Material' }
];

const INITIAL_FORM = {
  title: '',
  department_or_course: '',
  material_type: 'lecture_notes',
  description: '',
  external_link: '',
  author_source: '',
  file: null,
  is_active: true
};

const UploadMaterials = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    fetchMyMaterials();
  }, []);

  const fetchMyMaterials = async () => {
    try {
      setLoading(true);
      const response = await api.get('/resources/teacher/my-materials', {
        params: { limit: 100 }
      });
      setMaterials(response.data.data.materials || []);
    } catch (error) {
      console.error('Error fetching teacher materials:', error);
      alert(error.response?.data?.message || 'Failed to load your materials');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingMaterial(null);
    setForm(INITIAL_FORM);
    setModalOpen(true);
  };

  const openEditModal = (material) => {
    setEditingMaterial(material);
    setForm({
      title: material.title || '',
      department_or_course: material.department || '',
      material_type: material.material_type || 'lecture_notes',
      description: material.description || '',
      external_link: material.external_link || '',
      author_source: material.author_source || '',
      file: null,
      is_active: Boolean(material.is_active)
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingMaterial(null);
    setForm(INITIAL_FORM);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.file && !form.external_link.trim() && !editingMaterial?.file_url) {
      alert('Please provide either a file upload or an external link.');
      return;
    }

    try {
      setSaving(true);
      const payload = new FormData();
      payload.append('title', form.title);
      payload.append('department_or_course', form.department_or_course);
      payload.append('material_type', form.material_type);
      payload.append('description', form.description);
      payload.append('external_link', form.external_link);
      payload.append('author_source', form.author_source);
      payload.append('is_active', String(form.is_active));
      if (form.file) {
        payload.append('file', form.file);
      }

      if (editingMaterial) {
        await api.put(`/resources/teacher/materials/${editingMaterial.id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/resources/teacher/materials', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      closeModal();
      fetchMyMaterials();
    } catch (error) {
      console.error('Error saving material:', error);
      alert(error.response?.data?.message || 'Failed to save material');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;

    try {
      await api.delete(`/resources/teacher/materials/${id}`);
      fetchMyMaterials();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete material');
    }
  };

  const activeCount = useMemo(() => materials.filter((item) => item.is_active).length, [materials]);

  const getResourceFileUrl = (fileUrl) => {
    const apiRoot = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
    return `${apiRoot}${fileUrl}`;
  };

  const getTypeLabel = (value) => MATERIAL_TYPES.find((item) => item.value === value)?.label || value;

  return (
    <StudentLayout>
      <div className="space-y-6">
        <section className="deck-hero dashboard-reveal overflow-hidden rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200">
                Teacher Contribution Hub
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-white">Upload Materials</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-200">
                Upload lecture notes and course resources for students. Your uploads are published
                directly under University Repository resources.
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center rounded-xl border border-cyan-200/35 bg-cyan-300/20 px-4 py-2.5 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/30"
            >
              <Plus className="mr-2 h-4 w-4" />
              Upload Material
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/20 bg-white/10 p-3">
              <p className="text-xs text-slate-300">Total Uploaded</p>
              <p className="text-2xl font-semibold text-white">{materials.length}</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-3">
              <p className="text-xs text-slate-300">Active</p>
              <p className="text-2xl font-semibold text-white">{activeCount}</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-3">
              <p className="text-xs text-slate-300">Total Accesses</p>
              <p className="text-2xl font-semibold text-white">
                {materials.reduce((sum, item) => sum + (item.access_count || 0), 0)}
              </p>
            </div>
          </div>
        </section>

        <section className="deck-panel dashboard-reveal dashboard-delay-2 rounded-2xl p-4 sm:p-5">
          {loading ? (
            <LoadingSpinner size="md" className="py-12" />
          ) : materials.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <FolderUp className="mx-auto mb-3 h-14 w-14 text-slate-400" />
              <h2 className="text-xl font-semibold text-slate-800">No materials uploaded yet</h2>
              <p className="mt-1 text-sm text-slate-500">Upload your first material to share with students.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {materials.map((material) => (
                <article
                  key={material.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-900">{material.title}</h3>
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          Published
                        </span>
                        {!material.is_active && (
                          <span className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">
                        {material.department || 'General'} • {getTypeLabel(material.material_type)}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{material.description || 'No description provided.'}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        Access count: <span className="font-semibold text-slate-700">{material.access_count || 0}</span>
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {material.file_url && (
                          <a
                            href={getResourceFileUrl(material.file_url)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <FileDown className="mr-1.5 h-3.5 w-3.5" />
                            File
                          </a>
                        )}
                        {material.external_link && (
                          <a
                            href={material.external_link}
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

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(material)}
                        className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Edit3 className="mr-1.5 h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(material.id)}
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
                {editingMaterial ? 'Edit Material' : 'Upload Material'}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
                  <input
                    required
                    className="input"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Department or Course</label>
                  <input
                    required
                    className="input"
                    value={form.department_or_course}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, department_or_course: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Material Type</label>
                  <select
                    className="input"
                    value={form.material_type}
                    onChange={(e) => setForm((prev) => ({ ...prev, material_type: e.target.value }))}
                  >
                    {MATERIAL_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">Author / Source (Optional)</label>
                  <input
                    className="input"
                    value={form.author_source}
                    onChange={(e) => setForm((prev) => ({ ...prev, author_source: e.target.value }))}
                  />
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
                  <p className="mt-1 text-xs text-slate-500">Upload file or provide external link.</p>
                </div>

                <div className="sm:col-span-2">
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                    />
                    Keep material active in Resources
                  </label>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary inline-flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <Upload className="mr-1.5 h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-1.5 h-4 w-4" />
                      {editingMaterial ? 'Update Material' : 'Upload Material'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default UploadMaterials;
