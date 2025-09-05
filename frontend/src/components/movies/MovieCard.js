// frontend/src/components/movies/MovieCard.js - ENHANCED VERSION
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Film, Eye, Calendar, Star } from 'lucide-react';

function MovieCard({ movie }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100">
      <div className="relative">
        {movie.poster ? (
          <img 
            src={movie.poster} 
            alt={movie.title}
            className="w-full h-72 object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x400/gray/white?text=No+Image';
            }}
          />
        ) : (
          <div className="w-full h-72 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Film className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        {/* Rating badge (if available) */}
        {movie.rating && (
          <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-lg flex items-center gap-1 text-sm font-semibold">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {movie.rating}
          </div>
        )}
        
        {/* Status badge */}
        <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
          Now Showing
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold mb-3 text-gray-800 line-clamp-2 leading-tight">
          {movie.title}
        </h3>
        
        <div className="space-y-2 mb-4">
          {movie.genre && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Film className="w-4 h-4 text-blue-500" />
              <span className="font-medium">{movie.genre}</span>
            </div>
          )}
          
          {movie.duration && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-green-500" />
              <span>{movie.duration} min</span>
            </div>
          )}
          
          {movie.releaseDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-purple-500" />
              <span>{new Date(movie.releaseDate).getFullYear()}</span>
            </div>
          )}
        </div>
        
        {movie.description && (
          <p className="text-sm text-gray-700 mb-6 line-clamp-3 leading-relaxed">
            {movie.description}
          </p>
        )}
        
        <Link 
          to={`/user/movie/${movie._id}`} 
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <Eye className="w-4 h-4" />
          View Details & Book
        </Link>
      </div>
    </div>
  );
}

export default MovieCard;