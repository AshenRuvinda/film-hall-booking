// frontend/src/components/movies/MovieCard.js - ENHANCED FOR DASHBOARD
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Film, 
  Eye, 
  Calendar, 
  Star, 
  Play,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Volume2,
  Award
} from 'lucide-react';

function MovieCard({ movie }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleBookmarkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const formatDuration = (duration) => {
    if (!duration) return null;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatReleaseDate = (date) => {
    if (!date) return null;
    return new Date(date).getFullYear();
  };

  return (
    <Link 
      to={`/user/movie/${movie._id}`}
      className="block group relative bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-red-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-red-500/20"
    >
      {/* Movie Poster Section */}
      <div className="relative overflow-hidden bg-slate-700">
        {!imageError ? (
          <div className="relative">
            <img 
              src={movie.poster} 
              alt={movie.title}
              className={`w-full h-80 object-cover transition-all duration-700 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-slate-700 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-500 border-t-transparent"></div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-80 bg-gradient-to-br from-slate-700 to-slate-800 flex flex-col items-center justify-center">
            <Film className="w-16 h-16 text-slate-500 mb-4" />
            <span className="text-slate-400 text-sm font-medium">{movie.title}</span>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          {/* Genre Badge */}
          {movie.genre && (
            <div className="bg-black/60 backdrop-blur-sm border border-white/20 text-white px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
              {movie.genre}
            </div>
          )}
          
          {/* Bookmark Button */}
          <button
            onClick={handleBookmarkClick}
            className="bg-black/60 backdrop-blur-sm border border-white/20 p-2 rounded-full hover:bg-red-500/80 transition-all duration-200 group/bookmark"
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 text-white" />
            ) : (
              <Bookmark className="w-4 h-4 text-white group-hover/bookmark:text-red-300" />
            )}
          </button>
        </div>
        
        {/* Rating Badge */}
        {movie.rating && (
          <div className="absolute top-4 right-16 bg-yellow-500/90 backdrop-blur-sm text-black px-2.5 py-1 rounded-lg flex items-center gap-1 text-sm font-bold shadow-lg">
            <Star className="w-3.5 h-3.5 fill-current" />
            {movie.rating}
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-red-500/90 backdrop-blur-sm p-4 rounded-full transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
            <Play className="w-8 h-8 text-white fill-current" />
          </div>
        </div>
        
        {/* Now Playing Badge */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2 shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Now Showing
          </div>
        </div>
      </div>
      
      {/* Movie Details Section */}
      <div className="p-6 space-y-4 flex-1 flex flex-col">
        {/* Title */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white line-clamp-2 leading-tight group-hover:text-red-400 transition-colors duration-200 min-h-[3.5rem]">
            {movie.title}
          </h3>
          
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {movie.duration && (
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="font-medium">{formatDuration(movie.duration)}</span>
              </div>
            )}
            
            {movie.releaseDate && (
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span className="font-medium">{formatReleaseDate(movie.releaseDate)}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Description */}
        <div className="flex-1">
          {movie.description && (
            <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed">
              {movie.description}
            </p>
          )}
        </div>
        
        {/* Additional Info */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            {movie.language && (
              <div className="flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                <span>{movie.language}</span>
              </div>
            )}
            
            {movie.certification && (
              <div className="bg-slate-700 px-2 py-1 rounded text-xs font-semibold text-white">
                {movie.certification}
              </div>
            )}
          </div>
          
          {/* Popularity Indicator */}
          <div className="flex items-center gap-1 text-xs text-yellow-400">
            <Sparkles className="w-3 h-3" />
            <span className="font-medium">Popular</span>
          </div>
        </div>
        
        {/* Action Button */}
        <div className="pt-4 mt-auto">
          <div className="block w-full bg-gradient-to-r from-red-600 to-red-500 text-white text-center px-6 py-3.5 rounded-xl group-hover:from-red-700 group-hover:to-red-600 transition-all duration-200 font-semibold shadow-lg group-hover:shadow-xl transform group-hover:-translate-y-0.5">
            <div className="flex items-center justify-center gap-2">
              <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Book Tickets</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      
      {/* Premium Badge (if movie has special features) */}
      {movie.isPremium && (
        <div className="absolute top-6 right-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 shadow-lg">
          <Award className="w-3 h-3" />
          Premium
        </div>
      )}
    </Link>
  );
}

export default MovieCard;