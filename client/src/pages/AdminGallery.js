import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaImages, FaCamera } from 'react-icons/fa';
import axiosInstance from '../api/axiosInstance';

const emptyForm = { title: '', description: '', cover: null };

const AdminGallery = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [addingPhoto, setAddingPhoto] = useState(false);
  const [newPhoto, setNewPhoto] = useState({ file: null, caption: '' });

  const base = (axiosInstance.defaults.baseURL?.replace(/\/api$/, '') || '');
  const photoUrl = (fileId) => `${base}/api/gallery/photo/${fileId}`;

  const loadAlbums = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/gallery/albums');
      setAlbums(res.data?.data || []);
    } catch (e) {
      console.error('Failed to load albums', e);
      toast.error('Failed to load albums');
    } finally {
      setLoading(false);
    }
  };

  const refreshSelected = async (id) => {
    try {
      const res = await axiosInstance.get(`/gallery/albums/${id}`);
      setSelectedAlbum(res.data?.data || null);
    } catch (e) {
      console.error('Failed to load album', e);
      toast.error('Failed to load album');
    }
  };

  useEffect(() => { loadAlbums(); }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const fd = new FormData();
      if (form.title) fd.append('title', form.title);
      if (form.description) fd.append('description', form.description);
      if (form.cover instanceof File) fd.append('photo', form.cover); // reuse uploadPhoto field

      if (editingId) {
        await axiosInstance.put(`/admin/gallery/albums/${editingId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Album updated');
      } else {
        await axiosInstance.post('/admin/gallery/albums', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Album created');
      }
      await loadAlbums();
      resetForm();
    } catch (e) {
      console.error('Save album failed', e);
      toast.error(e?.response?.data?.message || 'Failed to save album');
    } finally {
      setSaving(false);
    }
  };

  const onDeleteAlbum = async (id) => {
    if (!id) return;
    if (!window.confirm('Delete this album and all its photos?')) return;
    try {
      await axiosInstance.delete(`/admin/gallery/albums/${id}`);
      toast.success('Album deleted');
      if (selectedAlbum?._id === id) setSelectedAlbum(null);
      await loadAlbums();
    } catch (e) {
      console.error('Delete album failed', e);
      toast.error('Failed to delete album');
    }
  };

  const onAddPhoto = async (e) => {
    e.preventDefault();
    if (!selectedAlbum?._id || !(newPhoto.file instanceof File)) return;
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('photo', newPhoto.file);
      if (newPhoto.caption) fd.append('caption', newPhoto.caption);
      await axiosInstance.post(`/admin/gallery/albums/${selectedAlbum._id}/photos`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Photo added');
      setNewPhoto({ file: null, caption: '' });
      setAddingPhoto(false);
      await refreshSelected(selectedAlbum._id);
      await loadAlbums();
    } catch (e) {
      console.error('Add photo failed', e);
      toast.error('Failed to add photo');
    } finally {
      setSaving(false);
    }
  };

  const onDeletePhoto = async (photoId) => {
    if (!selectedAlbum?._id || !photoId) return;
    if (!window.confirm('Delete this photo?')) return;
    try {
      await axiosInstance.delete(`/admin/gallery/albums/${selectedAlbum._id}/photos/${photoId}`);
      toast.success('Photo deleted');
      await refreshSelected(selectedAlbum._id);
      await loadAlbums();
    } catch (e) {
      console.error('Delete photo failed', e);
      toast.error('Failed to delete photo');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
          <button
            onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm(true); }}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus /> New Album
          </button>
        </div>

        {/* Albums list and selected details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {albums.map((a) => (
                  <div key={a._id} className={`bg-white rounded-xl shadow overflow-hidden border ${selectedAlbum?._id === a._id ? 'border-blue-500' : 'border-transparent'}`}>
                    <button onClick={() => refreshSelected(a._id)} className="block w-full text-left">
                      <div className="aspect-video bg-gray-200 overflow-hidden">
                        {a.coverPhotoFileId || (a.photos && a.photos[0]) ? (
                          <img src={photoUrl(a.coverPhotoFileId || a.photos[0]?.fileId)} alt={a.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{a.title}</h3>
                          <span className="text-xs text-gray-500">{(a.photos?.length || 0)} photos</span>
                        </div>
                      </div>
                    </button>
                    <div className="px-3 pb-3 flex items-center justify-end gap-2">
                      <button onClick={() => { setEditingId(a._id); setForm({ title: a.title || '', description: a.description || '', cover: null }); setShowForm(true); }} className="text-blue-600 text-sm">Edit</button>
                      <button onClick={() => onDeleteAlbum(a._id)} className="text-red-600 text-sm">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-semibold mb-3 flex items-center gap-2"><FaImages /> Album Details</h2>
              {!selectedAlbum ? (
                <p className="text-sm text-gray-600">Select an album to manage its photos.</p>
              ) : (
                <div className="space-y-4">
                  <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                    {selectedAlbum.coverPhotoFileId || (selectedAlbum.photos && selectedAlbum.photos[0]) ? (
                      <img src={photoUrl(selectedAlbum.coverPhotoFileId || selectedAlbum.photos[0]?.fileId)} alt={selectedAlbum.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedAlbum.title}</h3>
                    {selectedAlbum.description ? <p className="text-sm text-gray-600 mt-1">{selectedAlbum.description}</p> : null}
                  </div>

                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Photos</h4>
                    <button onClick={() => setAddingPhoto(true)} className="text-blue-600 text-sm flex items-center gap-2"><FaCamera /> Add Photo</button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(selectedAlbum.photos || []).map((p) => (
                      <div key={p._id} className="relative group">
                        <img src={photoUrl(p.fileId)} alt={p.caption || 'photo'} className="w-full h-24 object-cover rounded" />
                        <button
                          onClick={() => onDeletePhoto(p._id)}
                          className="absolute top-1 right-1 hidden group-hover:block bg-red-600 text-white p-1 rounded"
                          title="Delete photo"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create / Edit Album Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Album' : 'New Album'}</h3>
              </div>
              <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cover Photo (optional)</label>
                  <label className="flex items-center gap-3 px-3 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <FaCamera className="text-gray-500" />
                    <span className="text-sm text-gray-600">{form.cover?.name || 'Choose an image (JPG/PNG, up to 5MB)'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setForm((f) => ({ ...f, cover: e.target.files?.[0] || null }))} />
                  </label>
                </div>
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700">Cancel</button>
                  <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">{saving ? 'Saving...' : (editingId ? 'Update' : 'Create')}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Photo Modal */}
        {addingPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Add Photo</h3>
              </div>
              <form onSubmit={onAddPhoto} className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
                  <label className="flex items-center gap-3 px-3 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <FaCamera className="text-gray-500" />
                    <span className="text-sm text-gray-600">{newPhoto.file?.name || 'Choose an image (JPG/PNG, up to 5MB)'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setNewPhoto((p) => ({ ...p, file: e.target.files?.[0] || null }))} />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Caption (optional)</label>
                  <input type="text" value={newPhoto.caption} onChange={(e) => setNewPhoto((p) => ({ ...p, caption: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button type="button" onClick={() => { setAddingPhoto(false); setNewPhoto({ file: null, caption: '' }); }} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700">Cancel</button>
                  <button type="submit" disabled={saving || !newPhoto.file} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">{saving ? 'Saving...' : 'Add'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGallery;
