// frontend/src/pages/user/Dashboard.js - UPDATED WITH BOTTOM STATS AND MODALS
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
  Play,
  Users,
  X,
  Gift,
  Award,
  Zap,
  Shield,
  Crown,
  Camera,
  Volume2,
  Coffee,
  Smartphone
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
  const [moviesPerLoad] = useState(4);
  
  // Modal states
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);
  const [showMemberRewardsModal, setShowMemberRewardsModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState('features');
  
  // Updated stats state to fetch real data
  const [stats, setStats] = useState({
    loading: true,
    totalMovies: 0,
    totalHalls: 0,
    totalBookings: 0,
    totalUsers: 0,
    activeShowtimes: 0,
    totalRevenue: 0,
    error: null
  });

  const { user } = useContext(AuthContext);

  // Enhanced carousel with movie-themed content
  const carouselImages = [
    {
      id: 1,
      src: 'https://image.cnbcfm.com/api/v1/image/107198579-1677121939840-gettyimages-1051853192-775239116LN023_IMAX_Private.jpeg?v=1751996915&w=1920&h=1080',
      title: 'IMAX Experience',
      subtitle: 'Feel Every Moment in Stunning Detail',
      cta: 'Book IMAX Tickets',
      gradient: 'from-purple-900/80 to-blue-900/80'
    },
    {
      id: 2,
      src: 'https://media.assettype.com/bloombergquint%2F2024-05%2F7cbba07b-7650-4719-b85c-300b0d868f02%2Ffelix_mooneeram_evlkOfkQ5rE_unsplash.jpg?rect=0%2C850%2C6000%2C3150&w=1200&auto=format%2Ccompress&ogImage=true',
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

  // Modal data
  const learnMoreFeatures = [
    {
      icon: Camera,
      title: 'IMAX & Dolby Vision',
      description: 'Experience movies in stunning 4K resolution with immersive surround sound',
      details: 'Our premium theaters feature state-of-the-art projection systems and crystal-clear audio'
    },
    {
      icon: Crown,
      title: 'VIP Seating',
      description: 'Luxury leather recliners with personal service',
      details: 'Fully reclining seats with heated options and dedicated waitstaff for the ultimate comfort'
    },
    {
      icon: Coffee,
      title: 'Gourmet Concessions',
      description: 'Artisanal snacks and premium beverages',
      details: 'From handcrafted cocktails to gourmet popcorn, elevate your movie experience'
    },
    {
      icon: Smartphone,
      title: 'Mobile Integration',
      description: 'Seamless booking and digital tickets',
      details: 'Reserve seats, order concessions, and access your tickets all from your phone'
    }
  ];

  const memberRewards = [
    {
      icon: Star,
      title: 'Loyalty Points',
      description: 'Earn 10 points for every dollar spent',
      benefit: 'Redeem for free tickets, upgrades, and exclusive merchandise',
      color: 'text-yellow-400'
    },
    {
      icon: Gift,
      title: 'Birthday Rewards',
      description: 'Free movie ticket on your special day',
      benefit: 'Plus exclusive birthday concession discounts',
      color: 'text-pink-400'
    },
    {
      icon: Zap,
      title: 'Early Access',
      description: 'Book tickets before general public',
      benefit: 'Get the best seats for premieres and special events',
      color: 'text-blue-400'
    },
    {
      icon: Award,
      title: 'VIP Status Tiers',
      description: 'Silver, Gold, and Platinum membership levels',
      benefit: 'Unlock exclusive lounges, premium seating, and special events',
      color: 'text-purple-400'
    }
  ];

  useEffect(() => {
    fetchMovies();
    fetchStats();
  }, []);

  useEffect(() => {
    filterMovies();
  }, [movies, searchTerm, selectedGenre]);

  useEffect(() => {
    setDisplayedMovies(filteredMovies.slice(0, moviesPerLoad));
    setShowMore(filteredMovies.length > moviesPerLoad);
  }, [filteredMovies, moviesPerLoad]);

  useEffect(() => {
    if (movies.length > 0) {
      const featured = movies.slice(0, 3);
      setFeaturedMovies(featured);
    }
  }, [movies]);

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

  const fetchStats = async () => {
    try {
      console.log('Fetching real dashboard statistics...');
      setStats(prevStats => ({
        ...prevStats,
        loading: true,
        error: null
      }));

      const res = await api.get('/stats');
      console.log('Stats response:', res.data);
      
      if (res.data && res.data.stats) {
        setStats({
          loading: false,
          totalMovies: res.data.stats.totalMovies || 0,
          totalHalls: res.data.stats.totalHalls || 0,
          totalBookings: res.data.stats.totalBookings || 0,
          totalUsers: res.data.stats.totalUsers || 0,
          activeShowtimes: res.data.stats.activeShowtimes || 0,
          totalRevenue: res.data.stats.totalRevenue || 0,
          error: null
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
      setStats(prevStats => ({
        ...prevStats,
        loading: false,
        error: 'Failed to fetch statistics'
      }));
      
      if (movies.length > 0) {
        setStats(prevStats => ({
          ...prevStats,
          totalMovies: movies.length
        }));
      }
    }
  };

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

  const getQuickStats = () => {
    const formatNumber = (num) => {
      if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
      } else if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
      }
      return num.toString();
    };

    return [
      { 
        icon: Film, 
        label: 'Movies Playing', 
        value: stats.loading ? '...' : formatNumber(stats.totalMovies), 
        color: 'text-blue-400',
        description: 'Total movies available'
      },
      { 
        icon: Ticket, 
        label: 'Total Bookings', 
        value: stats.loading ? '...' : formatNumber(stats.totalBookings), 
        color: 'text-green-400',
        description: 'Tickets sold'
      },
      { 
        icon: MapPin, 
        label: 'Cinema Halls', 
        value: stats.loading ? '...' : formatNumber(stats.totalHalls), 
        color: 'text-yellow-400',
        description: 'Available screens'
      },
      { 
        icon: Users, 
        label: 'Happy Customers', 
        value: stats.loading ? '...' : formatNumber(stats.totalUsers), 
        color: 'text-purple-400',
        description: 'Registered customers'
      }
    ];
  };

  // Modal Components
  const LearnMoreModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Premium Cinema Experience</h2>
            <p className="text-gray-400 mt-1">Discover what makes us special</p>
          </div>
          <button
            onClick={() => setShowLearnMoreModal(false)}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learnMoreFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="bg-slate-700/50 border border-slate-600 rounded-xl p-6 hover:bg-slate-700 transition-colors group">
                  <div className="flex items-start gap-4">
                    <div className="bg-red-500/20 p-3 rounded-lg">
                      <IconComponent className="w-6 h-6 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-red-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-300 mb-3">{feature.description}</p>
                      <p className="text-sm text-gray-400">{feature.details}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* CTA Section */}
          <div className="mt-8 text-center bg-gradient-to-r from-red-600/20 to-purple-600/20 rounded-xl p-6 border border-red-500/30">
            <h3 className="text-xl font-bold text-white mb-2">Ready to Experience Premium Cinema?</h3>
            <p className="text-gray-300 mb-4">Book your next movie with premium features</p>
            <button 
              onClick={() => setShowLearnMoreModal(false)}
              className="bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-600 transition-all duration-200"
            >
              Browse Movies
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const MemberRewardsModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Member Rewards Program</h2>
            </div>
            <p className="text-gray-400">Exclusive benefits for our valued members</p>
          </div>
          <button
            onClick={() => setShowMemberRewardsModal(false)}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Current Member Status */}
          {user && (
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">Welcome, {user.name}!</h3>
                  <p className="text-purple-300">Silver Member • 2,450 points earned</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">2,450</div>
                  <div className="text-sm text-purple-300">Loyalty Points</div>
                </div>
              </div>
              <div className="mt-4 bg-slate-800/50 rounded-lg p-3">
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span>Progress to Gold Status</span>
                  <span>2,450 / 5,000 points</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style={{width: '49%'}}></div>
                </div>
              </div>
            </div>
          )}

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {memberRewards.map((reward, index) => {
              const IconComponent = reward.icon;
              return (
                <div key={index} className="bg-slate-700/50 border border-slate-600 rounded-xl p-6 hover:bg-slate-700 transition-colors group">
                  <div className="flex items-start gap-4">
                    <div className="bg-slate-600/50 p-3 rounded-lg">
                      <IconComponent className={`w-6 h-6 ${reward.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{reward.title}</h3>
                      <p className="text-gray-300 mb-2">{reward.description}</p>
                      <p className="text-sm text-gray-400">{reward.benefit}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Membership Tiers */}
          <div className="bg-slate-700/30 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 text-center">Membership Tiers</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-600/50 rounded-lg p-4 text-center">
                <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <h4 className="font-semibold text-white">Silver</h4>
                <p className="text-sm text-gray-300">0 - 4,999 points</p>
                <ul className="text-xs text-gray-400 mt-2 space-y-1">
                  <li>• 5% discount on tickets</li>
                  <li>• Birthday reward</li>
                </ul>
              </div>
              <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-4 text-center">
                <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <h4 className="font-semibold text-white">Gold</h4>
                <p className="text-sm text-gray-300">5,000 - 14,999 points</p>
                <ul className="text-xs text-gray-400 mt-2 space-y-1">
                  <li>• 10% discount on tickets</li>
                  <li>• Free drink upgrade</li>
                  <li>• Early access booking</li>
                </ul>
              </div>
              <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-4 text-center">
                <Crown className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <h4 className="font-semibold text-white">Platinum</h4>
                <p className="text-sm text-gray-300">15,000+ points</p>
                <ul className="text-xs text-gray-400 mt-2 space-y-1">
                  <li>• 15% discount on tickets</li>
                  <li>• VIP lounge access</li>
                  <li>• Exclusive events</li>
                  <li>• Free concession upgrades</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Join CTA */}
          <div className="mt-6 text-center">
            <button 
              onClick={() => setShowMemberRewardsModal(false)}
              className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-600 transition-all duration-200 mr-4"
            >
              View My Rewards
            </button>
            <button 
              onClick={() => setShowMemberRewardsModal(false)}
              className="border-2 border-purple-500 text-purple-400 px-8 py-3 rounded-lg font-semibold hover:bg-purple-500 hover:text-white transition-all duration-200"
            >
              Redeem Points
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
                    <button 
                      onClick={() => setShowLearnMoreModal(true)}
                      className="border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
                    >
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
                  <button 
                    onClick={() => setShowMemberRewardsModal(true)}
                    className="inline-flex items-center gap-3 border-2 border-purple-500 text-purple-400 px-8 py-4 rounded-lg font-semibold hover:bg-purple-500 hover:text-white transition-all duration-200"
                  >
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {displayedMovies.map((movie) => (
                <div key={movie._id} className="group h-full">
                  <div className="h-full">
                    <MovieCard movie={movie} />
                  </div>
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

      {/* Enhanced Bottom Stats Section */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Stats Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <span className="text-green-400 font-semibold uppercase tracking-wider text-sm">
                Cinema Statistics
              </span>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Our <span className="text-gradient bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Success</span> Story
            </h3>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Discover the numbers that showcase our commitment to delivering exceptional cinema experiences
            </p>
          </div>

          {/* Stats Error Handling */}
          {stats.error ? (
            <div className="text-center py-12">
              <div className="bg-red-900/20 border border-red-500/30 text-red-300 px-6 py-4 rounded-xl inline-block mb-4">
                <span>Unable to load statistics</span>
              </div>
              <br />
              <button 
                onClick={fetchStats}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Retry Loading Stats
              </button>
            </div>
          ) : (
            <div>
              {/* Main Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {getQuickStats().map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={index} className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-8 text-center group hover:bg-slate-800 transition-all duration-300 hover:-translate-y-2">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-purple-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
                        <IconComponent className={`relative w-12 h-12 ${stat.color} mx-auto group-hover:scale-110 transition-transform duration-300`} />
                      </div>
                      
                      <div className="text-4xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-red-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                        {stats.loading ? (
                          <div className="animate-pulse bg-gray-600 h-10 w-20 rounded mx-auto"></div>
                        ) : (
                          stat.value
                        )}
                      </div>
                      
                      <div className="text-lg font-semibold text-gray-300 mb-2 group-hover:text-white transition-colors">
                        {stat.label}
                      </div>
                      
                      <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                        {stat.description}
                      </div>
                      
                      {/* Animated border */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10"></div>
                    </div>
                  );
                })}
              </div>

              {/* Active Showtimes */}
              {stats.activeShowtimes > 0 && (
                <div className="text-center">
                  <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 inline-block">
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6 text-blue-400" />
                      <span className="text-white font-semibold">
                        {stats.loading ? '...' : stats.activeShowtimes} Active Showtimes
                      </span>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showLearnMoreModal && <LearnMoreModal />}
      {showMemberRewardsModal && <MemberRewardsModal />}
    </div>
  );
}

export default UserDashboard;