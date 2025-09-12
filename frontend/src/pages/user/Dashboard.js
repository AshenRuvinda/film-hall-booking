// frontend/src/pages/user/Dashboard.js - FIXED VERSION
import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../utils/api';
import MovieCard from '../../components/movies/MovieCard';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Calendar, 
  Ticket,
  ChevronDown,
  Eye,
  Star,
  Clock,
  MapPin,
  TrendingUp,
  Film,
  Sparkles,
  Play
} from 'lucide-react';

function UserDashboard() {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [displayedMovies, setDisplayedMovies] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [moviesPerLoad] = useState(8);
  
  // Add stats state
  const [stats, setStats] = useState({
    loading: true,
    totalMovies: 0,
    totalLocations: 12, // Static for now, can be fetched from API
    averageRating: 0,
    totalCustomers: 50000 // Static for now, can be fetched from API
  });

  const { user } = useContext(AuthContext);

  // Enhanced carousel with movie-themed content
  const carouselImages = [
    {
      id: 1,
      src: 'https://images.unsplash.com/photo-1489599743317-fa33f4c0c585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1440&h=600',
      title: 'IMAX Experience',
      subtitle: 'Feel Every Moment in Stunning Detail',
      cta: 'Book IMAX Tickets',
      gradient: 'from-purple-900/80 to-blue-900/80'
    },
    {
      id: 2,
      src: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1440&h=600',
      title: 'Premium Seating',
      subtitle: 'Luxury Recliners & Gourmet Concessions',
      cta: 'Upgrade Your Experience',
      gradient: 'from-red-900/80 to-pink-900/80'
    },
    {
      id: 3,
      src: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1440&h=600',
      title: 'Latest Blockbusters',
      subtitle: 'Don\'t Miss This Week\'s Hottest Releases',
      cta: 'See What\'s Playing',
      gradient: 'from-orange-900/80 to-yellow-800/80'
    }
  ];

  useEffect(() => {
    fetchMovies();
    fetchStats(); // Add stats fetching
  }, []);

  useEffect(() => {
    filterMovies();
  }, [movies, searchTerm, selectedGenre]);

  useEffect(() => {
    setDisplayedMovies(filteredMovies.slice(0, moviesPerLoad));
    setShowMore(filteredMovies.length > moviesPerLoad);
  }, [filteredMovies, moviesPerLoad]);

  useEffect(() => {
    // Set featured movies (first 3 movies with high ratings or special flag)
    if (movies.length > 0) {
      const featured = movies.slice(0, 3);
      setFeaturedMovies(featured);
    }
  }, [movies]);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/movies');
      setMovies(res.data);
    } catch (error) {
      setError('Failed to fetch movies');
      console.error('Fetch movies error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add fetchStats function
  const fetchStats = async () => {
    try {
      // You can replace this with actual API calls
      // For now, we'll calculate stats from movies data
      setStats(prevStats => ({
        ...prevStats,
        loading: true
      }));

      // Simulate API delay
      setTimeout(() => {
        setStats(prevStats => ({
          ...prevStats,
          loading: false
        }));
      }, 1000);
    } catch (error) {
      console.error('Fetch stats error:', error);
      setStats(prevStats => ({
        ...prevStats,
        loading: false
      }));
    }
  };

  // Update stats when movies change
  useEffect(() => {
    if (movies.length > 0) {
      const totalRatings = movies.reduce((sum, movie) => {
        const rating = movie.rating || movie.imdbRating || 0;
        return sum + (parseFloat(rating) || 0);
      }, 0);
      
      const averageRating = movies.length > 0 ? totalRatings / movies.length : 0;

      setStats(prevStats => ({
        ...prevStats,
        totalMovies: movies.length,
        averageRating: averageRating,
        loading: false
      }));
    }
  }, [movies]);

  const filterMovies = () => {
    let filtered = movies;

    if (searchTerm) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedGenre) {
      filtered = filtered.filter(movie =>
        movie.genre && movie.genre.toLowerCase().includes(selectedGenre.toLowerCase())
      );
    }

    setFilteredMovies(filtered);
  };

  const loadMoreMovies = () => {
    const currentLength = displayedMovies.length;
    const nextMovies = filteredMovies.slice(currentLength, currentLength + moviesPerLoad);
    setDisplayedMovies([...displayedMovies, ...nextMovies]);
    
    if (currentLength + moviesPerLoad >= filteredMovies.length) {
      setShowMore(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const getUniqueGenres = () => {
    const genres = movies.map(movie => movie.genre).filter(Boolean);
    return [...new Set(genres)];
  };

  // Generate quick stats from fetched data
  const getQuickStats = () => [
    { 
      icon: Film, 
      label: 'Total Movies', 
      value: stats.loading ? '...' : `${stats.totalMovies || 0}`, 
      color: 'text-blue-400' 
    },
    { 
      icon: Ticket, 
      label: 'Total Bookings', 
      value: stats.loading ? '...' : `${stats.totalBookings ? (stats.totalBookings >= 1000 ? `${Math.floor(stats.totalBookings / 1000)}K+` : stats.totalBookings) : '0'}`, 
      color: 'text-green-400' 
    },
    { 
      icon: MapPin, 
      label: 'Total Halls', 
      value: stats.loading ? '...' : `${stats.totalHalls || 0}`, 
      color: 'text-yellow-400' 
    },
    { 
      icon: TrendingUp, 
      label: 'Total Users', 
      value: stats.loading ? '...' : `${stats.totalUsers ? (stats.totalUsers >= 1000 ? `${Math.floor(stats.totalUsers / 1000)}K+` : stats.totalUsers) : '0'}`, 
      color: 'text-purple-400' 
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-500/30 border-t-purple-500 mx-auto mb-6"></div>
            <Film className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-purple-400" />
          </div>
          <div className="text-2xl font-semibold text-white mb-2">Loading Cinema</div>
          <div className="text-purple-300">Preparing your movie experience...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Enhanced Hero Carousel */}
      <div className="relative h-[600px] overflow-hidden">
        {carouselImages.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <img
              src={image.src}
              alt={image.title}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${image.gradient}`}>
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
            
            {/* Hero Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-6 w-full">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                    <span className="text-yellow-400 font-semibold tracking-wider uppercase text-sm">
                      Premium Experience
                    </span>
                  </div>
                  <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
                    {image.title}
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
                    {image.subtitle}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button className="bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-red-700 hover:to-red-600 transition-all duration-200 flex items-center gap-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                      <Play className="w-5 h-5" />
                      {image.cta}
                    </button>
                    <button className="border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all duration-200 backdrop-blur-sm">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Enhanced Carousel Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all backdrop-blur-sm border border-white/20 hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all backdrop-blur-sm border border-white/20 hover:scale-110"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Enhanced Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-12 h-3 bg-white rounded-full' 
                  : 'w-3 h-3 bg-white/50 rounded-full hover:bg-white/70'
              }`}
            />
          ))}
        </div>

        {/* Quick Stats Overlay */}
        <div className="absolute bottom-8 right-8 hidden lg:block">
          <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="grid grid-cols-2 gap-6">
              {getQuickStats().map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <IconComponent className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                    <div className="text-2xl font-bold text-white">
                      {stats.loading ? (
                        <div className="animate-pulse bg-gray-600 h-6 w-12 rounded mx-auto"></div>
                      ) : (
                        stat.value
                      )}
                    </div>
                    <div className="text-sm text-gray-300">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* User Welcome Section - Enhanced */}
      {user && (
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Enhanced Image Section */}
              <div className="order-2 lg:order-1 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl transform rotate-3 group-hover:rotate-6 transition-transform"></div>
                <img
                  src="https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                  alt="Luxury Cinema Interior"
                  className="relative w-full h-80 object-cover rounded-2xl shadow-2xl transform group-hover:-translate-y-2 transition-all duration-300"
                />
                <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                  VIP Access
                </div>
              </div>
              
              {/* Enhanced Text Section */}
              <div className="order-1 lg:order-2">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-12 h-1 bg-gradient-to-r from-red-500 to-purple-500 rounded-full"></div>
                    <Ticket className="w-5 h-5 text-red-400" />
                  </div>
                  <span className="text-red-400 font-semibold uppercase tracking-wider text-sm">
                    Welcome Back, Movie Lover
                  </span>
                </div>
                
                <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
                  Hello, <span className="text-gradient bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">{user.name}</span>!
                </h2>
                
                <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                  Your personalized cinema dashboard awaits. Track bookings, discover new releases, 
                  and enjoy exclusive member benefits. Your next movie adventure starts here.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    to="/user/bookings" 
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-red-700 hover:to-red-600 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                  >
                    <Ticket className="w-5 h-5" />
                    My Bookings
                  </Link>
                  <button className="inline-flex items-center gap-3 border-2 border-purple-500 text-purple-400 px-8 py-4 rounded-lg font-semibold hover:bg-purple-500 hover:text-white transition-all duration-200">
                    <Star className="w-5 h-5" />
                    Member Rewards
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Movies Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Film className="w-8 h-8 text-red-400" />
            <span className="text-red-400 font-semibold uppercase tracking-wider">
              Now Playing
            </span>
          </div>
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Latest <span className="text-gradient bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">Movies</span>
          </h3>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover the hottest releases and timeless classics playing at our premium theaters
          </p>
        </div>
        
        {/* Enhanced Search and Filter */}
        <div className="mb-12">
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Enhanced Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for movies, genres, actors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Enhanced Genre Filter */}
              <div className="relative min-w-64">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full pl-12 pr-10 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none appearance-none transition-all"
                >
                  <option value="">All Genres</option>
                  {getUniqueGenres().map((genre) => (
                    <option key={genre} value={genre} className="bg-slate-800">
                      {genre}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>

              {/* Filter Results Count */}
              <div className="flex items-center gap-2 text-gray-400 min-w-fit">
                <Clock className="w-5 h-5" />
                <span className="font-medium">
                  {filteredMovies.length} movie{filteredMovies.length !== 1 ? 's' : ''} found
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-300 px-6 py-4 rounded-xl mb-8 flex items-center gap-3 backdrop-blur-sm">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">!</span>
            </div>
            <span>{error}</span>
          </div>
        )}

        {/* Enhanced Movies Grid */}
        {displayedMovies.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
              {displayedMovies.map((movie) => (
                <div key={movie._id} className="group">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
            
            {/* Enhanced See More Button */}
            {showMore && (
              <div className="text-center">
                <button
                  onClick={loadMoreMovies}
                  className="bg-gradient-to-r from-slate-700 to-slate-600 border-2 border-red-500/30 text-white px-12 py-4 rounded-xl hover:from-red-600 hover:to-red-500 hover:border-red-400 transition-all duration-300 flex items-center gap-3 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 mx-auto group"
                >
                  <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Load More Movies
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-sm font-bold">
                    +{filteredMovies.length - displayedMovies.length}
                  </div>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-800/30 rounded-2xl border border-slate-700">
            <Calendar className="w-20 h-20 text-gray-500 mx-auto mb-6" />
            <div className="text-white text-2xl font-semibold mb-4">
              {searchTerm || selectedGenre ? 'No movies found' : 'Coming Soon...'}
            </div>
            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
              {searchTerm || selectedGenre 
                ? 'Try adjusting your search criteria or browse all movies' 
                : 'We\'re adding new blockbusters regularly. Check back soon!'}
            </p>
            {(searchTerm || selectedGenre) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedGenre('');
                }}
                className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;