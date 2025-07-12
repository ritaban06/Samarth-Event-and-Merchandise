import PropTypes from 'prop-types';
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiMenu, FiX, FiUser, FiUsers } from "react-icons/fi";
// import GlowButton from "./GlowButton";
import samarthLogo from "../images/samarth_logo_white.webp";

export default function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    setIsLoggedIn(!!(token && userData));
  }, [setIsLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-blue-950/50 border-b border-white/20 filter backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <img loading="lazy" src={samarthLogo} alt="Logo" className="h-12" />
          <h1 className="text-2xl font-bold text-white">SAMARTH</h1>
        </Link>

        <button 
          className="md:hidden text-white p-2 rounded-lg hover:bg-white/20 transition-colors" 
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {menuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 md:hidden" 
            onClick={() => setMenuOpen(false)}
          />
        )}

        {/* Desktop & Mobile Menu */}
        <ul className={`absolute bg-[#121212] md:bg-transparent md:static top-16 left-0 w-full md:w-auto md:flex space-y-4 md:space-y-0 md:space-x-10 text-center md:text-left py-6 md:py-0 px-6 md:px-0 rounded-lg md:border-none transition-all duration-300 ease-in-out flex-auto justify-end items-center ${
          menuOpen ? 'translate-y-2 opacity-100' : '-translate-y-2 opacity-0 pointer-events-none md:translate-y-0 md:opacity-100 md:pointer-events-auto'
        }`}>
          <li>
            <Link to="/" className="block text-white hover:text-gray-300 transition py-2 md:py-0">Home</Link>
          </li>
          <li>
            <Link to="/events" className="block text-white hover:text-gray-300 transition py-2 md:py-0">Events</Link>
          </li>
          
          <li>
            <Link to="/profile" className="flex items-center justify-center text-white hover:text-gray-300 transition py-2 md:py-0">
              <FiUser size={24} className="mr-2" />
              Profile
            </Link>
          </li>

          
          {isLoggedIn ? (
            <li>
              <button 
                onClick={handleLogout} 
                className="block w-full text-red-500 hover:text-red-400 transition font-semibold py-2 flex-auto justify-center items-center bg-gradient-to-br from-blue-800 to bg-purple-950 border border-black rounded-3xl"
              >
                Logout
              </button>
            </li>
            
          ) : (
            <li>
              <Link to="/login" className="block text-white hover:text-gray-300 transition py-2 md:py-0">
                Login
              </Link>
            </li>
            
          )}
          
        </ul>
      </div>
    </nav>
  );
}

// PropTypes validation
Navbar.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  setIsLoggedIn: PropTypes.func.isRequired,
};
