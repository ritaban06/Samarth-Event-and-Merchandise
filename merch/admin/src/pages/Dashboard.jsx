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
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  TablePagination,
  Snackbar,
  Button,
  Alert
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import RefreshIcon from '@mui/icons-material/Refresh'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import InventoryIcon from '@mui/icons-material/Inventory'
import axios from 'axios'
import { formatDateTime } from '../utils/dateFormat'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Dashboard() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage] = useState(10)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })
  const [orderStatusFilter, setOrderStatusFilter] = useState('All')
  const [viewMode, setViewMode] = useState('orders') // 'orders' or 'products'

  useEffect(() => {
    fetchOrders()
    fetchProducts()
    
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timeInterval)
  }, [])

  const fetchOrders = async () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      setError('No authentication token found')
      return
    }

    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      setOrders(response.data || [])
      setError(null)
    } catch (error) {
      console.error('Error fetching orders:', error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Token is invalid, redirect to login
        localStorage.removeItem('adminToken')
        window.location.href = '/login'
        return
      }
      setError('Failed to load orders. Using demo data.')
      // Demo data for development
      setOrders([
        {
          _id: '1',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          productName: 'College T-Shirt',
          size: 'M',
          quantity: 2,
          amount: 599,
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          productName: 'College Hoodie',
          size: 'L',
          quantity: 1,
          amount: 899,
          status: 'paid',
          createdAt: new Date().toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      return
    }

    try {
      const response = await axios.get(`${API_URL}/admin/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      setProducts(response.data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Token is invalid, redirect to login
        localStorage.removeItem('adminToken')
        window.location.href = '/login'
        return
      }
      // Demo data for development
      setProducts([
        {
          _id: '1',
          name: 'College T-Shirt',
          category: 'Apparel',
          price: 299,
          stock: 50,
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          name: 'College Hoodie',
          category: 'Apparel',
          price: 899,
          stock: 25,
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ])
    }
  }

  // Calculate statistics
  const totalOrders = orders.length
  const totalPaidOrders = orders.filter(order => order.status === 'paid').length
  const totalPendingOrders = orders.filter(order => order.status === 'pending').length
  const totalShippedOrders = orders.filter(order => order.status === 'shipped').length
  const totalProducts = products.length
  const totalRevenue = orders.filter(order => order.status === 'paid').reduce((sum, order) => sum + (order.amount || 0), 0)

  const filteredOrders = orders.filter(order => {
    const matchesSearchTerm = order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = orderStatusFilter === 'All' || 
      order.status === orderStatusFilter.toLowerCase()

    return matchesSearchTerm && matchesStatus
  })

  // Refresh data from database
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchOrders()
      await fetchProducts()
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
        { orders: orders },
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

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      setSnackbar({ open: true, message: 'Updating order status...', severity: 'info' })
      
      const response = await axios.put(
        `${API_URL}/admin/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        }
      )

      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      )

      setSnackbar({
        open: true,
        message: 'Order status updated successfully',
        severity: 'success'
      })
    } catch (error) {
      console.error('Error updating order status:', error)
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update order status',
        severity: 'error'
      })
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6">Loading merchandise data...</Typography>
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
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
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
          Merchandise Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl variant="outlined" sx={{ minWidth: 120 }}>
            <Select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              displayEmpty
              size="small"
            >
              <MenuItem value="All">All Status</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Shipped">Shipped</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>

          <Button
            disabled={isRefreshing}
            startIcon={<RefreshIcon />}
            variant="contained"
            onClick={handleRefresh}
            size="small"
            sx={{ 
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          
          <Button
            disabled={isSyncing}
            startIcon={<CloudUploadIcon />}
            variant="contained"
            onClick={handleSync}
            size="small"
            sx={{ 
              bgcolor: 'secondary.main',
              '&:hover': { bgcolor: 'secondary.dark' }
            }}
          >
            {isSyncing ? 'Syncing...' : 'Sync'}
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
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
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShoppingCartIcon color="primary" />
                <Typography variant="h6" color="text.secondary" sx={{ ml: 1 }}>
                  Total Orders
                </Typography>
              </Box>
              <Typography variant="h3" color="primary.main">
                {totalOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
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
                Paid Orders
              </Typography>
              <Typography variant="h3" color="success.main">
                {totalPaidOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
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
                Pending Orders
              </Typography>
              <Typography variant="h3" color="warning.main">
                {totalPendingOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
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
                Total Revenue
              </Typography>
              <Typography variant="h3" color="success.main">
                ₹{totalRevenue}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
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
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InventoryIcon color="info" />
                <Typography variant="h6" color="text.secondary" sx={{ ml: 1 }}>
                  Products
                </Typography>
              </Box>
              <Typography variant="h3" color="info.main">
                {totalProducts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search Bar */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search by customer name, email, or product..."
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
          variant={viewMode === 'orders' ? 'contained' : 'outlined'}
          onClick={() => setViewMode('orders')}
          startIcon={<ShoppingCartIcon />}
        >
          Orders ({totalOrders})
        </Button>
        <Button
          variant={viewMode === 'products' ? 'contained' : 'outlined'}
          onClick={() => setViewMode('products')}
          startIcon={<InventoryIcon />}
        >
          Products ({totalProducts})
        </Button>
      </Box>

      {/* Orders Table */}
      {viewMode === 'orders' && (
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
                <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Size</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Qty</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Amount (₹)</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Order Date</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((order) => (
                <TableRow 
                  key={order._id}
                  sx={{ 
                    '&:hover': { bgcolor: 'action.hover' },
                    transition: 'background-color 0.2s'
                  }}
                >
                  <TableCell>{order._id}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.customerEmail}</TableCell>
                  <TableCell>{order.productName}</TableCell>
                  <TableCell>{order.size}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>₹{order.amount}</TableCell>
                  <TableCell>{formatDateTime(order.createdAt, currentTime)}</TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                      size="small"
                      sx={{
                        minWidth: 100,
                        bgcolor: 
                          order.status === 'paid' ? 'success.dark' :
                          order.status === 'pending' ? 'warning.dark' :
                          order.status === 'shipped' ? 'info.dark' :
                          order.status === 'delivered' ? 'success.main' :
                          'error.dark',
                        '& .MuiSelect-select': { color: '#FFFFFF', fontSize: '0.8rem' },
                        '& .MuiSelect-icon': { color: '#FFFFFF' },
                      }}
                    >
                      <MenuItem value="pending">PENDING</MenuItem>
                      <MenuItem value="paid">PAID</MenuItem>
                      <MenuItem value="shipped">SHIPPED</MenuItem>
                      <MenuItem value="delivered">DELIVERED</MenuItem>
                      <MenuItem value="cancelled">CANCELLED</MenuItem>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredOrders.length}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10]}
          />
        </TableContainer>
      )}

      {/* Products Table */}
      {viewMode === 'products' && (
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
                <TableCell sx={{ fontWeight: 600 }}>Product ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Price (₹)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Stock</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((product) => (
                  <TableRow 
                    key={product._id}
                    sx={{ 
                      '&:hover': { bgcolor: 'action.hover' },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <TableCell>{product._id}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>₹{product.price}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <Chip 
                        label={product.status} 
                        color={product.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDateTime(product.createdAt, currentTime)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={products.length}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10]}
          />
        </TableContainer>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
