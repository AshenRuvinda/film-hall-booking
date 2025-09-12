// frontend/src/components/common/Footer.js - COMPLETE FOOTER COMPONENT
import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white border-t border-gray-700">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Ticket.lk" 
                className="h-8 w-auto"
              />
            </div>
            <p className="text-gray-400 text-sm">
              Sri Lanka's premier online movie ticket booking platform. Experience the magic of cinema with ease and convenience.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/user/dashboard" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Now Showing
              </Link>
              <Link to="/user/bookings" className="block text-gray-400 hover:text-white transition-colors text-sm">
                My Bookings
              </Link>
              
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Support</h3>
            <div className="space-y-2">
              
              <a href="/support/terms" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Terms & Conditions
              </a>
              <a href="/support/privacy" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="/support/refund" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Refund Policy
              </a>
              <a href="/support/contact" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Contact Us
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin size={16} className="text-white-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  123 Galle Road, Colombo 03, Sri Lanka
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-white-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  +94 11 234 5678
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-white-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  support@ticket.lk
                </span>
              </div>
            </div>
            
            
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2025 Ticket.LK. All rights reserved. | Project Ticket.LK
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
              
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;