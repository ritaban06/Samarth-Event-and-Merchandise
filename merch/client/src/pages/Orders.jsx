import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Snackbar, Chip } from "@mui/material";
import Loader from "../components/Loader";

const API_URL = import.meta.env.VITE_API_URL;

const statusColors = {
  pending: "warning",
  processing: "info",
  shipped: "primary",
  delivered: "success",
  cancelled: "error"
};

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/orders/user`);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load orders',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-purple-300">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center text-gray-400">
          <p className="text-xl mb-4">You haven't placed any orders yet</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#121826] p-6 rounded-lg shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-400">Order ID: {order._id}</p>
                  <p className="text-gray-400">
                    Placed on: {new Date(order.orderDate).toLocaleDateString()}
                  </p>
                </div>
                <Chip
                  label={order.status.toUpperCase()}
                  color={statusColors[order.status]}
                  variant="outlined"
                />
              </div>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={`${item._id}-${item.variant.size}-${item.variant.color}`}
                    className="flex items-center gap-4 border-b border-gray-700 pb-4"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-purple-300">
                        {item.product.name}
                      </h3>
                      <p className="text-gray-400">
                        Size: {item.variant.size} | Color: {item.variant.color}
                      </p>
                      <p className="text-gray-400">
                        Quantity: {item.quantity} × ₹{item.price}
                      </p>
                    </div>
                    <p className="text-yellow-300 font-semibold">
                      ₹{item.quantity * item.price}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <div className="text-gray-400">
                    <p>Shipping Address:</p>
                    <p>{order.shippingAddress.street}</p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state}
                    </p>
                    <p>PIN: {order.shippingAddress.pincode}</p>
                    <p>Phone: {order.shippingAddress.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400">Total Amount:</p>
                    <p className="text-2xl font-bold text-purple-300">
                      ₹{order.payment.amount}
                    </p>
                    <p className="text-sm text-gray-400">
                      Payment Status: {order.payment.status.toUpperCase()}
                    </p>
                  </div>
                </div>

                {order.status === 'shipped' && (
                  <div className="mt-4 p-4 bg-purple-900/20 rounded-lg">
                    <p className="text-purple-300 font-semibold">Tracking Information</p>
                    <p className="text-gray-400">Tracking Number: {order.trackingNumber}</p>
                    <p className="text-gray-400">
                      Estimated Delivery: {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </div>
  );
};

export default Orders;