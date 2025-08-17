import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const Gallery = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  const loadAlbums = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/gallery/albums');
      setAlbums(res.data?.data || []);
    } catch (e) {
      console.error('Failed to load albums', e);
      setError('Failed to load albums');
    } finally {
      setLoading(false);
    }
  };

  const loadAlbumDetails = async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/gallery/albums/${id}`);
      setSelectedAlbum(res.data?.data || null);
    } catch (e) {
      console.error('Failed to load album details', e);
      setError('Failed to load album details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlbums();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Gallery</h1>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {/* Albums list view */}
        {!selectedAlbum && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {albums.map((a) => {
              const base = (axiosInstance.defaults.baseURL?.replace(/\/api$/, '') || '');
              const coverId = a.coverPhotoFileId || a.photos?.[0]?.fileId;
              return (
                <button
                  key={a._id}
                  className="text-left bg-white rounded-xl shadow overflow-hidden hover:shadow-md transition"
                  onClick={() => loadAlbumDetails(a._id)}
                >
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    {coverId ? (
                      <img
                        src={`${base}/api/gallery/photo/${coverId}`}
                        alt={a.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">{a.title}</h3>
                    {a.description ? (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{a.description}</p>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Album detail view */}
        {selectedAlbum && (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedAlbum(null)}
              className="px-3 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              ← Back to albums
            </button>
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="text-2xl font-semibold text-gray-900">{selectedAlbum.title}</h2>
                {selectedAlbum.description ? (
                  <p className="text-sm text-gray-600 mt-1">{selectedAlbum.description}</p>
                ) : null}
              </div>
              {(selectedAlbum.photos && selectedAlbum.photos.length > 0) ? (
                <div className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {selectedAlbum.photos.map((p) => {
                      const base = (axiosInstance.defaults.baseURL?.replace(/\/api$/, '') || '');
                      return (
                        <div key={p._id} className="aspect-square bg-gray-100 rounded overflow-hidden">
                          <img src={`${base}/api/gallery/photo/${p.fileId}`} alt={p.caption || 'photo'} className="w-full h-full object-cover" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 text-gray-500">No photos yet.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
