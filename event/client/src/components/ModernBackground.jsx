import React from 'react';

const ModernBackground = ({ children }) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 animate-gradient-x"></div>
      
      {/* Geometric patterns */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-amber-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-75"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-150"></div>
      </div>
      
      {/* Grid pattern overlay */}
      <div className="fixed inset-0 bg-grid-pattern opacity-30"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default ModernBackground;
