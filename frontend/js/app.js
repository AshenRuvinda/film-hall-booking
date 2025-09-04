// Simple routing based on hash or path
window.addEventListener('load', () => {
    route();
  });
  
  window.addEventListener('hashchange', route);
  
  function route() {
    const hash = window.location.hash.replace('#', '') || 'user/login';
    const [role, page] = hash.split('/');
    
    if (!localStorage.getItem('userRole') && page !== 'login') {
      window.location.hash = 'user/login';
      return;
    }
  
    const roleRoutes = {
      user: ['dashboard', 'movieDetail', 'seatSelection', 'bookingSummary', 'myBookings'],
      admin: ['dashboard', 'manageMovies', 'manageHalls', 'manageShowtimes', 'reports'],
      operator: ['dashboard', 'scanTicket'],
    };
  
    if (roleRoutes[role] && roleRoutes[role].includes(page)) {
      loadPage(role, page);
    } else if (page === 'login') {
      if (role === 'user') loadUserLogin();
      else loadStaffLogin();
    } else {
      window.location.hash = `${localStorage.getItem('userRole')}/dashboard`;
    }
  }
  
  function loadPage(role, page) {
    fetchPageContent(page, role);
    // Assume functions like loadUserDashboard() etc. are defined in respective files
  }
  
  // Include all other JS files
  const scripts = [
    'auth/login.js', 'auth/userLogin.js', 'auth/staffLogin.js',
    'user/dashboard.js', 'user/movieDetail.js', 'user/seatSelection.js', 'user/bookingSummary.js', 'user/myBookings.js',
    'admin/dashboard.js', 'admin/manageMovies.js', 'admin/manageHalls.js', 'admin/manageShowtimes.js', 'admin/reports.js',
    'operator/dashboard.js', 'operator/scanTicket.js',
    'components/navbar.js', 'components/footer.js', 'components/movieCard.js', 'components/seatMap.js', 'components/bookingCard.js', 'components/qrScanner.js'
  ];
  
  scripts.forEach(src => {
    const script = document.createElement('script');
    script.src = `js/${src}`;
    document.body.appendChild(script);
  });