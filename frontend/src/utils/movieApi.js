// frontend/src/utils/movieApi.js - MOVIE API UTILITIES
/**
 * Movie API utilities for fetching movie data from external services
 * Supports multiple APIs: OMDb, TMDb, and free alternatives
 */

// API Configuration
export const MOVIE_API_CONFIG = {
    // OMDb API (Open Movie Database) - Requires API key
    // Get free API key from: http://www.omdbapi.com/apikey.aspx
    OMDB: {
      API_KEY: process.env.REACT_APP_OMDB_API_KEY,
      BASE_URL: 'https://www.omdbapi.com/',
      name: 'OMDb API'
    },
    
    // The Movie Database (TMDb) - Requires API key  
    // Get free API key from: https://www.themoviedb.org/settings/api
    TMDB: {
      API_KEY: process.env.REACT_APP_TMDB_API_KEY,
      BASE_URL: 'https://api.themoviedb.org/3',
      IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500',
      name: 'The Movie Database'
    },
    
    // Free alternatives (no API key required)
    FREE_APIS: {
      // Movie Database API (GitHub project - no key required)
      MOVIE_DB: 'https://movie-database-alternative-imdb-api.p.rapidapi.com',
      // TVMaze API (for some movie data)
      TVMAZE: 'https://api.tvmaze.com',
      name: 'Free APIs'
    }
  };
  
  /**
   * Fetch movie details from OMDb API
   * @param {string} movieId - IMDb ID (e.g., 'tt0111161') or movie title
   * @param {boolean} isTitle - Whether the movieId is a title (default: false)
   * @returns {Promise<Object>} - Standardized movie data
   */
  export const fetchFromOMDbAPI = async (movieId, isTitle = false) => {
    const apiKey = MOVIE_API_CONFIG.OMDB.API_KEY;
    
    if (!apiKey || apiKey === 'undefined') {
      throw new Error('OMDb API key not configured. Please set REACT_APP_OMDB_API_KEY in your environment variables.');
    }
    
    const searchParam = isTitle ? `t=${encodeURIComponent(movieId)}` : `i=${movieId}`;
    const url = `${MOVIE_API_CONFIG.OMDB.BASE_URL}?apikey=${apiKey}&${searchParam}&plot=full`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.Response === 'False') {
        throw new Error(data.Error || 'Movie not found in OMDb');
      }
      
      return {
        id: data.imdbID,
        title: data.Title,
        year: data.Year,
        genre: data.Genre,
        director: data.Director,
        cast: data.Actors,
        plot: data.Plot,
        poster: data.Poster !== 'N/A' ? data.Poster : null,
        rating: data.imdbRating !== 'N/A' ? data.imdbRating : null,
        runtime: data.Runtime !== 'N/A' ? data.Runtime : null,
        released: data.Released !== 'N/A' ? data.Released : null,
        country: data.Country !== 'N/A' ? data.Country : null,
        language: data.Language !== 'N/A' ? data.Language : null,
        awards: data.Awards !== 'N/A' ? data.Awards : null,
        imdbVotes: data.imdbVotes !== 'N/A' ? data.imdbVotes : null,
        boxOffice: data.BoxOffice !== 'N/A' ? data.BoxOffice : null,
        metascore: data.Metascore !== 'N/A' ? data.Metascore : null,
        source: 'OMDb API'
      };
    } catch (error) {
      console.error('OMDb API Error:', error);
      throw error;
    }
  };
  
  /**
   * Fetch movie details from TMDb API
   * @param {string} movieId - TMDb movie ID or IMDb ID
   * @param {boolean} isSearch - Whether to search by title (default: false)
   * @returns {Promise<Object>} - Standardized movie data
   */
  export const fetchFromTMDbAPI = async (movieId, isSearch = false) => {
    const apiKey = MOVIE_API_CONFIG.TMDB.API_KEY;
    
    if (!apiKey || apiKey === 'undefined') {
      throw new Error('TMDb API key not configured. Please set REACT_APP_TMDB_API_KEY in your environment variables.');
    }
    
    try {
      let movieData;
      
      if (isSearch) {
        // Search for movie by title
        const searchUrl = `${MOVIE_API_CONFIG.TMDB.BASE_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(movieId)}`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();
        
        if (!searchResponse.ok || !searchData.results || searchData.results.length === 0) {
          throw new Error('Movie not found in TMDb');
        }
        
        movieData = searchData.results[0];
      } else {
        // Get movie by ID
        const url = `${MOVIE_API_CONFIG.TMDB.BASE_URL}/movie/${movieId}?api_key=${apiKey}&language=en-US`;
        const response = await fetch(url);
        movieData = await response.json();
        
        if (!response.ok) {
          throw new Error(movieData.status_message || 'Movie not found in TMDb');
        }
      }
      
      // Fetch additional details (credits)
      const creditsUrl = `${MOVIE_API_CONFIG.TMDB.BASE_URL}/movie/${movieData.id}/credits?api_key=${apiKey}`;
      const creditsResponse = await fetch(creditsUrl);
      const creditsData = await creditsResponse.json();
      
      return {
        id: movieData.id,
        imdbId: movieData.imdb_id,
        title: movieData.title,
        year: movieData.release_date ? new Date(movieData.release_date).getFullYear() : null,
        genre: movieData.genres?.map(g => g.name).join(', '),
        director: creditsData.crew?.find(person => person.job === 'Director')?.name,
        cast: creditsData.cast?.slice(0, 5).map(actor => actor.name).join(', '),
        plot: movieData.overview,
        poster: movieData.poster_path ? `${MOVIE_API_CONFIG.TMDB.IMAGE_BASE_URL}${movieData.poster_path}` : null,
        backdrop: movieData.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movieData.backdrop_path}` : null,
        rating: movieData.vote_average,
        runtime: movieData.runtime ? `${movieData.runtime} min` : null,
        released: movieData.release_date,
        language: movieData.original_language?.toUpperCase(),
        popularity: movieData.popularity,
        voteCount: movieData.vote_count,
        budget: movieData.budget > 0 ? `${movieData.budget.toLocaleString()}` : null,
        revenue: movieData.revenue > 0 ? `${movieData.revenue.toLocaleString()}` : null,
        source: 'The Movie Database'
      };
    } catch (error) {
      console.error('TMDb API Error:', error);
      throw error;
    }
  };
  
  /**
   * Search for movies using free APIs (no API key required)
   * @param {string} query - Movie title to search for
   * @returns {Promise<Object>} - Standardized movie data
   */
  export const fetchFromFreeAPI = async (query) => {
    try {
      // Try TVMaze API first (works well for some movies/shows)
      const tvMazeUrl = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`;
      const tvMazeResponse = await fetch(tvMazeUrl);
      const tvMazeData = await tvMazeResponse.json();
      
      if (tvMazeData && tvMazeData.length > 0) {
        const show = tvMazeData[0].show;
        return {
          id: show.id,
          title: show.name,
          year: show.premiered ? new Date(show.premiered).getFullYear() : null,
          genre: show.genres?.join(', '),
          plot: show.summary?.replace(/<[^>]*>/g, ''), // Remove HTML tags
          poster: show.image?.medium || show.image?.original,
          rating: show.rating?.average,
          runtime: show.runtime ? `${show.runtime} min` : null,
          released: show.premiered,
          language: show.language,
          network: show.network?.name,
          status: show.status,
          source: 'TVMaze API'
        };
      }
      
      // If no results from TVMaze, return a basic structure
      throw new Error('No results found in free APIs');
      
    } catch (error) {
      console.error('Free API Error:', error);
      throw error;
    }
  };
  
  /**
   * Main function to fetch movie details from any available API
   * @param {string} movieId - Movie identifier (IMDb ID, TMDb ID, or title)
   * @param {Object} options - Configuration options
   * @returns {Promise<Object>} - Standardized movie data
   */
  export const fetchMovieDetails = async (movieId, options = {}) => {
    const {
      preferredAPI = 'auto', // 'omdb', 'tmdb', 'free', or 'auto'
      isTitle = false,
      fallback = true
    } = options;
    
    const errors = [];
    
    // Helper function to try an API and handle errors
    const tryAPI = async (apiFunction, ...args) => {
      try {
        return await apiFunction(...args);
      } catch (error) {
        errors.push(error.message);
        return null;
      }
    };
    
    // Determine API order based on preference
    let apiOrder = [];
    
    if (preferredAPI === 'omdb' || preferredAPI === 'auto') {
      apiOrder.push(() => tryAPI(fetchFromOMDbAPI, movieId, isTitle));
    }
    
    if (preferredAPI === 'tmdb' || preferredAPI === 'auto') {
      apiOrder.push(() => tryAPI(fetchFromTMDbAPI, movieId, isTitle));
    }
    
    if (preferredAPI === 'free' || preferredAPI === 'auto') {
      apiOrder.push(() => tryAPI(fetchFromFreeAPI, movieId));
    }
    
    // Try APIs in order
    for (const apiCall of apiOrder) {
      const result = await apiCall();
      if (result) {
        return result;
      }
    }
    
    // If all APIs failed, throw an error with all error messages
    throw new Error(`All movie APIs failed: ${errors.join(', ')}`);
  };
  
  /**
   * Search for multiple movies
   * @param {string} query - Search query
   * @param {string} api - Which API to use ('omdb', 'tmdb', 'free')
   * @returns {Promise<Array>} - Array of movie results
   */
  export const searchMovies = async (query, api = 'tmdb') => {
    try {
      if (api === 'tmdb') {
        const apiKey = MOVIE_API_CONFIG.TMDB.API_KEY;
        if (!apiKey || apiKey === 'undefined') {
          throw new Error('TMDb API key required for search');
        }
        
        const url = `${MOVIE_API_CONFIG.TMDB.BASE_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=1`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error('Search failed');
        }
        
        return data.results.map(movie => ({
          id: movie.id,
          imdbId: movie.imdb_id,
          title: movie.title,
          year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
          poster: movie.poster_path ? `${MOVIE_API_CONFIG.TMDB.IMAGE_BASE_URL}${movie.poster_path}` : null,
          plot: movie.overview,
          rating: movie.vote_average,
          popularity: movie.popularity,
          source: 'TMDb Search'
        }));
      }
      
      // Add other API search implementations here
      throw new Error(`Search not implemented for ${api} API`);
      
    } catch (error) {
      console.error('Movie search error:', error);
      throw error;
    }
  };
  
  /**
   * Utility to check which APIs are configured
   * @returns {Object} - Status of each API
   */
  export const getAPIStatus = () => {
    return {
      omdb: {
        configured: !!(MOVIE_API_CONFIG.OMDB.API_KEY && MOVIE_API_CONFIG.OMDB.API_KEY !== 'undefined'),
        name: MOVIE_API_CONFIG.OMDB.name
      },
      tmdb: {
        configured: !!(MOVIE_API_CONFIG.TMDB.API_KEY && MOVIE_API_CONFIG.TMDB.API_KEY !== 'undefined'),
        name: MOVIE_API_CONFIG.TMDB.name
      },
      free: {
        configured: true, // Free APIs don't need configuration
        name: MOVIE_API_CONFIG.FREE_APIS.name
      }
    };
  };
  
  // Export default configuration
  export default {
    fetchMovieDetails,
    searchMovies,
    getAPIStatus,
    fetchFromOMDbAPI,
    fetchFromTMDbAPI,
    fetchFromFreeAPI,
    MOVIE_API_CONFIG
  };