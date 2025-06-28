import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Layout from './components/Layout'
import theme from './theme'
import Merch from './pages/Merch'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated and validate token
    const validateToken = async () => {
      const token = localStorage.getItem('adminToken')
      if (token) {
        try {
          // Try to make a request to verify the token is valid
          await axios.get(`${import.meta.env.VITE_API_URL}/admin/dashboard/stats`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          setIsAuthenticated(true)
        } catch (error) {
          // Token is invalid, remove it
          localStorage.removeItem('adminToken')
          setIsAuthenticated(false)
        }
      } else {
        setIsAuthenticated(false)
      }
      setIsLoading(false)
    }
    
    validateToken()
  }, [])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          Loading...
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? 
                <Login setIsAuthenticated={setIsAuthenticated} /> : 
                <Navigate to="/dashboard" />
            } 
          />
          <Route
            element={
              isAuthenticated ? 
                <Layout setIsAuthenticated={setIsAuthenticated} /> : 
                <Navigate to="/login" />
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/merch" element={<Merch />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
