import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import samarthLogo from "../images/samarth_logo_white.png";
import axios from "axios";

const Register = () => {
  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
    agreed: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validEmailDomains = [
    "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "aol.com",
    "icloud.com", "protonmail.com", "zoho.com", "mail.com", "proton.me"
  ];

  const isValidEmailDomain = (email) => {
    const domain = email.split("@")[1];
    return validEmailDomains.includes(domain);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate email domain
    if (!isValidEmailDomain(form.email)) {
      setError("Please use a valid email domain (e.g., gmail.com, yahoo.com).");
      setLoading(false);
      return;
    }

    try {
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP in localStorage with expiry (10 min)
        const expiryTime = new Date().getTime() + 10 * 60 * 1000;
        localStorage.setItem("otp", JSON.stringify({ value: otp, expiry: expiryTime }));

        // Send OTP to email
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/otp`, { email: form.email, otp: otp });

        // Check if the OTP was sent successfully
        if (res.data.success) {
            // Navigate to OTP verification page with required data
            navigate("/otp-verification", { state: { form, otp } });
        } else {
            setError("Failed to send OTP. Please try again.");
        }

    } catch (error) {
        console.error("Error generating OTP:", error);
        setError("Failed to generate OTP. Try again.");
    } finally {
        setLoading(false);
    }
};


  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 w-full h-full bg-gradient-to-br from-purple-950 via-purple-900 to-slate-900 overflow-y-auto"
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
            <div className="hidden md:flex md:w-1/2 flex-col justify-between p-6 lg:p-8 bg-gradient-to-br from-purple-900/50 to-transparent">
              {/* Logo and title */}
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
                <img 
                  src={samarthLogo} 
                  alt="Safalya Logo" 
                  className="mx-auto w-48 md:w-64 lg:w-96 drop-shadow-2xl relative z-10" 
                />
              </motion.div>
            </div>

            {/* Right Section for Registration Form */}
            <div className="flex-1 p-8">
              <h2 className="text-2xl font-bold text-center mb-6 text-white">Create New Account</h2>
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                  type="text"
                  name="userName"
                  value={form.userName}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    if (/^[A-Za-z ]*$/.test(value)) {
                      setForm((prev) => ({ ...prev, [name]: value }));
                    }
                  }}
                  placeholder="Full Name"
                  pattern="^[A-Za-z ]+$"
                  title="Only letters and spaces are allowed. Numbers and symbols are not allowed."
                  className="w-full px-4 py-3 bg-purple-900/20 border border-purple-500/20 rounded-xl text-purple-100 placeholder-purple-300/40 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all duration-300"
                  required
                />
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
                    placeholder="Password"
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
                <div className="flex items-center">
                  <input 
                    type="checkbox"
                    name="agreed"
                    checked={form.agreed}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-purple-500/20 bg-purple-900/20 text-purple-500 focus:ring-purple-400 focus:ring-offset-0"
                    required
                  />
                  <label className="text-sm text-purple-200/80 ml-2">
                    I agree to the <Link to="/terms" className="text-purple-500">Terms & Conditions</Link>
                  </label>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/20 transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    "Register"
                  )}
                </motion.button>
              </form>
              <p className="text-sm text-purple-200/60 text-center mt-4">
                Already have an account? <Link to="/login" className="text-purple-500">Log in</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Register; 
