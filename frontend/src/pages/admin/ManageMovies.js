import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ManageMovies() {
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', poster: '', duration: '', genre: '' });

  useEffect(() => {
    axios.get('/api/user/movies').then((res) => setMovies(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/movies', form);
      setMovies([...movies, form]);
      setForm({ title: '', description: '', poster: '', duration: '', genre: '' });
    } catch (error) {
      console.error('Failed to add movie:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Movies</h2>
      <div onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Title"
          className="w-full p-2 border rounded"
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          value={form.poster}
          onChange={(e) => setForm({ ...form, poster: e.target.value })}
          placeholder="Poster URL"
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          value={form.duration}
          onChange={(e) => setForm({ ...form, duration: e.target.value })}
          placeholder="Duration (minutes)"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          value={form.genre}
          onChange={(e) => setForm({ ...form, genre: e.target.value })}
          placeholder="Genre"
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Movie
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {movies.map((movie) => (
          <div key={movie._id} className="border p-4 rounded">
            <h3 className="text-lg font-bold">{movie.title}</h3>
            <p>{movie.genre}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageMovies;