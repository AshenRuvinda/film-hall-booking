// frontend/src/components/movies/MovieCard.js - ENHANCED VERSION
import React from 'react';
import { Link } from 'react-router-dom';

function MovieCard({ movie }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {movie.poster ? (
        <img 
          src={movie.poster} 
          alt={movie.title}
          className="w-full h-64 object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x400/gray/white?text=No+Image';
          }}
        />
      ) : (
        <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">No Image</span>
        </div>
      )}
      
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2 line-clamp-2">{movie.title}</h3>
        
        <div className="space-y-1 text-sm text-gray-600 mb-4">
          {movie.genre && <p>Genre: {movie.genre}</p>}
          {movie.duration && <p>Duration: {movie.duration} minutes</p>}
        </div>
        
        {movie.description && (
          <p className="text-sm text-gray-700 mb-4 line-clamp-3">
            {movie.description}
          </p>
        )}
        
        <Link 
          to={`/user/movie/${movie._id}`} 
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors block text-center"
        >
          View Details & Book
        </Link>
      </div>
    </div>
  );
}

export default MovieCard;