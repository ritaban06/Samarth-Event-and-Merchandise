import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import axios from "axios";
import PropTypes from 'prop-types';

const OtpVerification = ({ setIsLoggedIn }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [loading, setLoading] = useState(false);
  
  const inputRefs = useRef([]);
  const { form } = location.state || {};

  useEffect(() => {
    window.addEventListener("beforeunload", () => localStorage.removeItem("otp"));
    return () => window.removeEventListener("beforeunload", () => localStorage.removeItem("otp"));
  }, []);

  useEffect(() => {
    if (resendDisabled) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendDisabled]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only allow single digit
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus(); // Move to next box
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus(); // Move to previous box
    }
  };

  const validateOtp = async () => {
    setLoading(true);
    setError("");

    const storedOtpData = JSON.parse(localStorage.getItem("otp"));
    if (!storedOtpData || new Date().getTime() > storedOtpData.expiry) {
      setError("OTP expired. Please request a new one.");
      setLoading(false);
      return;
    }

    const enteredOtp = otp.join("");
    if (enteredOtp !== storedOtpData.value) {
      setError("Invalid OTP. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/newuserauth`, form);
      const user = response.data.user;
      setIsLoggedIn(true);
      localStorage.removeItem("otp");
      handleSuccessfulRegister(user);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    let storedOtpData = JSON.parse(localStorage.getItem("otp"));
    let res = "";

    if (storedOtpData && new Date().getTime() < storedOtpData.expiry) {
        //("Using existing OTP:", storedOtpData.value);
        res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/otp`, { email: form.email, otp: storedOtpData.value });
    } else {
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiryTime = new Date().getTime() + 10 * 60 * 1000;
        localStorage.setItem("otp", JSON.stringify({ value: newOtp, expiry: expiryTime }));
        //("Generated new OTP:", newOtp);
        res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/otp`, { email: form.email, otp: newOtp });
    }

    if (res.data.success) { // Assuming your API returns a success field
        setResendDisabled(true);
        setTimeLeft(60);
    } else {
        setError("Failed to send OTP. Please try again.");
    }
  };

  const handleSuccessfulRegister = (user) => {
    setIsLoggedIn(true);
    localStorage.setItem("token", user.token);

    updateUser({
      uid: user.uid,
      email: user.email,
      userName: user.userName || user.name,
    });

    navigate("/");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 w-full h-full bg-gradient-to-br from-purple-950 via-purple-900 to-slate-900 flex items-center justify-center"
    >
      <div className="max-w-md w-full bg-black/30 backdrop-blur-xl p-6 rounded-3xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-white mb-6">Enter OTP</h2>
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        <div className="flex justify-center space-x-3 mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              maxLength="1"
              className="w-12 h-12 text-center text-3xl font-bold text-white bg-purple-900/20 border border-purple-500/20 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none"
            />
          ))}
        </div>

        <button
          onClick={validateOtp}
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white font-semibold shadow-md transition-all ${
            loading ? "bg-gray-500 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <div className="flex justify-between items-center mt-4 text-sm text-purple-200/80">
          <span>Didn't receive OTP?</span>
          <button
            onClick={resendOtp}
            disabled={resendDisabled}
            className="text-purple-400 hover:text-purple-300 disabled:opacity-50"
          >
            Resend OTP {resendDisabled && `(${timeLeft}s)`}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

OtpVerification.propTypes = {
  setIsLoggedIn: PropTypes.func.isRequired,
};

export default OtpVerification;
