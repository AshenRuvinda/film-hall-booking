// frontend/src/pages/user/AboutUs.js
import React, { useState } from 'react';
import { Info, Film, Users, Code, Database, Server, Globe, Star, Clock, Shield } from 'lucide-react';

function AboutUs() {
  const [selectedSection, setSelectedSection] = useState('website');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-full">
                <Info size={32} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About Us</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto"></div>
          </div>

          {/* Section Selection Tabs */}
          <div className="bg-white rounded-xl shadow-lg p-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setSelectedSection('website')}
                className={`flex items-center justify-center space-x-3 px-6 py-4 rounded-lg text-sm font-medium transition-all duration-300 flex-1 ${
                  selectedSection === 'website'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Film size={20} />
                <span>About Website</span>
              </button>
              
              <button
                onClick={() => setSelectedSection('developers')}
                className={`flex items-center justify-center space-x-3 px-6 py-4 rounded-lg text-sm font-medium transition-all duration-300 flex-1 ${
                  selectedSection === 'developers'
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Users size={20} />
                <span>Developers & Tech Stack</span>
              </button>
            </div>
          </div>

          {/* Content Sections */}
          <div className="transition-all duration-500 ease-in-out">
            {selectedSection === 'website' && (
              <div className="bg-white rounded-xl shadow-xl p-8 animate-fadeIn">
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-full">
                      <Film size={28} className="text-white" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">About Ticket.LK</h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto"></div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                      Ticket.LK is Sri Lanka's premier online movie ticket booking platform, designed to revolutionize 
                      how you experience cinema. We provide a seamless, user-friendly interface that allows movie 
                      enthusiasts to discover, book, and manage their cinema experiences with just a few clicks.
                    </p>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      Our platform connects you with the latest movies, showtimes, and theaters across Sri Lanka, 
                      ensuring you never miss out on your favorite films. From blockbuster releases to indie gems, 
                      we've got your entertainment covered.
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Star size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Premium Experience</h3>
                        <p className="text-gray-600">Easy seat selection, multiple payment options, and instant booking confirmation.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Clock size={24} className="text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Real-time Updates</h3>
                        <p className="text-gray-600">Live showtimes, seat availability, and instant notifications for your bookings.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Shield size={24} className="text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
                        <p className="text-gray-600">Your data and payments are protected with industry-standard security measures.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedSection === 'developers' && (
              <div className="bg-white rounded-xl shadow-xl p-8 animate-fadeIn">
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    <div className="bg-gradient-to-br from-green-500 to-blue-500 p-3 rounded-full">
                      <Users size={28} className="text-white" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Development Team</h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto"></div>
                </div>

                {/* Developer Profiles */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  {/* Developer 1 - Full-stack */}
                  <div className="text-center">
                    <div className="relative mb-6">
                      <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                        <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                            <Users size={40} className="text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Full-stack
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Developer 1</h3>
                    <p className="text-blue-600 font-medium mb-4">Full-stack Developer</p>
                    <div className="space-y-2 text-gray-600">
                      <p>• Backend API Development</p>
                      <p>• Database Design & Management</p>
                      <p>• Server Architecture</p>
                      <p>• Authentication & Security</p>
                      <p>• Payment Integration</p>
                    </div>
                  </div>

                  {/* Developer 2 - Frontend */}
                  <div className="text-center">
                    <div className="relative mb-6">
                      <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-1">
                        <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
                            <Users size={40} className="text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <div className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Frontend
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Developer 2</h3>
                    <p className="text-pink-600 font-medium mb-4">Frontend Developer</p>
                    <div className="space-y-2 text-gray-600">
                      <p>• User Interface Design</p>
                      <p>• React Component Development</p>
                      <p>• Responsive Web Design</p>
                      <p>• User Experience Optimization</p>
                      <p>• Frontend Performance</p>
                    </div>
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="border-t border-gray-200 pt-8">
                  <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                      <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-full">
                        <Code size={28} className="text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Technology Stack</h3>
                    <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto"></div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {/* MongoDB */}
                    <div className="text-center">
                      <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Database size={28} className="text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">MongoDB</h4>
                      <p className="text-sm text-gray-600">Database</p>
                    </div>

                    {/* Express.js */}
                    <div className="text-center">
                      <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Server size={28} className="text-gray-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">Express.js</h4>
                      <p className="text-sm text-gray-600">Backend</p>
                    </div>

                    {/* React */}
                    <div className="text-center">
                      <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Globe size={28} className="text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">React</h4>
                      <p className="text-sm text-gray-600">Frontend</p>
                    </div>

                    {/* Node.js */}
                    <div className="text-center">
                      <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Server size={28} className="text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">Node.js</h4>
                      <p className="text-sm text-gray-600">Runtime</p>
                    </div>
                  </div>

                  {/* TMDB API */}
                  <div className="mt-8 text-center">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <div className="flex justify-center mb-4">
                        <div className="bg-yellow-500 p-2 rounded-full">
                          <Film size={24} className="text-white" />
                        </div>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">TMDB API Integration</h4>
                      <p className="text-gray-600">
                        Powered by The Movie Database (TMDB) API for real-time movie information, 
                        posters, ratings, and detailed movie metadata.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default AboutUs;