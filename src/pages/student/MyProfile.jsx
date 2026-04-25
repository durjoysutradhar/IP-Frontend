import { useState, useEffect } from 'react';
import StudentLayout from '../../components/StudentLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { User, Mail, BookOpen, Phone, Hash, Building2, Edit2, Save, X } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const MyProfile = () => {
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    student_id: '',
    phone: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    student_id: '',
    phone: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/profile/me');
      const data = response.data.data;
      setProfile(data);
      setFormData({
        name: data.name || '',
        department: data.department || '',
        student_id: data.student_id || '',
        phone: data.phone || ''
      });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put('/users/profile/me', formData);
      setProfile(response.data.data);
      setSuccess('Profile updated successfully!');
      setEditing(false);
      
      // Update auth context with new user data
      if (updateUser) {
        updateUser(response.data.data);
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name || '',
      department: profile.department || '',
      student_id: profile.student_id || '',
      phone: profile.phone || ''
    });
    setEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <StudentLayout>
        <LoadingSpinner size="lg" className="min-h-screen" />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-primary-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
                {' '}
                Profile Sync Active
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">My Profile</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
                Review and update your academic account details securely.
              </p>
            </div>

            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>
        </section>

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
            {success}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-100">
                  <User className="h-12 w-12 text-primary-600" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    <User className="mr-2 inline h-4 w-4" />
                    Full Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  ) : (
                    <p className="rounded-lg bg-slate-50 px-3 py-2 text-slate-900">
                      {profile.name || 'Not set'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    <Mail className="mr-2 inline h-4 w-4" />
                    Email Address
                  </label>
                  <p className="rounded-lg bg-slate-50 px-3 py-2 text-slate-900">
                    {profile.email}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    <Hash className="mr-2 inline h-4 w-4" />
                    Student ID
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter your student ID"
                    />
                  ) : (
                    <p className="rounded-lg bg-slate-50 px-3 py-2 text-slate-900">
                      {profile.student_id || 'Not set'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    <Building2 className="mr-2 inline h-4 w-4" />
                    Department
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Computer Science"
                    />
                  ) : (
                    <p className="rounded-lg bg-slate-50 px-3 py-2 text-slate-900">
                      {profile.department || 'Not set'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    <Phone className="mr-2 inline h-4 w-4" />
                    Phone Number
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className="rounded-lg bg-slate-50 px-3 py-2 text-slate-900">
                      {profile.phone || 'Not set'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    <BookOpen className="mr-2 inline h-4 w-4" />
                    Role
                  </label>
                  <p className="rounded-lg bg-slate-50 px-3 py-2 capitalize text-slate-900">
                    {profile.role}
                  </p>
                </div>
              </div>

              {editing && (
                <div className="flex justify-end space-x-3 border-t border-slate-200 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    disabled={saving}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Account Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 py-2">
              <span className="text-slate-600">Account Type:</span>
              <span className="font-medium capitalize text-slate-900">{profile.role}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-2">
              <span className="text-slate-600">Member Since:</span>
              <span className="font-medium text-slate-900">
                {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-600">Last Updated:</span>
              <span className="font-medium text-slate-900">
                {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </section>
      </div>
    </StudentLayout>
  );
};

export default MyProfile;
