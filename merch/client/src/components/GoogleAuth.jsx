import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useState } from 'react';

const GoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        setIsLoading(true);
        //('Login Success:', codeResponse);
        // Handle successful login here
      } catch (error) {
        console.error('Google login processing error:', error);
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      setIsLoading(false);
    },
    flow: 'implicit'
  });

  return (
    <Button
      variant="contained"
      startIcon={<GoogleIcon />}
      onClick={() => login()}
      disabled={isLoading}
      fullWidth
      sx={{
        mt: 2,
        mb: 2,
        backgroundColor: '#4285f4',
        '&:hover': {
          backgroundColor: '#357abd'
        }
      }}
    >
      {isLoading ? 'Loading...' : 'Continue with Google'}
    </Button>
  );
};

export default GoogleAuth; 