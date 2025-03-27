import React from 'react';
import { Link } from 'react-router-dom';

function WebPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-blue-800 mb-4">Welcome to Our Platform</h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto">Experience the best service with our cutting-edge solutions.</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          to="/auth/login" 
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Login
        </Link>
        <Link 
          to="/auth/signup" 
          className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg shadow-md border border-blue-200 hover:bg-blue-50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}

export default WebPage;