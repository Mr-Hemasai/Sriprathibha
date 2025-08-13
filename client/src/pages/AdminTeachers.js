import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaCamera } from 'react-icons/fa';
import axiosInstance from '../api/axiosInstance';

const emptyForm = {
  name: '',
  degrees: '', // comma-separated in UI
  experience: '',
  subjects: '', // comma-separated in UI
  photo: null,
};

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  // Delete confirmation state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState({ id: null, name: '' });

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  };

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/public/teachers');
      setTeachers(res.data?.data || []);
    } catch (e) {
      console.error('Failed to load teachers', e);
      const msg = e?.message || 'Failed to load teachers';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      const fd = new FormData();
      if (form.name) fd.append('name', form.name);
      if (form.degrees) fd.append('degrees', form.degrees);
      if (form.experience !== '') fd.append('experience', form.experience);
      if (form.subjects) fd.append('subjects', form.subjects);
      if (form.photo instanceof File) fd.append('photo', form.photo);

      if (editingId) {
        await axiosInstance.put(`/admin/teachers/${editingId}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Teacher updated successfully');
      } else {
        await axiosInstance.post('/admin/teachers', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Teacher created successfully');
      }
      await loadTeachers();
      resetForm();
    } catch (e) {
      console.error('Save teacher failed', e);
      const msg = e.response?.data?.message || 'Failed to save teacher';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (t) => {
    setEditingId(t._id);
    setForm({
      name: t.name || '',
      degrees: (t.degrees || []).join(', '),
      experience: String(t.experience ?? ''),
      subjects: (t.subjects || []).join(', '),
      photo: null,
    });
    setShowForm(true);
  };

  const confirmDelete = (t) => {
    setConfirmTarget({ id: t._id, name: t.name || 'this teacher' });
    setConfirmOpen(true);
  };

  const onDelete = async () => {
    if (!confirmTarget.id) return;
    try {
      await axiosInstance.delete(`/admin/teachers/${confirmTarget.id}`);
      await loadTeachers();
      toast.success('Teacher deleted');
    } catch (e) {
      console.error('Delete teacher failed', e);
      const msg = e.response?.data?.message || 'Failed to delete teacher';
      setError(msg);
      toast.error(msg);
    } finally {
      setConfirmOpen(false);
      setConfirmTarget({ id: null, name: '' });
    }
  };

  const photoUrl = (t) =>
    t.photoFileId
      ? `${axiosInstance.defaults.baseURL?.replace(/\/api$/, '') || ''}/api/public/teachers/photo/${t.photoFileId}`
      : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <button
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            <FaPlus /> Add Teacher
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
        )}

        {/* List */}
        <div className="bg-white rounded-xl shadow border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Photo</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Degrees</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Experience</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Subjects</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : teachers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">No teachers found</td>
                  </tr>
                ) : (
                  teachers.map((t) => (
                    <tr key={t._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {photoUrl(t) ? (
                          <img src={photoUrl(t)} alt={t.name} className="h-12 w-12 rounded-full object-cover" />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-200" />)
                        }
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
                      <td className="px-4 py-3 text-gray-700">{(t.degrees || []).join(', ')}</td>
                      <td className="px-4 py-3 text-gray-700">{t.experience ?? 0} yrs</td>
                      <td className="px-4 py-3 text-gray-700">{(t.subjects || []).join(', ')}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => onEdit(t)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            onClick={() => confirmDelete(t)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200"
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-xl">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Teacher' : 'Add Teacher'}</h2>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <form onSubmit={onSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Degrees (comma separated)</label>
                    <input
                      type="text"
                      value={form.degrees}
                      onChange={(e) => setForm((f) => ({ ...f, degrees: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.experience}
                      onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subjects (comma separated)</label>
                  <input
                    type="text"
                    value={form.subjects}
                    onChange={(e) => setForm((f) => ({ ...f, subjects: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
                  <label className="flex items-center gap-3 px-3 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <FaCamera className="text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {form.photo?.name || 'Choose an image (JPG/PNG, up to 5MB)'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setForm((f) => ({ ...f, photo: e.target.files?.[0] || null }))}
                    />
                  </label>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700">Cancel</button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
              </div>
              <div className="px-6 py-5 space-y-3">
                <p className="text-gray-800 text-sm">
                  Do you want to delete the teacher profile
                  {confirmTarget.name ? (
                    <>
                      {' '}<span className="font-semibold">{confirmTarget.name}</span>{' '}
                    </>
                  ) : null}
                  ? This action cannot be undone.
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs text-red-600">Warning</span>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => { setConfirmOpen(false); setConfirmTarget({ id: null, name: '' }); }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  onClick={onDelete}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTeachers;
