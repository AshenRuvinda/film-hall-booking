// frontend/src/pages/admin/ManageShowtimes.js - ENHANCED VERSION
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

function ManageShowtimes() {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    movieId: '',
    hallId: '',
    startTime: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [showtimesRes, moviesRes, hallsRes] = await Promise.all([
        api.get('/admin/showtimes'),
        api.get('/user/movies'),
        api.get('/admin/halls')
      ]);
      
      setShowtimes(showtimesRes.data);
      setMovies(moviesRes.data);
      setHalls(hallsRes.data);
    } catch (error) {
      setError('Failed to fetch data');
      console.error('Fetch data error:', error);
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
    
    if (!form.movieId || !form.hallId || !form.startTime) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/admin/showtimes', form);
      setSuccess('Showtime created successfully!');
      setForm({ movieId: '', hallId: '', startTime: '' });
      fetchData();
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to create showtime');
      console.error('Create showtime error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Showtimes</h2>
      
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
        <h3 className="text-lg font-semibold mb-4">Add New Showtime</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Movie *</label>
            <select
              name="movieId"
              value={form.movieId}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a movie</option>
              {movies.map((movie) => (
                <option key={movie._id} value={movie._id}>
                  {movie.title} ({movie.duration} min)
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hall *</label>
            <select
              name="hallId"
              value={form.hallId}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a hall</option>
              {halls.map((hall) => (
                <option key={hall._id} value={hall._id}>
                  {hall.name} ({hall.totalSeats} seats)
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
            <input
              type="datetime-local"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Add Showtime'}
        </button>
      </form>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h3 className="text-lg font-semibold p-4 border-b">Existing Showtimes</h3>
        {showtimes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Movie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hall</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {showtimes.map((showtime) => (
                  <tr key={showtime._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {showtime.movieId?.title || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {showtime.hallId?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(showtime.startTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(showtime.endTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No showtimes found. Add your first showtime above!
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageShowtimes;