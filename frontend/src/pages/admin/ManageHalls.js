import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ManageHalls() {
  const [halls, setHalls] = useState([]);
  const [form, setForm] = useState({ name: '', totalSeats: '' });

  useEffect(() => {
    axios.get('/api/admin/halls').then((res) => setHalls(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/halls', form);
      setHalls([...halls, form]);
      setForm({ name: '', totalSeats: '' });
    } catch (error) {
      console.error('Failed to add hall:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Halls</h2>
      <div onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Hall Name"
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          value={form.totalSeats}
          onChange={(e) => setForm({ ...form, totalSeats: e.target.value })}
          placeholder="Total Seats"
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Hall
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {halls.map((hall) => (
          <div key={hall._id} className="border p-4 rounded">
            <h3 className="text-lg font-bold">{hall.name}</h3>
            <p>Total Seats: {hall.totalSeats}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageHalls;