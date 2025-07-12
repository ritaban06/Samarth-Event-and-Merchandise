import React from 'react';

// Gradient Button Component
export const GradientButton = ({ 
  children, 
  onClick, 
  className = "", 
  variant = "primary",
  disabled = false,
  ...props 
}) => {
  const baseClasses = "px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50";
  
  const variants = {
    primary: "bg-gradient-to-r from-purple-900 to-purple-700 hover:from-purple-800 hover:to-purple-600 shadow-lg hover:shadow-purple-900/25",
    secondary: "bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-indigo-800/25",
    accent: "bg-gradient-to-r from-pink-900 to-purple-800 hover:from-pink-800 hover:to-purple-700 shadow-lg hover:shadow-pink-900/25",
    glass: "bg-gradient-to-r from-white/10 to-purple-900/20 backdrop-blur-md border border-white/20 hover:from-white/20 hover:to-purple-800/30",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Gradient Card Component
export const GradientCard = ({ 
  children, 
  className = "", 
  variant = "default",
  hover = true 
}) => {
  const baseClasses = "rounded-xl backdrop-blur-md border border-white/20 transition-all duration-300";
  
  const variants = {
    default: "bg-gradient-to-br from-white/5 to-purple-900/10",
    glass: "bg-gradient-to-br from-white/3 to-purple-900/5",
    solid: "bg-gradient-to-br from-purple-950/50 to-purple-900/50",
    neon: "bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700/30",
  };

  const hoverEffect = hover ? "hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20" : "";

  return (
    <div className={`${baseClasses} ${variants[variant]} ${hoverEffect} ${className}`}>
      {children}
    </div>
  );
};

// Gradient Text Component
export const GradientText = ({ 
  children, 
  className = "", 
  variant = "primary" 
}) => {
  const variants = {
    primary: "bg-gradient-to-r from-purple-300 to-purple-400",
    secondary: "bg-gradient-to-r from-indigo-300 to-purple-300",
    accent: "bg-gradient-to-r from-pink-300 to-purple-300",
    rainbow: "bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300",
  };

  return (
    <span className={`${variants[variant]} bg-clip-text text-transparent font-bold ${className}`}>
      {children}
    </span>
  );
};

// Floating Gradient Orb Component
export const FloatingOrb = ({ 
  size = "200", 
  color = "purple", 
  opacity = "0.3",
  className = "",
  animationDuration = "6s"
}) => {
  const colors = {
    purple: "from-purple-700 to-purple-800",
    pink: "from-pink-700 to-pink-800",
    blue: "from-indigo-700 to-indigo-800",
  };

  return (
    <div 
      className={`absolute rounded-full bg-gradient-to-r ${colors[color]} blur-xl ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        opacity: opacity,
        animation: `float ${animationDuration} ease-in-out infinite alternate`,
      }}
    />
  );
};

export default {
  GradientButton,
  GradientCard,
  GradientText,
  FloatingOrb,
};
