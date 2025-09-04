// frontend/src/pages/admin/ManageHalls.js - ENHANCED VERSION
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

function ManageHalls() {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    name: '',
    totalSeats: ''
  });

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      const res = await api.get('/admin/halls');
      setHalls(res.data);
    } catch (error) {
      setError('Failed to fetch halls');
      console.error('Fetch halls error:', error);
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
    
    if (!form.name || !form.totalSeats) {
      setError('All fields are required');
      return;
    }

    if (form.totalSeats < 1 || form.totalSeats > 500) {
      setError('Total seats must be between 1 and 500');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/admin/halls', {
        name: form.name.trim(),
        totalSeats: parseInt(form.totalSeats)
      });
      
      setSuccess('Hall created successfully!');
      setForm({ name: '', totalSeats: '' });
      fetchHalls();
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to create hall');
      console.error('Create hall error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Halls</h2>
      
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
        <h3 className="text-lg font-semibold mb-4">Add New Hall</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hall Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g., Hall A, Premium Theater 1"
              className="w-full p-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Seats *</label>
            <input
              type="number"
              name="totalSeats"
              value={form.totalSeats}
              onChange={handleChange}
              placeholder="e.g., 50"
              min="1"
              max="500"
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
          {loading ? 'Creating...' : 'Add Hall'}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {halls.map((hall) => (
          <div key={hall._id} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-2">{hall.name}</h3>
            <p className="text-gray-600 mb-2">Total Seats: {hall.totalSeats}</p>
            <p className="text-sm text-gray-500">
              Created: {new Date(hall.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
      
      {halls.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No halls found. Add your first hall above!
        </div>
      )}
    </div>
  );
}

export default ManageHalls;