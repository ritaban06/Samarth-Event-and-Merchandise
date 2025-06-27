import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  TablePagination,
  Snackbar,
  Button
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import RefreshIcon from '@mui/icons-material/Refresh'
import SyncIcon from '@mui/icons-material/Sync'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import axios from 'axios'
import { formatDateTime } from '../utils/dateFormat'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Dashboard() {
  const [events, setEvents] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage] = useState(10)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [snackbar, setSnackbar] = useState(null)
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All')
  const [packages, setPackages] = useState([])
  const [viewMode, setViewMode] = useState('events') // 'events' or 'packages'

  useEffect(() => {
    fetchEvents()
    fetchPackages()
    
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timeInterval)
  }, []) // Remove fetchEvents from dependency array to avoid multiple calls

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/events`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      setEvents(response.data)
      setError(null)
    } catch (error) {
      console.error('Error fetching events:', error)
      setError('Coming Soon !')
    } finally {
      setLoading(false)
    }
  }

  // Add this after fetchEvents function
  const fetchPackages = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/clients/all`)
      // Filter and transform clients with package registrations
      const packageRegistrations = response.data
        .filter(client => client.package.status==='active') // Only get clients with package data
        .map(client => ({
          _id: client._id,
          userId: client.uid,
          userName: client.userName,
          email: client.email,
          paymentType: client.package.payment.type,
          paymentId: client.package.payment.payment_id? client.package.payment.payment_id: null,
          registeredEvents: client.package.registered,
          paymentStatus: client.package.payment.status
        }))
      setPackages(packageRegistrations)
      setError(null)
    } catch (error) {
      console.error('Error fetching package registrations:', error)
      setError('Failed to load package registrations')
    } finally {
      setLoading(false)
    }
  }

  // Get all registrations from all events
  const getAllRegistrations = () => {
    
    
    const registrations = events.flatMap(event => 
      event.participants.map(participant => ({
        ...participant,
        eventName: event.eventName,
        registrationDate: participant.payment.date,
        eventId: event._id
      }))
    )
    return registrations
  }

  const filteredRegistrations = getAllRegistrations().filter(reg => {
    const matchesSearchTerm = reg.uid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.eventName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPaymentStatus = paymentStatusFilter === 'All' || 
      reg.payment?.status === paymentStatusFilter.toLowerCase();

    return matchesSearchTerm && matchesPaymentStatus;
  })

  // Calculate statistics
  const totalRegistrations = getAllRegistrations().length
  const totalPaidRegistrations = getAllRegistrations().filter(reg => reg.payment?.status === 'paid').length
  const totalPendingRegistrations = getAllRegistrations().filter(reg => reg.payment?.status === 'pending').length
  const totalUnpaidRegistrations = getAllRegistrations().filter(reg => reg.payment?.status === 'unpaid').length
  const totalFreeRegistrations = getAllRegistrations().filter(reg => reg.payment?.status === 'free').length

  // Refresh data from database
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchEvents()
      setSnackbar({
        open: true,
        message: 'Data refreshed successfully!',
        severity: 'success'
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to refresh data',
        severity: 'error'
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Sync data to Google Sheets
  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const response = await axios.post(
        `${API_URL}/admin/sync-sheets`,
        { registrations: getAllRegistrations() },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      )
      setSnackbar({
        open: true,
        message: 'Data synced to Google Sheets successfully!',
        severity: 'success'
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to sync data to Google Sheets',
        severity: 'error'
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handlePaymentStatusChange = async (registrationId, newStatus, eventId, paymentType) => {
    try {
      setSnackbar({ open: true, message: 'Updating payment status...', severity: 'info' });
      
      const paymentData = {
        status: newStatus,
        eventId: eventId,
        uid: registrationId,
        paymentType: paymentType,
      };

      const response = await axios.put(
        `${API_URL}/admin/registration/${registrationId}/payment-status`,
        paymentData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        }
      );

      // Update local state for the specific event and participant
      setEvents(prevEvents => 
        prevEvents.map(event => {
          if (event._id === eventId) {
            return {
              ...event,
              participants: event.participants.map(participant => 
                participant.uid === registrationId
                  ? { 
                      ...participant, 
                      payment: { 
                        ...participant.payment, 
                        status: newStatus.toLowerCase(),
                        paymentDate : paymentType === 'cash' ? new Date().toISOString() : participant.payment.date
                      } 
                    }
                  : participant
              )
            };
          }
          return event;
        })
      );

      setSnackbar({
        open: true,
        message: 'Payment status updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update payment status',
        severity: 'error'
      });
    }
  };

  // Add this after handlePaymentStatusChange function
  const handlePackagePaymentUpdate = async (clientId, newStatus) => {
    try {
      setSnackbar({ open: true, message: 'Updating package payment status...', severity: 'info' })
      
      const response = await axios.put(
        `${API_URL}/packages/clients/${clientId}/package-status`,
        { status: newStatus },
      )
      
      // Update local state
      setPackages(prevPackages => 
        prevPackages.map(pkg => 
          pkg._id === clientId
            ? { ...pkg, paymentStatus: newStatus }
            : pkg
        )
      )

      setSnackbar({
        open: true,
        message: 'Package payment status updated successfully',
        severity: 'success'
      })
    } catch (error) {
      console.error('Error updating package payment status:', error)
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update package payment status',
        severity: 'error'
      })
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6">Loading...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ 
      p: 3,
      width: '100%',
      height: '100%',
      overflow: 'auto',
      pl: { xs: 3, sm: 6 },
      pr: { xs: 3, sm: 6 }
    }}>
      {/* Header Section with Action Buttons */}
      <Box sx={{ 
        mb: 4,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography 
          variant="h4" 
          gutterBottom
          sx={{ 
            color: 'text.primary',
            fontWeight: 600,
            mb: 3
          }}
        >
          Registration Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl variant="outlined" sx={{ minWidth: 120 }}>
            <Select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              displayEmpty
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Unpaid">Unpaid</MenuItem>
              <MenuItem value="Free">Free</MenuItem>
            </Select>
          </FormControl>

          <Button
            disabled={isRefreshing}
            startIcon={<RefreshIcon />}
            variant="contained"
            onClick={handleRefresh}
            sx={{ 
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          
          <Button
            disabled={isSyncing}
            startIcon={<CloudUploadIcon />}
            variant="contained"
            onClick={handleSync}
            sx={{ 
              bgcolor: 'secondary.main',
              '&:hover': { bgcolor: 'secondary.dark' }
            }}
          >
            {isSyncing ? 'Syncing...' : 'Sync to Sheets'}
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={3}
            sx={{ 
              bgcolor: 'background.paper',
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}
          >
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Registrations
              </Typography>
              <Typography variant="h3" color="primary.main">
                {totalRegistrations}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={3}
            sx={{ 
              bgcolor: 'background.paper',
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}
          >
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Paid Registrations
              </Typography>
              <Typography variant="h3" color="success.main">
                {totalPaidRegistrations}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={3}
            sx={{ 
              bgcolor: 'background.paper',
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}
          >
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Pending Payments
              </Typography>
              <Typography variant="h3" color="warning.main">
                {totalPendingRegistrations}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={3}
            sx={{ 
              bgcolor: 'background.paper',
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}
          >
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Unpaid Registrations
              </Typography>
              <Typography variant="h3" color="error.main">
                {totalUnpaidRegistrations}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={3}
            sx={{ 
              bgcolor: 'background.paper',
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}
          >
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Free Registrations
              </Typography>
              <Typography variant="h3" sx={{ color: '#9c27b0' }}>
                {totalFreeRegistrations}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Updated Search Bar */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search by UID, name, email, or event..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* View Mode Toggle */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant={viewMode === 'events' ? 'contained' : 'outlined'}
          onClick={() => setViewMode('events')}
        >
          Event Registrations
        </Button>
        <Button
          variant={viewMode === 'packages' ? 'contained' : 'outlined'}
          onClick={() => setViewMode('packages')}
        >
          Package Registrations
        </Button>
      </Box>

      {/* Table Section */}
      {viewMode === 'events' && (
        <TableContainer 
          component={Paper}
          sx={{ 
            bgcolor: 'background.paper',
            borderRadius: 2,
            overflow: 'hidden',
            width: '100%',
            maxWidth: '100%'
          }}
        >
          <Table sx={{ minWidth: 650 }} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: 'background.paper'
                  }}
                >
                  UID
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: 'background.paper'
                  }}
                >
                  Name
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: 'background.paper'
                  }}
                >
                  Email
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: 'background.paper'
                  }}
                >
                  Event Name
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: 'background.paper'
                  }}
                >
                  Team Name & Role
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: 'background.paper'
                  }}
                >
                  Registration Date
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: 'background.paper'
                  }}
                >
                  Amount (₹)
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: 'background.paper'
                  }}
                >
                  Payment Type
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: 'background.paper'
                  }}
                >
                  Payment Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRegistrations
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((registration) => (
                <TableRow 
                  key={registration._id}
                  sx={{ 
                    '&:hover': { 
                      bgcolor: 'action.hover' 
                    },
                    transition: 'background-color 0.2s'
                  }}
                >
                  <TableCell>{registration.uid}</TableCell>
                  <TableCell>{registration.name}</TableCell>
                  <TableCell>{registration.email}</TableCell>
                  <TableCell>{registration.eventName}</TableCell>
                  <TableCell>{registration.team? <>{registration.team.teamName} {registration.team.teamLeader?'(Leader)':'(Member)'}</>: 'N/A'}</TableCell>
                  <TableCell>{formatDateTime(registration.registrationDate, currentTime)}</TableCell>
                  <TableCell>₹{registration.payment.amount}</TableCell>
                  <TableCell>{registration.payment.type}</TableCell>
                  <TableCell>
                    <Select
                      value={registration.payment.status}
                      onChange={(e) => handlePaymentStatusChange(registration.uid, e.target.value, registration.eventId, registration.payment.type, registration.payment.date)}
                      size="small"
                      sx={{
                        minWidth: 120,
                        bgcolor: 
                          registration.payment.status === 'free' ? '#9c27b0' :
                          registration.payment.status === 'paid' ? 'success.dark' :
                          registration.payment.status === 'pending' ? 'warning.dark' :
                          'error.dark',
                        '& .MuiSelect-select': {
                          color: '#FFFFFF'
                        },
                        '& .MuiSelect-icon': {
                          color: '#FFFFFF'
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: registration.payment.status === 'free' ? '#9c27b0' : 'transparent'
                        }
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            '& .MuiMenuItem-root[data-value="free"]': {
                              color: '#000000'
                            }
                          }
                        }
                      }}
                      disabled={registration.payment.status === 'free'}
                    >
                      <MenuItem value="paid">PAID</MenuItem>
                      <MenuItem value="pending">PENDING</MenuItem>
                      <MenuItem value="unpaid">UNPAID</MenuItem>
                      <MenuItem value="free" data-value="free">FREE</MenuItem>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredRegistrations.length}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10]}
          />
        </TableContainer>
      )}

      {/* Package Table */}
      {viewMode === 'packages' && (
        <TableContainer 
          component={Paper}
          sx={{ 
            bgcolor: 'background.paper',
            borderRadius: 2,
            overflow: 'hidden',
            width: '100%',
            maxWidth: '100%'
          }}
        >
          <Table sx={{ minWidth: 650 }} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>User ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Payment Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Payment ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Amount (₹)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Registered Events</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Payment Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {packages
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((pkg) => (
                  <TableRow 
                    key={pkg._id}
                    sx={{ 
                      '&:hover': { bgcolor: 'action.hover' },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <TableCell>{pkg.userId}</TableCell>
                    <TableCell>{pkg.userName}</TableCell>
                    <TableCell>{pkg.email}</TableCell>
                    <TableCell>{pkg.paymentType}</TableCell>
                    <TableCell>{pkg.paymentId || 'N/A'}</TableCell>
                    <TableCell>₹ 200</TableCell>
                    <TableCell>{pkg.registeredEvents} / 6</TableCell>
                    <TableCell>
                      <Select
                        value={pkg.paymentStatus}
                        onChange={(e) => handlePackagePaymentUpdate(pkg._id, e.target.value)}
                        size="small"
                        sx={{
                          minWidth: 120,
                          bgcolor: pkg.paymentStatus === 'paid' ? 'success.dark' : 'warning.dark',
                          '& .MuiSelect-select': { color: '#FFFFFF' },
                          '& .MuiSelect-icon': { color: '#FFFFFF' },
                        }}
                      >
                        <MenuItem value="pending">PENDING</MenuItem>
                        <MenuItem value="paid">PAID</MenuItem>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={packages.length}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10]}
          />
        </TableContainer>
      )}

      {/* Add Snackbar for notifications */}
      <Snackbar
        open={snackbar?.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        message={snackbar?.message}
        severity={snackbar?.severity}
      />
    </Box>
  )
}
