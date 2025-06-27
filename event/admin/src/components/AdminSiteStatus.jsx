import { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Card, CardContent } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

const AdminSiteStatus = ({ children }) => {
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);

  // Configuration
  const MERCH_URL = 'https://merch.ritaban.me';
  const REDIRECT_MESSAGE = 'The events administration period has ended. You are being redirected to our merchandise store.';

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
      // Start countdown for admin (5 seconds)
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
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ backgroundColor: 'primary.main' }}
      >
        <Box textAlign="center">
          <CircularProgress size={48} color="secondary" />
          <Typography variant="h6" color="white" mt={2}>
            Loading Admin Panel...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!isActive) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ 
          backgroundColor: 'primary.main',
          padding: 2
        }}
      >
        <Card sx={{ maxWidth: 500, textAlign: 'center' }}>
          <CardContent sx={{ p: 4 }}>
            <WarningIcon color="warning" sx={{ fontSize: 64, mb: 2 }} />
            
            <Typography variant="h4" gutterBottom color="primary">
              Admin Panel Unavailable
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              {REDIRECT_MESSAGE}
            </Typography>
            
            <Box 
              sx={{ 
                backgroundColor: 'grey.100', 
                borderRadius: 1, 
                p: 2, 
                mb: 3 
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Redirecting in: {countdown} seconds
              </Typography>
            </Box>
            
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              fullWidth
              href={MERCH_URL}
              sx={{ 
                py: 1.5,
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FE6B8B 60%, #FF8E53 100%)',
                }
              }}
            >
              Go to Merch Store
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return children;
};

export default AdminSiteStatus;
