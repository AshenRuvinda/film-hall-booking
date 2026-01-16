// frontend/src/components/movies/MovieDetail.js - FIXED SEAT COUNT VERSION
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Star, 
  MapPin, 
  Users, 
  CreditCard,
  Film,
  Award,
  Globe,
  Play,
  Info,
  Ticket,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import api from '../../utils/api';
import { fetchMovieDetails } from '../../utils/movieApi';

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [showtimesWithSeats, setShowtimesWithSeats] = useState({}); // NEW: Store seat data per showtime
  const [tmdbData, setTmdbData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingTmdb, setLoadingTmdb] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // NEW: For manual refresh

  useEffect(() => {
    fetchMovieData();
  }, [id]);

  // Refresh showtime data periodically for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && movie) {
        fetchShowtimesWithSeatData();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [loading, movie]);

  const fetchMovieData = async () => {
    try {
      setLoading(true);
      setError('');

      if (!id) {
        throw new Error('No movie ID provided');
      }

      console.log(`🎬 Fetching movie data for ID: ${id}`);

      // Fetch movie details from backend
      const movieRes = await api.get(`/movies/${id}`);
      const movieData = movieRes.data;
      console.log('📽️ Movie data:', movieData);
      setMovie(movieData);

      // Fetch showtimes with seat data
      await fetchShowtimesWithSeatData();

      // Fetch enhanced data from TMDB
      if (movieData?.title) {
        fetchTmdbData(movieData.title);
      }

    } catch (error) {
      console.error('❌ Failed to fetch movie data:', error);
      setError(`Failed to load movie details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Enhanced function to fetch showtimes with actual seat availability
  const fetchShowtimesWithSeatData = async () => {
    try {
      console.log(`🎫 Fetching showtimes for movie ID: ${id}`);
      
      // Fetch showtimes
      const showtimesRes = await api.get(`/showtimes/movie/${id}`);
      const showtimesData = showtimesRes.data;
      console.log(`📅 Found ${showtimesData.length} showtimes`);
      
      setShowtimes(showtimesData);

      // For each showtime, fetch the actual booked seats
      const seatDataPromises = showtimesData.map(async (showtime) => {
        try {
          console.log(`🪑 Fetching seat data for showtime: ${showtime._id}`);
          
          // Use the correct endpoint that matches your backend
          const seatRes = await api.get(`/user/showtimes/${showtime._id}/seats`);
          const seatData = seatRes.data;
          
          console.log(`🔍 Showtime ${showtime._id} seat data:`, seatData);
          
          return {
            showtimeId: showtime._id,
            bookedSeats: seatData.bookedSeats || [],
            totalSeats: showtime.hallId?.totalSeats || 0
          };
        } catch (error) {
          console.error(`❌ Error fetching seats for showtime ${showtime._id}:`, error);
          return {
            showtimeId: showtime._id,
            bookedSeats: [],
            totalSeats: showtime.hallId?.totalSeats || 0
          };
        }
      });

      // Wait for all seat data to be fetched
      const seatResults = await Promise.all(seatDataPromises);
      
      // Convert to object for easy lookup
      const seatDataMap = {};
      seatResults.forEach(result => {
        seatDataMap[result.showtimeId] = result;
        console.log(`💺 Showtime ${result.showtimeId}: ${result.bookedSeats.length}/${result.totalSeats} booked`);
      });
      
      setShowtimesWithSeats(seatDataMap);
      
    } catch (error) {
      console.error('❌ Failed to fetch showtimes with seat data:', error);
    }
  };

  // NEW: Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchShowtimesWithSeatData();
      console.log('✅ Seat data refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh seat data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchTmdbData = async (title) => {
    try {
      setLoadingTmdb(true);
      console.log(`🌐 Fetching enhanced movie data from TMDB for: ${title}`);
      
      // Use the movieApi utility to fetch from TMDB
      const enhancedData = await fetchMovieDetails(title, {
        preferredAPI: 'tmdb',
        isTitle: true,
        fallback: true
      });
      
      console.log('✅ Enhanced movie data received:', enhancedData);
      setTmdbData(enhancedData);
      
    } catch (error) {
      console.error('❌ Failed to fetch enhanced movie data:', error.message);
      // Not fatal - we'll just display data from our backend
    } finally {
      setLoadingTmdb(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      monthDay: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  };

  const isShowtimePast = (startTime) => {
    return new Date(startTime) < new Date();
  };

  // FIXED: Get actual available seats from our seat data
  const getAvailableSeats = (showtime) => {
    const seatData = showtimesWithSeats[showtime._id];
    
    if (!seatData) {
      console.log(`⚠️ No seat data available for showtime ${showtime._id}`);
      return {
        available: showtime.hallId?.totalSeats || 0,
        total: showtime.hallId?.totalSeats || 0,
        booked: 0
      };
    }
    
    const totalSeats = seatData.totalSeats;
    const bookedCount = seatData.bookedSeats.length;
    const available = totalSeats - bookedCount;
    
    console.log(`🎯 Showtime ${showtime._id}: ${available}/${totalSeats} available (${bookedCount} booked)`);
    
    return {
      available: Math.max(0, available),
      total: totalSeats,
      booked: bookedCount
    };
  };

  const handleBookNow = (showtimeId) => {
    navigate(`/user/seat-selection/${showtimeId}`);
  };

  const groupShowtimesByDate = (showtimes) => {
    const grouped = {};
    showtimes.forEach(showtime => {
      const date = new Date(showtime.startTime).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(showtime);
    });
    return grouped;
  };

  const getDisplayData = () => {
    if (tmdbData) {
      return {
        title: tmdbData.title || movie.title,
        poster: tmdbData.poster || tmdbData.poster_path
          ? (tmdbData.poster || `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`)
          : movie.poster,
        backdrop: tmdbData.backdrop || tmdbData.backdrop_path
          ? (tmdbData.backdrop || `https://image.tmdb.org/t/p/w1280${tmdbData.backdrop_path}`)
          : null,
        plot: tmdbData.plot || tmdbData.overview || movie.description || 'No plot description available.',
        year: tmdbData.year || (tmdbData.release_date ? new Date(tmdbData.release_date).getFullYear() : null),
        runtime: tmdbData.runtime || (movie.duration ? `${movie.duration} min` : null),
        rating: tmdbData.rating ? (typeof tmdbData.rating === 'string' ? tmdbData.rating : tmdbData.rating.toFixed(1)) : null,
        genres: tmdbData.genres || movie.genre,
        director: tmdbData.director,
        cast: tmdbData.cast,
        castDetails: tmdbData.castDetails || [],
        language: tmdbData.language,
        budget: tmdbData.budget,
        revenue: tmdbData.revenue,
        tagline: tmdbData.tagline,
        homepage: tmdbData.homepage,
        trailer: tmdbData.trailer
      };
    }
    return {
      ...movie,
      plot: movie.description || 'No plot description available.',
      poster: movie.poster,
      backdrop: null,
      year: null,
      runtime: movie.duration ? `${movie.duration} min` : null,
      rating: null,
      genres: movie.genre,
      director: null,
      cast: null,
      castDetails: [],
      language: null,
      budget: null,
      revenue: null,
      tagline: null,
      homepage: null,
      trailer: null
    };
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading movie details...</p>
          <div className="flex items-center justify-center mt-2 text-blue-300">
            <Film className="w-4 h-4 mr-2" />
            <span className="text-sm">Movie ID: {id}</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Link 
              to="/user/dashboard" 
              className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Movies
            </Link>
          </div>

          <div className="text-center max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <AlertCircle className="mx-auto h-16 w-16 text-red-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Movie Not Found</h3>
              <p className="text-gray-300 mb-6">{error || 'The requested movie could not be found.'}</p>
              
              <div className="space-y-3">
                <button
                  onClick={fetchMovieData}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Try Again
                </button>
                <Link 
                  to="/user/dashboard" 
                  className="block bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Back to Movies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayData = getDisplayData();
  const groupedShowtimes = groupShowtimesByDate(showtimes);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Hero Section with Backdrop */}
      <div className="relative">
        {displayData.backdrop && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
            style={{ backgroundImage: `url(${displayData.backdrop})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
        
        {/* Navigation */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto">
            <Link 
              to="/user/dashboard" 
              className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Movies
            </Link>
          </div>
        </div>

        {/* Movie Header */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
            <div className="lg:flex">
              {/* Movie Poster */}
              <div className="lg:w-1/3 xl:w-1/4">
                <div className="h-96 lg:h-full relative group">
                  {displayData.poster ? (
                    <img
                      src={displayData.poster}
                      alt={displayData.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x600/374151/FFFFFF?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                      <div className="text-center">
                        <Film className="mx-auto h-16 w-16 text-gray-400 mb-2" />
                        <p className="text-gray-400 text-sm">No Image Available</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Trailer Button Overlay */}
                  {displayData.trailer && displayData.trailer.key && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => window.open(`https://www.youtube.com/watch?v=${displayData.trailer.key}`, '_blank')}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 transition-colors"
                        title="Watch Trailer"
                      >
                        <Play className="w-8 h-8" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Movie Details */}
              <div className="lg:w-2/3 xl:w-3/4 p-8">
                <div className="h-full flex flex-col">
                  {/* Title and Status */}
                  <div className="mb-6">
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
                      {displayData.title}
                    </h1>
                    
                    {displayData.tagline && (
                      <p className="text-blue-300 text-lg italic mb-4">{displayData.tagline}</p>
                    )}
                    
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Available
                      </span>
                      {loadingTmdb && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          <div className="w-3 h-3 mr-1 animate-spin rounded-full border border-blue-300 border-t-transparent" />
                          Loading details...
                        </span>
                      )}
                      {tmdbData && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          <Globe className="w-3 h-3 mr-1" />
                          Enhanced
                        </span>
                      )}
                    </div>

                    {/* Movie Metadata */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {displayData.year && (
                        <div className="flex items-center text-gray-300">
                          <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                          <span className="text-sm">{displayData.year}</span>
                        </div>
                      )}
                      {displayData.runtime && (
                        <div className="flex items-center text-gray-300">
                          <Clock className="w-4 h-4 mr-2 text-blue-400" />
                          <span className="text-sm">{displayData.runtime}</span>
                        </div>
                      )}
                      {displayData.rating && (
                        <div className="flex items-center text-gray-300">
                          <Star className="w-4 h-4 mr-2 text-yellow-400 fill-current" />
                          <span className="text-sm">{displayData.rating}/10</span>
                        </div>
                      )}
                      {displayData.language && (
                        <div className="flex items-center text-gray-300">
                          <Globe className="w-4 h-4 mr-2 text-blue-400" />
                          <span className="text-sm">{displayData.language}</span>
                        </div>
                      )}
                    </div>

                    {/* Genres */}
                    {displayData.genres && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {displayData.genres.split(', ').map((genre, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Plot */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                        <Info className="w-5 h-5 mr-2 text-blue-400" />
                        Synopsis
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        {displayData.plot || 'No plot description available.'}
                      </p>
                    </div>

                    {/* Cast and Crew */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {displayData.director && (
                        <div>
                          <h4 className="text-white font-semibold mb-2 flex items-center">
                            <Award className="w-4 h-4 mr-2 text-blue-400" />
                            Director
                          </h4>
                          <p className="text-gray-300">{displayData.director}</p>
                        </div>
                      )}
                      {displayData.castDetails && displayData.castDetails.length > 0 && (
                        <div className="lg:col-span-2">
                          <h4 className="text-white font-semibold mb-4 flex items-center">
                            <Users className="w-4 h-4 mr-2 text-blue-400" />
                            Cast
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {displayData.castDetails.slice(0, 10).map((actor, index) => (
                              <div key={index} className="text-center group">
                                <div className="relative mb-2 overflow-hidden rounded-lg">
                                  <img
                                    src={actor.profile_path 
                                      ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                                      : 'https://via.placeholder.com/185x278/374151/FFFFFF?text=No+Photo'
                                    }
                                    alt={actor.name}
                                    className="w-full h-24 sm:h-28 object-cover transition-transform duration-300 group-hover:scale-105"
                                    onError={(e) => {
                                      e.target.src = 'https://via.placeholder.com/185x278/374151/FFFFFF?text=No+Photo';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                                <h5 className="text-white text-sm font-medium mb-1 line-clamp-2 leading-tight">
                                  {actor.name}
                                </h5>
                                <p className="text-gray-400 text-xs line-clamp-2">
                                  {actor.character}
                                </p>
                              </div>
                            ))}
                          </div>
                          {displayData.castDetails.length > 10 && (
                            <p className="text-gray-400 text-sm mt-3 text-center">
                              And {displayData.castDetails.length - 10} more cast members...
                            </p>
                          )}
                        </div>
                      )}
                      {/* Fallback for when TMDB data isn't available or doesn't have detailed cast */}
                      {displayData.cast && (!displayData.castDetails || displayData.castDetails.length === 0) && (
                        <div>
                          <h4 className="text-white font-semibold mb-2 flex items-center">
                            <Users className="w-4 h-4 mr-2 text-blue-400" />
                            Cast
                          </h4>
                          <p className="text-gray-300">{displayData.cast}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Ticket className="w-6 h-6 mr-3 text-blue-400" />
              Showtimes & Booking
              <span className="ml-3 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30">
                {showtimes.length} shows
              </span>
            </h2>
            
            {/* NEW: Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Seats'}
            </button>
          </div>

          {showtimes.length === 0 ? (
            <div className="text-center py-16">
              <AlertCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Showtimes Available</h3>
              <p className="text-gray-400">This movie doesn't have any scheduled showtimes at the moment.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedShowtimes).map(([date, dayShowtimes]) => (
                <div key={date} className="border-b border-white/10 pb-8 last:border-b-0">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                    {formatDateTime(dayShowtimes[0].startTime).date}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dayShowtimes.map((showtime) => {
                      const isPast = isShowtimePast(showtime.startTime);
                      const seatInfo = getAvailableSeats(showtime);
                      const isFullyBooked = seatInfo.available === 0;
                      const isLowAvailability = seatInfo.available <= 10 && seatInfo.available > 0;
                      
                      return (
                        <div
                          key={showtime._id}
                          className={`relative overflow-hidden rounded-xl p-6 transition-all duration-300 ${
                            isPast 
                              ? 'bg-gray-800/50 border-gray-600/30 opacity-60' 
                              : isFullyBooked
                              ? 'bg-red-900/20 border-red-500/30 border'
                              : 'bg-white/5 border border-white/20 hover:bg-white/10 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/25'
                          }`}
                        >
                          {/* Time and Hall */}
{/* Time and Hall */}
<div className="flex justify-between items-start mb-4">
  <div>
    <p className="text-2xl font-bold text-white mb-1">
      {formatDateTime(showtime.startTime).time}
    </p>
    <div className="flex items-center text-gray-400">
      <MapPin className="w-4 h-4 mr-1" />
      <span className="text-sm">{showtime.hallId?.name || 'Unknown Hall'}</span>
    </div>
  </div>
  <div className="text-right">
    {/* FIXED: Always show pricing structure - backend now provides pricing */}
    {showtime.pricing ? (
      <div>
        <p className="text-xl font-bold text-green-400 flex items-center">
          <CreditCard className="w-4 h-4 mr-1" />
          ${showtime.pricing.regular}
        </p>
        <p className="text-xs text-gray-400">Regular seats</p>
        {showtime.pricing.box && showtime.pricing.box > showtime.pricing.regular && (
          <>
            
          </>
        )}
      </div>
    ) : (
      // Fallback - this should rarely be used now
      <div>
        <p className="text-xl font-bold text-gray-400 flex items-center">
          <CreditCard className="w-4 h-4 mr-1" />
          <span className="text-sm">Pricing</span>
        </p>
        <p className="text-xs text-gray-500">Not available</p>
      </div>
    )}
  </div>
</div>
                          
                          {/* UPDATED: Seat Availability with real data */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-400 flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                Available Seats
                              </span>
                              <span className={`text-sm font-semibold ${
                                isFullyBooked 
                                  ? 'text-red-400' 
                                  : isLowAvailability 
                                  ? 'text-yellow-400'
                                  : 'text-green-400'
                              }`}>
                                {seatInfo.available}/{seatInfo.total}
                              </span>
                            </div>
                            
                            {/* Updated Progress Bar */}
                            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  isFullyBooked 
                                    ? 'bg-red-500' 
                                    : isLowAvailability 
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }`}
                                style={{ 
                                  width: `${seatInfo.total > 0 ? (seatInfo.available / seatInfo.total) * 100 : 0}%` 
                                }}
                              />
                            </div>
                            
                            {/* NEW: Show booking details */}
                            {seatInfo.booked > 0 && (
                              <p className="text-xs text-gray-500">
                                {seatInfo.booked} seat{seatInfo.booked !== 1 ? 's' : ''} booked
                              </p>
                            )}
                          </div>
                          
                          {/* Action Button */}
                          {isPast ? (
                            <button
                              disabled
                              className="w-full px-4 py-3 bg-gray-600/50 text-gray-400 rounded-lg cursor-not-allowed flex items-center justify-center"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Show Ended
                            </button>
                          ) : isFullyBooked ? (
                            <button
                              disabled
                              className="w-full px-4 py-3 bg-red-600/50 text-red-300 rounded-lg cursor-not-allowed flex items-center justify-center"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Fully Booked
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBookNow(showtime._id)}
                              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 font-semibold flex items-center justify-center group"
                            >
                              <Ticket className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                              Book Now
                              {isLowAvailability && (
                                <span className="ml-2 px-2 py-1 bg-yellow-500 text-yellow-900 rounded text-xs font-bold">
                                  Few Left!
                                </span>
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;