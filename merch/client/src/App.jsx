import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import LogoAnimation from "./components/LogoAnimation.jsx";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useState, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer.jsx";
import BgParticles from "./components/BgParticles.jsx";
import OtpVerification from "./pages/OtpVerification.jsx";

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
        <CartProvider>
          <Router>
            {oauthError && (
              <div className="bg-red-100 text-red-700 p-4">{oauthError}</div>
            )}

          <div className="min-h-screen bg-[#0a1929] text-white flex flex-col">
            <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route 
                  path="/cart" 
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/orders" 
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/otp-verification" element={<OtpVerification />} />
              </Routes>
            </main>
            <Footer />
          </div>

          </Router>
          < LogoAnimation />
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
