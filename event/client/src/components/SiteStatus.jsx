import { useEffect, useState } from 'react';

const SiteStatus = ({ children }) => {
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(3);

  // Configuration
  const MERCH_URL = import.meta.env.VITE_MERCH_URL;
  const REDIRECT_MESSAGE = 'The events registration period has ended. You are being redirected to our merchandise store.';

  useEffect(() => {
    const checkSiteStatus = async () => {
      try {
        // Check if site is active via environment variable
        const siteActive = import.meta.env.VITE_SITE_ACTIVE;
        
        // If environment variable is set to 'false' or 'disabled', deactivate site
        if (siteActive === 'false' || siteActive === 'disabled') {
          setIsActive(false);
        } else {
          // Default to active if not specified or set to 'true'
          setIsActive(true);
        }
      } catch (error) {
        console.error('Error checking site status:', error);
        // Default to active on error
        setIsActive(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkSiteStatus();
  }, []);

  useEffect(() => {
    if (!isLoading && !isActive) {
      // Start countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            window.location.href = MERCH_URL;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLoading, isActive]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        <div className="max-w-md mx-auto text-center p-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl">
          <div className="mb-6">
            <svg 
              className="w-16 h-16 mx-auto text-yellow-400 mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
            <h1 className="text-2xl font-bold text-white mb-4">Events Site Temporarily Unavailable</h1>
            <p className="text-white/80 mb-6 leading-relaxed">
              {REDIRECT_MESSAGE}
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-white/70 text-sm mb-2">Redirecting in:</p>
              <div className="text-2xl font-mono text-white">{countdown}</div>
            </div>
            
            <a 
              href={MERCH_URL}
              className="inline-block w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
            >
              Go to Merch Store Now
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default SiteStatus;
