const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const operatorRoutes = require('./routes/operatorRoutes');
const movieRoutes = require('./routes/movieRoutes');
const showtimeRoutes = require('./routes/showtimeRoutes');
const dashboardRoutes = require('./routes/dashboard'); // NEW - Dashboard routes

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

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    touchAfter: 24 * 3600 // lazy session update
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.session.user) {
    console.log(`User: ${req.session.user.email} (${req.session.user.role})`);
  }
  next();
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    session: !!req.session.user 
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!', 
    session: !!req.session.user,
    user: req.session.user || null
  });
});

// Routes - ORDER MATTERS! More specific routes should come first
app.use('/api/movies', movieRoutes);
app.use('/api/showtimes', showtimeRoutes);

// Dashboard routes - NEW
app.use('/api', dashboardRoutes); // This handles /api/stats, /api/halls, /api/bookings, /api/users

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/operator', operatorRoutes);

// 404 handler
app.use('/api/*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    msg: 'Route not found',
    path: req.path,
    method: req.method,
    availableRoutes: [
      'GET /api/movies',
      'GET /api/movies/:id', 
      'GET /api/showtimes/movie/:movieId',
      'GET /api/halls',
      'GET /api/bookings',
      'GET /api/users',
      'GET /api/stats',
      'GET /api/auth/check',
      'POST /api/auth/login',
      'POST /api/auth/register'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    msg: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🔗 Backend URL: http://localhost:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('📋 Available routes:');
  console.log('   GET /api/movies');
  console.log('   GET /api/movies/:id');
  console.log('   GET /api/showtimes/movie/:movieId');
  console.log('   GET /api/halls');
  console.log('   GET /api/bookings');
  console.log('   GET /api/users');
  console.log('   GET /api/stats');
  console.log('   GET /api/auth/check');
  console.log('   POST /api/auth/login');
  console.log('   POST /api/auth/register');
});