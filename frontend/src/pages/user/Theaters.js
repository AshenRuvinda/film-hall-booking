// frontend/src/pages/user/Theaters.js
import React, { useState, useEffect } from 'react';
import { 
  Building, 
  MapPin, 
  Users, 
  Star, 
  Clock,
  Wifi,
  Car,
  Utensils,
  Volume2,
  Accessibility,
  AirVent,
  ChevronRight,
  Search,
  Filter,
  Grid,
  List
} from 'lucide-react';

function Theaters() {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [filteredHalls, setFilteredHalls] = useState([]);

  useEffect(() => {
    fetchHalls();
  }, []);

  useEffect(() => {
    filterAndSortHalls();
  }, [halls, searchTerm, filterLocation, sortBy]);

  const fetchHalls = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/halls`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setHalls(data);
      
    } catch (err) {
      console.error('Error fetching theaters:', err);
      
      // Handle specific error cases
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Unable to connect to server. Please make sure the backend is running on port 5000.');
      } else if (err.message.includes('404')) {
        setError('Theater endpoint not found. The /api/halls endpoint may not be implemented yet.');
      } else if (err.message.includes('500')) {
        setError('Server error occurred while fetching theaters.');
      } else {
        setError(err.message || 'Failed to load theaters');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortHalls = () => {
    let filtered = [...halls];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(hall =>
        hall.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hall.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Location filter
    if (filterLocation) {
      filtered = filtered.filter(hall =>
        hall.location.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'location':
          return a.location.localeCompare(b.location);
        case 'capacity':
          return b.totalSeats - a.totalSeats;
        case 'price':
          return (a.pricing?.regular || 0) - (b.pricing?.regular || 0);
        default:
          return 0;
      }
    });

    setFilteredHalls(filtered);
  };

  const getFeatureIcon = (feature) => {
    const icons = {
      air_conditioning: AirVent,
      dolby_sound: Volume2,
      imax: Star,
      '3d_capable': Star,
      wheelchair_accessible: Accessibility,
      reclining_seats: Users,
      food_service: Utensils
    };
    return icons[feature] || Star;
  };

  const getFeatureLabel = (feature) => {
    const labels = {
      air_conditioning: 'Air Conditioning',
      dolby_sound: 'Dolby Sound',
      imax: 'IMAX',
      '3d_capable': '3D Capable',
      wheelchair_accessible: 'Wheelchair Accessible',
      reclining_seats: 'Reclining Seats',
      food_service: 'Food Service'
    };
    return labels[feature] || feature.replace('_', ' ');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/10';
      case 'maintenance':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'inactive':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getUniqueLocations = () => {
    return [...new Set(halls.map(hall => hall.location))];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-900 rounded-xl p-6">
                  <div className="h-6 bg-gray-800 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-800 rounded w-1/2 mb-3"></div>
                  <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Unable to Load Theaters</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchHalls}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Our Theaters</h1>
              <p className="text-gray-400">
                Discover our {halls.length} premium theater locations
              </p>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center bg-gray-900 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search theaters by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/30"
              />
            </div>

            {/* Location Filter */}
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white/30"
            >
              <option value="">All Locations</option>
              {getUniqueLocations().map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white/30"
            >
              <option value="name">Sort by Name</option>
              <option value="location">Sort by Location</option>
              <option value="capacity">Sort by Capacity</option>
              <option value="price">Sort by Price</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-400 mb-6">
            {filteredHalls.length === halls.length ? (
              `Showing all ${halls.length} theaters`
            ) : (
              `Showing ${filteredHalls.length} of ${halls.length} theaters`
            )}
          </div>
        </div>

        {/* Theaters Grid/List */}
        {filteredHalls.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No theaters found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-6'
          }>
            {filteredHalls.map((hall) => (
              <div
                key={hall._id}
                className={`bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all duration-300 group ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                {/* Theater Image/Icon */}
                <div className={`bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center ${
                  viewMode === 'list' ? 'w-32 flex-shrink-0' : 'h-32'
                }`}>
                  <Building className="w-12 h-12 text-gray-600 group-hover:text-white transition-colors" />
                </div>

                {/* Theater Details */}
                <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className={`flex items-start justify-between mb-4 ${
                    viewMode === 'list' ? 'mb-3' : ''
                  }`}>
                    <div>
                      <h3 className="text-xl font-bold mb-1 group-hover:text-blue-400 transition-colors">
                        {hall.name}
                      </h3>
                      <div className="flex items-center text-gray-400 text-sm">
                        <MapPin size={14} className="mr-1" />
                        {hall.location}
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(hall.status)}`}>
                      {hall.status?.charAt(0).toUpperCase() + hall.status?.slice(1)}
                    </span>
                  </div>

                  {/* Theater Info */}
                  <div className={`grid gap-4 mb-4 ${
                    viewMode === 'list' ? 'grid-cols-2' : 'grid-cols-1'
                  }`}>
                    {/* Capacity */}
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 mr-2 text-blue-400" />
                      <span className="text-gray-300">
                        {hall.totalSeats} seats
                      </span>
                    </div>

                    {/* Pricing */}
                    {hall.pricing && (
                      <div className="flex items-center text-sm">
                        <span className="text-gray-400 mr-2">From</span>
                        <span className="text-green-400 font-medium">
                          ${hall.pricing.regular || 0}
                        </span>
                        {hall.pricing.box && (
                          <span className="text-gray-400 ml-1">
                            - ${hall.pricing.box}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Dimensions */}
                    {hall.dimensions && (
                      <div className="flex items-center text-sm text-gray-400">
                        <span>
                          {hall.dimensions.width}m × {hall.dimensions.height}m
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  {hall.features && hall.features.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {hall.features.slice(0, viewMode === 'list' ? 6 : 4).map((feature, index) => {
                          const IconComponent = getFeatureIcon(feature);
                          return (
                            <div
                              key={index}
                              className="flex items-center bg-gray-800 px-2 py-1 rounded text-xs text-gray-300"
                              title={getFeatureLabel(feature)}
                            >
                              <IconComponent size={12} className="mr-1" />
                              <span className="hidden sm:inline">
                                {getFeatureLabel(feature)}
                              </span>
                            </div>
                          );
                        })}
                        {hall.features.length > (viewMode === 'list' ? 6 : 4) && (
                          <div className="flex items-center text-xs text-gray-500">
                            +{hall.features.length - (viewMode === 'list' ? 6 : 4)} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Seat Layout Summary */}
                  {(hall.seatBlocks || hall.boxSeats) && (
                    <div className="text-sm text-gray-400 mb-4">
                      {hall.seatBlocks && hall.seatBlocks.length > 0 && (
                        <span>{hall.seatBlocks.length} seat blocks</span>
                      )}
                      {hall.boxSeats && hall.boxSeats.length > 0 && (
                        <>
                          {hall.seatBlocks && hall.seatBlocks.length > 0 && <span> • </span>}
                          <span>{hall.boxSeats.length} box seats</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <button className="w-full bg-white text-black py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center group">
                    <span>View Shows</span>
                    <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Theaters;