import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home";
import Events from "./pages/Events";
// import LogoAnimation from "./components/LogoAnimation.jsx";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useState, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext.jsx";
import Profile from "./pages/Profile";
import Teams from "./pages/teams.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer.jsx";
import AnimatedGradientBackground from "./components/AnimatedGradientBackground.jsx";

import OtpVerification from "./pages/OtpVerification.jsx";
import Packages from './pages/Packages';
import SiteStatus from "./components/SiteStatus.jsx";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const App = () => {
  const [oauthError, setOauthError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <SiteStatus>
    <GoogleOAuthProvider
      clientId={GOOGLE_CLIENT_ID}
      onScriptLoadError={() => {
        console.error("Google Script Load Error");
        setOauthError("Failed to load Google authentication");
      }}
      // onScriptLoadSuccess={() =>
      //   ("Google Script Loaded Successfully")
      // }
    >
      <AuthProvider setIsLoggedIn={setIsLoggedIn}>
        <Router>
          {oauthError && (
            <div className="bg-red-100 text-red-700 p-4">{oauthError}</div>
          )}

          <AnimatedGradientBackground>
            <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/packages" element={<Packages />} />
              <Route
                path="/login"
                element={<Login setIsLoggedIn={setIsLoggedIn} />}
              />
              <Route path="/register" element={<Register />} />
              <Route path="/teams" element={<Teams />} />
              <Route
                path="/otp-verification"
                element={<OtpVerification setIsLoggedIn={setIsLoggedIn} />}
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AnimatedGradientBackground>

        </Router>
        {/* <LogoAnimation /> */}
      </AuthProvider>
    </GoogleOAuthProvider>
    </SiteStatus>
  );
};

export default App;
