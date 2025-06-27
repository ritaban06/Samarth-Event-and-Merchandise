import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { TextField, Button, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

const API_URL = import.meta.env.VITE_API_URL;

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [checkoutDialog, setCheckoutDialog] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleQuantityChange = (productId, size, color, newQuantity) => {
    setCart(cart.map(item => 
      item.productId === productId && item.size === size && item.color === color
        ? { ...item, quantity: Math.max(1, newQuantity) }
        : item
    ));
  };

  const handleRemoveItem = (productId, size, color) => {
    setCart(cart.filter(item => 
      !(item.productId === productId && item.size === size && item.color === color)
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);

      // Validate shipping details
      const requiredFields = ['street', 'city', 'state', 'pincode', 'phone'];
      const missingFields = requiredFields.filter(field => !shippingDetails[field]);
      
      if (missingFields.length > 0) {
        setSnackbar({
          open: true,
          message: `Please fill in all required fields: ${missingFields.join(', ')}`,
          severity: 'error'
        });
        return;
      }

      const res = await loadRazorpay();
      if (!res) {
        setSnackbar({
          open: true,
          message: 'Razorpay SDK failed to load',
          severity: 'error'
        });
        return;
      }

      // Create order
      const orderData = {
        items: cart.map(item => ({
          product: item.productId,
          quantity: item.quantity,
          variant: {
            size: item.size,
            color: item.color
          },
          price: item.price
        })),
        shippingAddress: shippingDetails
      };

      const { data } = await axios.post(`${API_URL}/orders`, orderData);
      const { order, razorpayOrder } = data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Samarth Merchandise",
        description: "Purchase of merchandise items",
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            await axios.post(`${API_URL}/orders/${order._id}/verify-payment`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });

            setCart([]);
            setCheckoutDialog(false);
            setSnackbar({
              open: true,
              message: 'Order placed successfully!',
              severity: 'success'
            });
            navigate('/orders');
          } catch (error) {
            console.error('Payment verification failed:', error);
            setSnackbar({
              open: true,
              message: 'Payment verification failed',
              severity: 'error'
            });
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: shippingDetails.phone
        },
        theme: {
          color: "#9333EA"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Checkout error:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Checkout failed',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-purple-300">Your Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center text-gray-400">
          <p className="text-xl mb-4">Your cart is empty</p>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/products')}
          >
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <motion.div
                key={`${item.productId}-${item.size}-${item.color}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#121826] p-4 rounded-lg shadow flex items-center gap-4"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-purple-300">{item.name}</h3>
                  <p className="text-gray-400">
                    Size: {item.size} | Color: {item.color}
                  </p>
                  <p className="text-yellow-300">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleQuantityChange(item.productId, item.size, item.color, item.quantity - 1)}
                  >
                    -
                  </Button>
                  <span className="mx-2">{item.quantity}</span>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleQuantityChange(item.productId, item.size, item.color, item.quantity + 1)}
                  >
                    +
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleRemoveItem(item.productId, item.size, item.color)}
                  >
                    Remove
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-[#121826] p-6 rounded-lg shadow h-fit">
            <h2 className="text-xl font-semibold mb-4 text-purple-300">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>₹{calculateTotal()}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-purple-300 pt-2 border-t border-gray-700">
                <span>Total</span>
                <span>₹{calculateTotal()}</span>
              </div>
            </div>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={() => setCheckoutDialog(true)}
              disabled={loading}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}

      {/* Checkout Dialog */}
      <Dialog open={checkoutDialog} onClose={() => setCheckoutDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="text-center text-purple-300">Shipping Details</DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            <TextField
              label="Street Address"
              fullWidth
              value={shippingDetails.street}
              onChange={(e) => setShippingDetails({ ...shippingDetails, street: e.target.value })}
            />
            <TextField
              label="City"
              fullWidth
              value={shippingDetails.city}
              onChange={(e) => setShippingDetails({ ...shippingDetails, city: e.target.value })}
            />
            <TextField
              label="State"
              fullWidth
              value={shippingDetails.state}
              onChange={(e) => setShippingDetails({ ...shippingDetails, state: e.target.value })}
            />
            <TextField
              label="PIN Code"
              fullWidth
              value={shippingDetails.pincode}
              onChange={(e) => setShippingDetails({ ...shippingDetails, pincode: e.target.value })}
            />
            <TextField
              label="Phone Number"
              fullWidth
              value={shippingDetails.phone}
              onChange={(e) => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckoutDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCheckout}
            disabled={loading}
          >
            Place Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </div>
  );
};

export default Cart;