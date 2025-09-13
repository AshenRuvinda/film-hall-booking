// backend/server.js - CLEAN VERSION WITH FIXED ROUTES
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    touchAfter: 24 * 3600
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// ===== ROOT ROUTE =====
app.get('/', (req, res) => {
  res.json({
    message: 'Film Hall Booking System API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      movies: '/api/movies',
      showtimes: '/api/showtimes',
      halls: '/api/halls',
      auth: '/api/auth/*',
      user: '/api/user/*',
      admin: '/api/admin/*'
    }
  });
});

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    session: !!req.session.user,
    environment: process.env.NODE_ENV || 'development'
  });
});

// ===== LOAD ROUTES =====
try {
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/auth', authRoutes);
} catch (err) {
  console.warn('Auth routes not found');
}

try {
  const movieRoutes = require('./routes/movieRoutes');
  app.use('/api/movies', movieRoutes);
} catch (err) {
  console.warn('Movie routes not found');
  // Fallback endpoint
  app.get('/api/movies', (req, res) => {
    res.status(503).json({ message: 'Movie service unavailable' });
  });
}

try {
  const showtimeRoutes = require('./routes/showtimeRoutes');
  app.use('/api/showtimes', showtimeRoutes);
} catch (err) {
  console.warn('Showtime routes not found');
}

try {
  const userRoutes = require('./routes/userRoutes');
  app.use('/api/user', userRoutes);
} catch (err) {
  console.warn('User routes not found');
}

try {
  const adminRoutes = require('./routes/adminRoutes');
  app.use('/api/admin', adminRoutes);
} catch (err) {
  console.warn('Admin routes not found');
}

try {
  const operatorRoutes = require('./routes/operatorRoutes');
  app.use('/api/operator', operatorRoutes);
} catch (err) {
  console.warn('Operator routes not found');
}

// Dashboard routes for stats
try {
  const dashboardRoutes = require('./routes/dashboard');
  app.use('/api', dashboardRoutes); // This handles /api/stats, /api/halls, etc.
} catch (err) {
  console.warn('Dashboard routes not found');
}

// Public routes (if you have separate public routes)
try {
  const publicRoutes = require('./routes/publicRoutes');
  app.use('/api/public', publicRoutes);
} catch (err) {
  console.warn('Public routes not found');
}

// ===== FALLBACK ROUTE HANDLERS =====

// Fallback stats endpoint (if dashboard routes don't work)
app.get('/api/stats', async (req, res) => {
  try {
    const stats = {
      totalMovies: 0,
      totalHalls: 0,
      totalBookings: 0,
      totalUsers: 0,
      activeShowtimes: 0,
      totalRevenue: 0
    };

    // Try to get actual data
    try {
      const Hall = require('./models/Hall');
      stats.totalHalls = await Hall.countDocuments({ status: 'active' });
    } catch (e) {
      stats.totalHalls = 0;
    }

    try {
      const Movie = require('./models/Movie');
      stats.totalMovies = await Movie.countDocuments({ status: 'active' });
    } catch (e) {
      stats.totalMovies = 0;
    }

    try {
      const User = require('./models/User');
      stats.totalUsers = await User.countDocuments({ role: 'user' });
    } catch (e) {
      stats.totalUsers = 0;
    }

    try {
      const Booking = require('./models/Booking');
      stats.totalBookings = await Booking.countDocuments();
      
      const revenueResult = await Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'checked-in'] } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]);
      stats.totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    } catch (e) {
      stats.totalBookings = 0;
      stats.totalRevenue = 0;
    }

    try {
      const Showtime = require('./models/Showtime');
      const currentDate = new Date();
      stats.activeShowtimes = await Showtime.countDocuments({ 
        endTime: { $gte: currentDate } 
      });
    } catch (e) {
      stats.activeShowtimes = 0;
    }

    res.json({
      success: true,
      stats: stats,
      message: 'Statistics retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in /api/stats endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Fallback halls endpoint
app.get('/api/halls', async (req, res) => {
  try {
    const Hall = require('./models/Hall');
    const halls = await Hall.find({ status: 'active' })
      .select('name location totalSeats status features pricing dimensions seatBlocks boxSeats');
    
    const formattedHalls = halls.map(hall => ({
      _id: hall._id,
      name: hall.name || 'Unnamed Theater',
      location: hall.location || 'Location TBD',
      totalSeats: hall.totalSeats || 0,
      status: hall.status || 'active',
      features: Array.isArray(hall.features) ? hall.features : [],
      pricing: {
        regular: (hall.pricing && hall.pricing.regular) ? hall.pricing.regular : 15,
        premium: (hall.pricing && hall.pricing.premium) ? hall.pricing.premium : 20,
        box: (hall.pricing && hall.pricing.box) ? hall.pricing.box : 25
      },
      dimensions: {
        width: (hall.dimensions && hall.dimensions.width) ? hall.dimensions.width : 20,
        height: (hall.dimensions && hall.dimensions.height) ? hall.dimensions.height : 15
      },
      seatBlocks: Array.isArray(hall.seatBlocks) ? hall.seatBlocks : [],
      boxSeats: Array.isArray(hall.boxSeats) ? hall.boxSeats : []
    }));
    
    res.json(formattedHalls);
    
  } catch (error) {
    console.error('Error in /api/halls endpoint:', error);
    res.status(500).json({ 
      message: 'Unable to fetch theaters at this time',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// ===== UNKNOWN API ROUTES HANDLER =====
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    message: 'API route not found',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/stats',
      'GET /api/halls',
      'GET /api/movies',
      'GET /api/showtimes',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/auth/check'
    ]
  });
});

// ===== GLOBAL ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Film Hall Booking System API`);
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health Check: http://localhost:${PORT}/api/health\n`);
});