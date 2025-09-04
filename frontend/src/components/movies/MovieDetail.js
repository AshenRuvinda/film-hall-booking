import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    axios.get(`/api/user/movies/${id}`).then((res) => setMovie(res.data));
  }, [id]);

  if (!movie) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">{movie.title}</h2>
      <img src={movie.poster} alt={movie.title} className="w-64 h-96 object-cover" />
      <p>{movie.description}</p>
      <p>Duration: {movie.duration} minutes</p>
      <p>Genre: {movie.genre}</p>
      <Link to={`/user/seat-selection/${movie.showtimeId}`} className="bg-blue-500 text-white px-4 py-2 rounded">
        Select Seats
      </Link>
    </div>
  );
}

export default MovieDetail;