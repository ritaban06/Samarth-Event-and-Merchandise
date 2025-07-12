import React from 'react';

const AnimatedGradientBackground = ({ children, className = "" }) => {
  return (
    <div className={`relative w-full min-h-screen ${className}`}>
      {/* Main Animated Dark Purple Gradient Background */}
      <div
        className="fixed top-0 left-0 w-full h-full"
        style={{
          background: "linear-gradient(135deg, #0A0015 0%, #1A0B2E 25%, #2D1B4E 50%, #3B1E5F 75%, #4C1D95 100%)",
          backgroundSize: "400% 400%",
          animation: "gradientShift 8s ease infinite",
          backgroundAttachment: "fixed",
        }}
      ></div>

      {/* Animated Dark Floating Orbs */}
      <div
        className="fixed top-0 left-0 w-full h-full"
        style={{
          background: "radial-gradient(circle at 20% 30%, rgba(59, 30, 95, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(76, 29, 149, 0.2) 0%, transparent 50%)",
          animation: "float 6s ease-in-out infinite alternate",
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AnimatedGradientBackground;
