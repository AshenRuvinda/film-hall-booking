import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ManageShowtimes() {
  const [showtimes, setShowtimes] = useState([]);
  const [form, setForm] = useState({ movieId: '', hallId: '', startTime: '' });

  useEffect(() => {
    axios.get('/api/admin/showtimes').then((res) => setShowtimes(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/showtimes', form);
      setShowtimes([...showtimes, form]);
      setForm({ movieId: '', hallId: '', startTime: '' });
    } catch (error) {
      console.error('Failed to add showtime:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Showtimes</h2>
      <div onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          type="text"
          value={form.movieId}
          onChange={(e) => setForm({ ...form, movieId: e.target.value })}
          placeholder="Movie ID"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          value={form.hallId}
          onChange={(e) => setForm({ ...form, hallId: e.target.value })}
          placeholder="Hall ID"
          className="w-full p-2 border rounded"
        />
        <input
          type="datetime-local"
          value={form.startTime}
          onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Showtime
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {showtimes.map((showtime) => (
          <div key={showtime._id} className="border p-4 rounded">
            <p>Movie ID: {showtime.movieId}</p>
            <p>Hall ID: {showtime.hallId}</p>
            <p>Start Time: {new Date(showtime.startTime).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageShowtimes;