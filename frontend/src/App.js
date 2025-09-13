// frontend/src/App.js - ENHANCED WITH SUPPORT ROUTES AND ABOUT US
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth pages
import UserLogin from './pages/auth/UserLogin';
import UserRegister from './pages/auth/UserRegister';
import StaffLogin from './pages/auth/StaffLogin';
import StaffRegister from './pages/auth/StaffRegister';

// User pages
import UserDashboard from './pages/user/Dashboard';
import MovieDetail from './pages/user/MovieDetail';
import SeatSelection from './pages/user/SeatSelection';
import BookingSummary from './pages/user/BookingSummary';
import MyBookings from './pages/user/MyBookings';
import AboutUs from './pages/user/AboutUs';
import Profile from './pages/user/Profile';
import Settings from './pages/user/Settings';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageMovies from './pages/admin/ManageMovies';
import ManageHalls from './pages/admin/ManageHalls';
import ManageShowtimes from './pages/admin/ManageShowtimes';
import Reports from './pages/admin/Reports';

// Operator pages
import OperatorDashboard from './pages/operator/Dashboard';
import ScanTicket from './pages/operator/ScanTicket';

// Support pages
import ContactUs from './pages/support/ContactUs';
import TermsConditions from './pages/support/TermsConditions';
import PrivacyPolicy from './pages/support/PrivacyPolicy';
import RefundPolicy from './pages/support/RefundPolicy';

// Error pages
import NotFound from './pages/common/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Public/Auth routes - No navbar */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/register" element={<UserRegister />} />
            <Route path="/staff/login" element={<StaffLogin />} />
            <Route path="/staff/register" element={<StaffRegister />} />
            
            {/* User routes - With navbar */}
            <Route path="/user/dashboard" element={
              <ProtectedRoute requiredRole="user">
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/user/movie/:id" element={
              <ProtectedRoute requiredRole="user">
                <MovieDetail />
              </ProtectedRoute>
            } />
            <Route path="/user/seat-selection/:showtimeId" element={
              <ProtectedRoute requiredRole="user">
                <SeatSelection />
              </ProtectedRoute>
            } />
            <Route path="/user/booking-summary/:bookingId" element={
              <ProtectedRoute requiredRole="user">
                <BookingSummary />
              </ProtectedRoute>
            } />
            <Route path="/user/bookings" element={
              <ProtectedRoute requiredRole="user">
                <MyBookings />
              </ProtectedRoute>
            } />
            <Route path="/user/about" element={
              <ProtectedRoute requiredRole="user">
                <AboutUs />
              </ProtectedRoute>
            } />
            <Route path="/user/profile" element={
              <ProtectedRoute requiredRole="user">
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/user/settings" element={
              <ProtectedRoute requiredRole="user">
                <Settings />
              </ProtectedRoute>
            } />
            
            {/* Admin routes - With navbar */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/movies" element={
              <ProtectedRoute requiredRole="admin">
                <ManageMovies />
              </ProtectedRoute>
            } />
            <Route path="/admin/halls" element={
              <ProtectedRoute requiredRole="admin">
                <ManageHalls />
              </ProtectedRoute>
            } />
            <Route path="/admin/showtimes" element={
              <ProtectedRoute requiredRole="admin">
                <ManageShowtimes />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute requiredRole="admin">
                <Reports />
              </ProtectedRoute>
            } />
            
            {/* Operator routes - With navbar */}
            <Route path="/operator/dashboard" element={
              <ProtectedRoute requiredRole="operator">
                <OperatorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/operator/scan-ticket" element={
              <ProtectedRoute requiredRole="operator">
                <ScanTicket />
              </ProtectedRoute>
            } />
            
            {/* Support routes - Public access with navbar */}
            <Route path="/support/contact" element={<ContactUs />} />
            <Route path="/support/terms" element={<TermsConditions />} />
            <Route path="/support/privacy" element={<PrivacyPolicy />} />
            <Route path="/support/refund" element={<RefundPolicy />} />
            
            {/* 404 Not Found - With navbar */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;