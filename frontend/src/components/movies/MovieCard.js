import React from 'react';
import { Link } from 'react-router-dom';

function MovieCard({ movie }) {
  return (
    <div className="border rounded-lg p-4 shadow-md">
      <img src={movie.poster} alt={movie.title} className="w-full h-48 object-cover rounded" />
      <h3 className="text-lg font-bold mt-2">{movie.title}</h3>
      <p>{movie.genre}</p>
      <Link to={`/user/movie/${movie._id}`} className="text-blue-500">View Details</Link>
    </div>
  );
}

export default MovieCard;