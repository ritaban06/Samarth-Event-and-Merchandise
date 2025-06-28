import { useState, useEffect } from 'react'
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Avatar,
  Grid
} from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'

function Login({ setIsAuthenticated }) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Update the session timeout to 1 hour
  useEffect(() => {
    let logoutTimer;

    const resetTimer = () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
        navigate('/login'); // Ensure you have a route for login
      }, 60 * 60 * 1000); // 1 hour in milliseconds
    };

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Start the initial timer
    resetTimer();

    // Cleanup
    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [setIsAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/admin/login`, credentials);
        localStorage.setItem('adminToken', response.data.token);
        setIsAuthenticated(true);
    } catch (err) {
        console.error(err); // Log the error for debugging
        setError('Invalid credentials');
    }
  };

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      {/* Left side - Welcome/Branding */}
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(https://source.unsplash.com/random?university)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: { xs: 'none', sm: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          padding: 4,
          bgcolor: 'background.default'
        }}
      >
        <Typography
          component="h1"
          variant="h3"
          sx={{
            fontWeight: 700,
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            mb: 2,
            color: 'primary.main'
          }}
        >
          Welcome to Merchandise Management
        </Typography>
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            maxWidth: '600px',
            color: 'text.secondary'
          }}
        >
        </Typography>
      </Grid>

      {/* Right side - Login Form */}
      <Grid 
        item 
        xs={12} 
        sm={8} 
        md={5} 
        component={Paper} 
        square
        elevation={0}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          bgcolor: 'background.default'
        }}
      >
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar 
            sx={{ 
              m: 1, 
              bgcolor: 'primary.main',
              width: 56,
              height: 56
            }}
          >
            <LockOutlinedIcon fontSize="large" />
          </Avatar>
          
          <Typography 
            component="h2" 
            variant="h4" 
            sx={{ 
              mb: 3,
              fontWeight: 500,
              color: 'text.primary'
            }}
          >
            Admin Login
          </Typography>

          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ 
              width: '100%',
              maxWidth: '400px'
            }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              label="Username"
              autoFocus
              value={credentials.username}
              onChange={(e) => setCredentials({
                ...credentials,
                username: e.target.value
              })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({
                ...credentials,
                password: e.target.value
              })}
              sx={{ mb: 2 }}
            />
            
            {error && (
              <Typography 
                color="error" 
                align="center" 
                sx={{ 
                  mt: 1,
                  mb: 1 
                }}
              >
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ 
                mt: 2,
                mb: 2,
                py: 1.5,
                fontWeight: 600,
                bgcolor: 'primary.dark',
                '&:hover': {
                  bgcolor: 'primary.main',
                }
              }}
            >
              Sign In
            </Button>

            <Typography 
              variant="body2" 
              color="text.secondary" 
              align="center"
              sx={{ mt: 2 }}
            >
              © {new Date().getFullYear()} Samarth TMSL
            </Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  )
}

Login.propTypes = {
  setIsAuthenticated: PropTypes.func.isRequired,
}

export default Login 