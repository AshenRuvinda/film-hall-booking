import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/common/Layout';
import UserLogin from './pages/auth/UserLogin';
import UserRegister from './pages/auth/UserRegister';
import StaffLogin from './pages/auth/StaffLogin';
import StaffRegister from './pages/auth/StaffRegister';
import UserDashboard from './pages/user/Dashboard';
import MovieDetail from './pages/user/MovieDetail';
import SeatSelection from './pages/user/SeatSelection';
import BookingSummary from './pages/user/BookingSummary';
import MyBookings from './pages/user/MyBookings';
import AdminDashboard from './pages/admin/Dashboard';
import ManageMovies from './pages/admin/ManageMovies';
import ManageHalls from './pages/admin/ManageHalls';
import ManageShowtimes from './pages/admin/ManageShowtimes';
import Reports from './pages/admin/Reports';
import OperatorDashboard from './pages/operator/Dashboard';
import ScanTicket from './pages/operator/ScanTicket';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/login" element={<UserLogin />} />
            <Route path="/register" element={<UserRegister />} />
            <Route path="/staff/login" element={<StaffLogin />} />
            <Route path="/staff/register" element={<StaffRegister />} />
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/movie/:id" element={<MovieDetail />} />
            <Route path="/user/seat-selection/:showtimeId" element={<SeatSelection />} />
            <Route path="/user/booking-summary/:bookingId" element={<BookingSummary />} />
            <Route path="/user/bookings" element={<MyBookings />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/movies" element={<ManageMovies />} />
            <Route path="/admin/halls" element={<ManageHalls />} />
            <Route path="/admin/showtimes" element={<ManageShowtimes />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/operator/dashboard" element={<OperatorDashboard />} />
            <Route path="/operator/scan-ticket" element={<ScanTicket />} />
            <Route path="/" element={<UserDashboard />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;