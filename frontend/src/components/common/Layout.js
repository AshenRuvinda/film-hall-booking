// frontend/src/components/common/Layout.js - ENHANCED WITH CONDITIONAL NAVBAR
import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function Layout({ children }) {
  const location = useLocation();
  
  // Define routes where navbar should be hidden
  const hideNavbarRoutes = [
    '/login',
    '/register', 
    '/staff/login',
    '/staff/register',
    '/' // Also hide on root route since it redirects to login
  ];
  
  // Check if current route should hide navbar
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Conditionally render navbar */}
      {!shouldHideNavbar && <Navbar />}
      
      {/* Main content */}
      <main className={`flex-1 ${shouldHideNavbar ? 'min-h-screen' : 'min-h-[calc(100vh-4rem)]'}`}>
        {children}
      </main>
      
      {/* Conditionally render footer - only on pages with navbar */}
      {!shouldHideNavbar && <Footer />}
    </div>
  );
}

export default Layout;