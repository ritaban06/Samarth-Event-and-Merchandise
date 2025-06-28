import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import samarthLogo from "../images/samarth_logo_white.png";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import PropTypes from "prop-types";

const Login = ({ setIsLoggedIn }) => {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  // Function to handle redirect after successful login
  const handleSuccessfulLogin = () => {
    const from = location.state?.from || '/';
    const eventId = location.state?.eventId;
    
    setIsLoggedIn(true);
    
    if (from === '/events' && eventId) {
      navigate('/events', { state: { scrollToEvent: eventId } });
    } else {
      navigate(from);
    }
  };

  // Google Authentication
  const responseGoogle = async (authResult) => {
    try {
      if (!authResult?.code) {
        throw new Error("Google authentication failed - No code received");
      }

      const result = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: authResult.code })
      });

      if (!result.ok) {
        const errorData = await result.json();
        throw new Error(errorData.error || 'Google authentication failed');
      }

      const data = await result.json();
      localStorage.setItem("token", data.token);
      
      // Update this section to properly store userName
      updateUser({
        userName: data.user.userName,  // Make sure this matches what the backend sends
        email: data.user.email,
        uid: data.user.uid
      });

      handleSuccessfulLogin(); // Use the new redirect handler
    } catch (error) {
      console.error('Google auth error:', error);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: (error) => {
      console.error('Google Login Error:', error);
    },
    flow: 'auth-code'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleLogin = async (credentials) => {
    try {
      // Use the correct API URL format
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      // First verify credentials - note the /api prefix is already in API_URL
      const response = await axios.post(`${API_URL}/auth/verify`, {
        email: credentials.email,
        password: credentials.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true // Important for CORS
      });

      if (!response.data || !response.data.token) {
        throw new Error('Invalid response from server');
      }

      const { token } = response.data;
      localStorage.setItem('token', token);

      // Get user data
      const userResponse = await axios.post(`${API_URL}/auth/datafetch`, {}, {
        headers: {
          'auth-token': token,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      const userData = userResponse.data;

      if (!userData || !userData.uid || !userData.email) {
        localStorage.removeItem('token');
        throw new Error('Invalid user data received');
      }

      // Update user context and localStorage
      const userToStore = {
        uid: userData.uid,
        email: userData.email,
        userName: userData.userName || userData.email.split('@')[0]
      };

      updateUser(userToStore);
      localStorage.setItem('user', JSON.stringify(userToStore));
      handleSuccessfulLogin();
    } catch (error) {
      console.error('Login error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Unable to connect to server. Please check your internet connection or try again later.');
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Login failed. Please check your credentials.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await handleLogin(form);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 w-full h-full bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 overflow-y-auto"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.3)_0,rgba(0,0,0,0)_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      
      {/* Content container */}
      <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-6xl bg-black/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-500/20 overflow-hidden"
        >
          <div className="flex flex-col md:flex-row">
            {/* Left Section - Only visible on md and up */}
            <div className="hidden md:flex md:w-1/2 flex-col justify-between p-6 lg:p-8 bg-gradient-to-br from-blue-900/50 to-transparent">
              {/* Logo and title for larger screens */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative flex flex-col items-center"
              >
                <Link to="/" className="block">
                  <motion.h1 
                    className="text-4xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-400 to-purple-300 tracking-tight"
                    animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  >
                    SAFALYA
                  </motion.h1>
                </Link>
              </motion.div>

              {/* Logo image section */}
              <motion.div 
                className="text-center my-4 lg:my-8 relative"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <img 
                  src={samarthLogo} 
                  alt="Safalya Logo" 
                  className="mx-auto w-48 md:w-64 lg:w-96 drop-shadow-2xl relative z-10" 
                />
              </motion.div>
            </div>

            {/* Right Section - Form */}
            <div className="w-full md:w-1/2 p-6 lg:p-12 overflow-y-auto">
              {/* Mobile logo - Only visible on small screens */}
              <div className="flex md:hidden justify-center mb-6">
                <Link to="/" className="relative">
                  <motion.h1 
                    className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-400 to-purple-300"
                  >
                    SAFALYA
                  </motion.h1>
                </Link>
              </div>

              {/* Form content */}
              <h2 className="text-2xl lg:text-3xl font-bold text-purple-100 text-center mb-2">
                Login
              </h2>
              <p className="text-sm text-purple-200/80 text-center mb-6">
                Don't have an account? 
                <Link to="/register" className="text-purple-500"> Create account</Link>
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="text-red-500 text-sm text-center mb-4">
                    {error}
                  </div>
                )}
                <input 
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-purple-900/20 border border-purple-500/20 rounded-xl text-purple-100 placeholder-purple-300/40 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all duration-300"
                  required
                />
                
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 bg-purple-900/20 border border-purple-500/20 rounded-xl text-purple-100 placeholder-purple-300/40 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all duration-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1.5 text-purple-300/60 hover:text-purple-200 transition-colors">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl hover:opacity-90 transition-all duration-300 font-semibold relative overflow-hidden disabled:opacity-70"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    "Login"
                  )}
                </motion.button>
              </form>
              
              <div className="flex items-center my-6">
                <hr className="flex-grow border-purple-500/20" />
                <p className="text-sm text-purple-200/60 mx-4">Or continue with</p>
                <hr className="flex-grow border-purple-500/20" />
              </div>
              
              <motion.button 
                className="flex items-center justify-center w-full bg-purple-900/20 text-purple-100 py-3 rounded-xl hover:bg-purple-800/30 border border-purple-500/20 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={googleLogin}
              >
                <FcGoogle className="mr-2 text-xl" /> Continue with Google
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

Login.propTypes = {
  setIsLoggedIn: PropTypes.func.isRequired
};

export default Login;
