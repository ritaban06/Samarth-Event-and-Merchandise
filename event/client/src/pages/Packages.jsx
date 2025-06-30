import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PackageCard from '../components/PackageCard';
import Loader from '../components/Loader';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Snackbar } from '@mui/material';

const API_URL = import.meta.env.VITE_API_URL;
const RPG_ID = import.meta.env.RPG_ID;

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentType, setPaymentType] = useState('online');
  const [isProcessing, setIsProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userPackage, setUserPackage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [packagesResponse, userPackageResponse] = await Promise.all([
          axios.get(`${API_URL}/packages`),
          user ? axios.get(`${API_URL}/packages/datafetch`, { params: { id: user.uid } }) : Promise.resolve(null)
        ]);
        
        setPackages(packagesResponse.data.packages || []);
        if (userPackageResponse) {
          setUserPackage(userPackageResponse.data.package);
        }
      } catch (err) {
        setError('Failed to load packages');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleBuyClick = (pkg) => {
    if (!user || !localStorage.getItem('token')) {
      navigate('/login', { state: { from: '/events' } });
      return;
    }
    setSelectedPackage(pkg);
    setOpenPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setOpenPaymentModal(false);
    setSelectedPackage(null);
    setPaymentType('online');
    setIsProcessing(false);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      if (paymentType === 'online') {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error('Razorpay SDK failed to load');
        }

        // Create order
        const orderResponse = await axios.post(`${API_URL}/orders`, {
          amount: selectedPackage.price * 100,
          currency: 'INR'
        });

        // Configure Razorpay
        const options = {
          key: RPG_ID,
          amount: orderResponse.data.amount,
          currency: orderResponse.data.currency,
          name: "Samarth TMSL",
          description: `Payment for ${selectedPackage.name}`,
          order_id: orderResponse.data.order_id,
          handler: async (response) => {
            await handlePaymentSuccess(response.razorpay_payment_id);
          },
          prefill: {
            name: user.userName,
            email: user.email
          },
          theme: {
            color: "#3399cc"
          }
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
      } else {
        // Handle cash payment
        await handlePaymentSuccess(null, 'cash');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setSnackbar({
        open: true,
        message: 'Payment failed. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (paymentId, type = 'online') => {
    try {
      const response = await axios.post(`${API_URL}/packages/buy/${user.uid}`, {
        packageId: selectedPackage.id,
        paymentType: type,
        paymentId: paymentId
      });

      // Fetch updated package data
      const userPackageResponse = await axios.get(`${API_URL}/packages/datafetch`, { 
        params: { id: user.uid } 
      });
      setUserPackage(userPackageResponse.data.package);

      setSnackbar({
        open: true,
        message: type === 'cash' ? 'Package registration pending. Please pay at counter.' : 'Package purchased successfully!',
        severity: 'success'
      });

      handleClosePaymentModal();
    } catch (error) {
      console.error('Error activating package:', error);
      setSnackbar({
        open: true,
        message: 'Failed to activate package. Please contact support.',
        severity: 'error'
      });
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;

  return (
    <>
    <div className="grid grid-cols-1 gap-8 max-w-7xl mx-auto">
        {Array.isArray(packages) && packages.length > 0 ? (
          packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              package={pkg}
              onBuyClick={handleBuyClick}
              userPackage={userPackage}
            />
          ))
        ) : (
          <div className="text-center text-gray-300">
            <p>No packages available at the moment. Check back later!</p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <Dialog open={openPaymentModal} onClose={handleClosePaymentModal}>
        <DialogTitle className="text-center">
          Select Payment Method for {selectedPackage?.name}
        </DialogTitle>
        <DialogContent>
          <div className="mt-4">
            <TextField
              select
              label="Payment Type"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              fullWidth
              className="mb-4"
            >
              <MenuItem value="online">Online Payment</MenuItem>
              <MenuItem value="cash">Cash Payment</MenuItem>
            </TextField>
            <p className="text-sm text-gray-600 mt-2">
              Amount: ₹{selectedPackage?.price}
            </p>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentModal} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={handlePayment} 
            variant="contained" 
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Proceed to Pay'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        message={snackbar.message}
      /></>
  );
};

export default Packages;
