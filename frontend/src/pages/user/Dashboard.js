import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MovieCard from '../../components/movies/MovieCard';

function UserDashboard() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    axios.get('/api/user/movies').then((res) => setMovies(res.data));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Movies</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {movies.map((movie) => (
          <MovieCard key={movie._id} movie={movie} />
        ))}
      </div>
    </div>
  );
}

export default UserDashboard;