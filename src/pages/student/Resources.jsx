import { useEffect, useMemo, useState } from 'react';
import {
  Download,
  ExternalLink,
  Eye,
  Library,
  Search,
  X
} from 'lucide-react';
import StudentLayout from '../../components/StudentLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../utils/api';

const RESOURCE_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'research_paper', label: 'Research Paper' },
  { value: 'ebook', label: 'eBook' },
  { value: 'journal', label: 'Journal' },
  { value: 'thesis', label: 'Thesis' },
  { value: 'lecture_notes', label: 'Lecture Notes' },
  { value: 'faculty_publication', label: 'Faculty Publication' }
];

const ACCESS_TABS = [
  { value: 'all', label: 'All Resources' },
  { value: 'open_access', label: 'Open Access Resources' },
  { value: 'subscribed', label: 'Subscribed Resources' },
  { value: 'university_repository', label: 'University Repository' }
];

const accessLabelMap = {
  open_access: 'Open Access',
  subscribed: 'Subscribed',
  university_repository: 'University Repository'
};

const accessToneMap = {
  open_access: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  subscribed: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  university_repository: 'border-emerald-200 bg-emerald-50 text-emerald-700'
};

const typeLabel = (value) => RESOURCE_TYPES.find((item) => item.value === value)?.label || value;

const Resources = () => {
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [resourceType, setResourceType] = useState('all');
  const [accessType, setAccessType] = useState('all');
  const [selectedResource, setSelectedResource] = useState(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await api.get('/resources', {
        params: {
          limit: 100
        }
      });
      setResources(response.data.data.resources || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      const firstValidationError = error.response?.data?.errors?.[0]?.message;
      alert(firstValidationError || error.response?.data?.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch =
        !search ||
        resource.title.toLowerCase().includes(search.toLowerCase()) ||
        resource.author_source.toLowerCase().includes(search.toLowerCase()) ||
        (resource.description || '').toLowerCase().includes(search.toLowerCase());

      const matchesType = resourceType === 'all' || resource.resource_type === resourceType;
      const matchesAccess = accessType === 'all' || resource.access_type === accessType;

      return matchesSearch && matchesType && matchesAccess;
    });
  }, [resources, search, resourceType, accessType]);

  const groupedResources = useMemo(
    () => ({
      open_access: filteredResources.filter((item) => item.access_type === 'open_access'),
      subscribed: filteredResources.filter((item) => item.access_type === 'subscribed'),
      university_repository: filteredResources.filter(
        (item) => item.access_type === 'university_repository'
      )
    }),
    [filteredResources]
  );

  const trackResourceAccess = async (resourceId) => {
    try {
      await api.post(`/resources/${resourceId}/track-access`);
      setResources((prev) =>
        prev.map((resource) =>
          resource.id === resourceId
            ? { ...resource, access_count: (resource.access_count || 0) + 1 }
            : resource
        )
      );
    } catch (error) {
      console.error('Failed to track resource access:', error);
    }
  };

  const totalDownloadsReady = useMemo(
    () => filteredResources.filter((item) => item.file_url || item.external_link).length,
    [filteredResources]
  );

  const getFileUrl = (filePath) => {
    const apiRoot = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
    return `${apiRoot}${filePath}`;
  };

  const renderResourceCard = (resource) => (
    <article
      key={resource.id}
      className="deck-panel deck-hover rounded-2xl border border-slate-200 bg-white p-4 transition"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${accessToneMap[resource.access_type]}`}>
          {accessLabelMap[resource.access_type]}
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {typeLabel(resource.resource_type)}
        </span>
      </div>

      <h3 className="mt-3 text-lg font-semibold text-slate-900">{resource.title}</h3>
      <p className="mt-1 text-sm text-slate-600">{resource.author_source}</p>
      {resource.material_type && (
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
          Material: {resource.material_type.replace(/_/g, ' ')}
        </p>
      )}
      <p className="mt-2 line-clamp-2 text-sm text-slate-500">{resource.description || 'No description available.'}</p>
      <p className="mt-1 text-xs text-slate-500">Accesses: {resource.access_count || 0}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            trackResourceAccess(resource.id);
            setSelectedResource(resource);
          }}
          className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <Eye className="mr-1.5 h-4 w-4" />
          View
        </button>
        {resource.file_url && (
          <a
            onClick={() => trackResourceAccess(resource.id)}
            href={getFileUrl(resource.file_url)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
          >
            <Download className="mr-1.5 h-4 w-4" />
            Download
          </a>
        )}
        {resource.external_link && (
          <a
            onClick={() => trackResourceAccess(resource.id)}
            href={resource.external_link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
          >
            <ExternalLink className="mr-1.5 h-4 w-4" />
            Open Link
          </a>
        )}
      </div>
    </article>
  );

  return (
    <StudentLayout>
      <div className="space-y-6">
        <section className="deck-hero dashboard-reveal overflow-hidden rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200">
                Digital Library
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-white">Resources</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-200">
                Access academic materials from open repositories, subscribed journals, and university
                internal publications without borrowing workflows.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/20 bg-white/10 p-3">
                <p className="text-xs text-slate-300">Visible</p>
                <p className="text-2xl font-semibold text-white">{filteredResources.length}</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-3">
                <p className="text-xs text-slate-300">Ready</p>
                <p className="text-2xl font-semibold text-white">{totalDownloadsReady}</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-3">
                <p className="text-xs text-slate-300">Categories</p>
                <p className="text-2xl font-semibold text-white">3</p>
              </div>
            </div>
          </div>
        </section>

        <section className="deck-panel dashboard-reveal dashboard-delay-2 rounded-2xl p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Search Resources
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="input pl-9"
                  placeholder="Title, source, or description"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Access
              </label>
              <select className="input" value={accessType} onChange={(e) => setAccessType(e.target.value)}>
                {ACCESS_TABS.map((tab) => (
                  <option key={tab.value} value={tab.value}>
                    {tab.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Type
              </label>
              <select
                className="input"
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
              >
                {RESOURCE_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {loading ? (
          <section className="deck-panel rounded-2xl p-6">
            <LoadingSpinner size="md" className="py-12" />
          </section>
        ) : filteredResources.length === 0 ? (
          <section className="deck-panel rounded-2xl p-8 text-center">
            <Library className="mx-auto h-14 w-14 text-slate-400" />
            <h2 className="mt-3 text-xl font-semibold text-slate-800">No resources found</h2>
            <p className="mt-1 text-sm text-slate-500">
              Try a different keyword or filter to explore available resources.
            </p>
          </section>
        ) : (
          <section className="space-y-6">
            {Object.entries(groupedResources).map(([key, items], index) => {
              if (items.length === 0) return null;

              return (
                <div key={key} className={`deck-panel rounded-2xl p-4 sm:p-5 dashboard-reveal dashboard-delay-${Math.min(index + 2, 5)}`}>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-900">{accessLabelMap[key]}</h2>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${accessToneMap[key]}`}>
                      {items.length} item{items.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {items.map(renderResourceCard)}
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>

      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${accessToneMap[selectedResource.access_type]}`}>
                    {accessLabelMap[selectedResource.access_type]}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {typeLabel(selectedResource.resource_type)}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{selectedResource.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{selectedResource.author_source}</p>
              </div>
              <button
                onClick={() => setSelectedResource(null)}
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {selectedResource.department && (
                <p>
                  <span className="font-semibold text-slate-800">Department:</span> {selectedResource.department}
                </p>
              )}
              <p>
                <span className="font-semibold text-slate-800">Description:</span>{' '}
                {selectedResource.description || 'No description provided.'}
              </p>
              {selectedResource.creator && (
                <p>
                  <span className="font-semibold text-slate-800">Uploaded By:</span> {selectedResource.creator.name}
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
              {selectedResource.file_url && (
                <a
                  href={getFileUrl(selectedResource.file_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
                >
                  <Download className="mr-1.5 h-4 w-4" />
                  Download File
                </a>
              )}
              {selectedResource.external_link && (
                <a
                  href={selectedResource.external_link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                >
                  <ExternalLink className="mr-1.5 h-4 w-4" />
                  Open External Link
                </a>
              )}
              <button
                onClick={() => setSelectedResource(null)}
                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default Resources;
