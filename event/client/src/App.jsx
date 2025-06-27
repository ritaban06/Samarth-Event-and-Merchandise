import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home";
import Events from "./pages/Events";
import LogoAnimation from "./components/LogoAnimation.jsx";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useState, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext.jsx";
import Profile from "./pages/Profile";
import Teams from "./pages/teams.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer.jsx";
import BgParticles from "./components/BgParticles.jsx";
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

          {/* Background Wrapper (Ensures Scrolling) */}
          <div className="relative w-full min-h-screen overflow-hidden">
            {/* Scrolling Background Image */}
            <div
              className="absolute top-0 left-0 w-full h-full bg-cover bg-center blur-md flex justify-center items-center"
              style={{
                backgroundImage:
                  "url('https://blogger.googleusercontent.com/img/a/AVvXsEhTNh1xCYh7PMsnL0QLMwr4oGYxgJA01bVhoGNZleklWiUj0-sxpVoBUjMlvIHR2yGmT3O8YKTNSiYRRoGwZoIfG1Io5gx-f-ja9tYP1UQMYqlTJeUBQNmcSxk7nhtxt3S-wp-Vn9uav-SckL9ZP9EgLgr9iIOmFkNGSamr0xVQPLHN6KvhMvIyejPUPsw')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            ></div>

            {/* Dark Blue Gradient Overlay */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-950/80 via-transparent to-blue-950/80"></div>
            <div className="absolute top-0 left-0 w-full h-full"></div>
            {/* App Content */}
            <div className="relative z-10">
              <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
              <BgParticles />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/events" element={<Events />} />
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
            </div>
          </div>

        </Router>
        < LogoAnimation />
      </AuthProvider>
    </GoogleOAuthProvider>
    </SiteStatus>
  );
};

export default App;
