// frontend/src/pages/admin/ManageMovies.js - ENHANCED VERSION
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

function ManageMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingMovie, setEditingMovie] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    poster: '',
    duration: '',
    genre: ''
  });

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await api.get('/user/movies');
      setMovies(res.data);
    } catch (error) {
      setError('Failed to fetch movies');
      console.error('Fetch movies error:', error);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingMovie) {
        await api.put(`/admin/movies/${editingMovie._id}`, form);
        setSuccess('Movie updated successfully!');
      } else {
        await api.post('/admin/movies', form);
        setSuccess('Movie added successfully!');
      }
      
      resetForm();
      fetchMovies();
    } catch (error) {
      setError(error.response?.data?.msg || 'Operation failed');
      console.error('Movie operation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setForm({
      title: movie.title,
      description: movie.description || '',
      poster: movie.poster || '',
      duration: movie.duration || '',
      genre: movie.genre || ''
    });
  };

  const handleDelete = async (movieId) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) {
      return;
    }

    try {
      await api.delete(`/admin/movies/${movieId}`);
      setSuccess('Movie deleted successfully!');
      fetchMovies();
    } catch (error) {
      setError(error.response?.data?.msg || 'Delete failed');
      console.error('Delete movie error:', error);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      poster: '',
      duration: '',
      genre: ''
    });
    setEditingMovie(null);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Movies</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold mb-4">
          {editingMovie ? 'Edit Movie' : 'Add New Movie'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Movie Title"
              className="w-full p-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
            <input
              type="text"
              name="genre"
              value={form.genre}
              onChange={handleChange}
              placeholder="e.g., Action, Comedy, Drama"
              className="w-full p-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
            <input
              type="number"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              placeholder="120"
              min="1"
              className="w-full p-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Poster URL</label>
            <input
              type="url"
              name="poster"
              value={form.poster}
              onChange={handleChange}
              placeholder="https://example.com/poster.jpg"
              className="w-full p-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Movie description..."
            rows="3"
            className="w-full p-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (editingMovie ? 'Update Movie' : 'Add Movie')}
          </button>
          
          {editingMovie && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {movies.map((movie) => (
          <div key={movie._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {movie.poster && (
              <img 
                src={movie.poster} 
                alt={movie.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <div className="p-4">
              <h3 className="text-lg font-bold mb-2">{movie.title}</h3>
              <p className="text-sm text-gray-600 mb-1">Genre: {movie.genre || 'N/A'}</p>
              <p className="text-sm text-gray-600 mb-3">Duration: {movie.duration} minutes</p>
              {movie.description && (
                <p className="text-sm text-gray-700 mb-4 line-clamp-3">{movie.description}</p>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(movie)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(movie._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {movies.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No movies found. Add your first movie above!
        </div>
      )}
    </div>
  );
}

export default ManageMovies;