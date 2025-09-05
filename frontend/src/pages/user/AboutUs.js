// frontend/src/pages/user/AboutUs.js
import React from 'react';
import { Info } from 'lucide-react';

function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-full">
                  <Info size={32} className="text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">About Us</h1>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto"></div>
            </div>
            
            <div className="text-center">
              <p className="text-lg text-gray-600">
                This is about us
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;