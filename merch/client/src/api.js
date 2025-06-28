import axios from 'axios';

// Create base API instance with the correct base URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth endpoints
export const googleAuth = (code) => api.post('/auth/google', { code });
export const login = (credentials) => api.post('/auth/verify', credentials);
export const register = (userData) => api.post('/auth/signup', userData);
export const sendOtp = (email, otp) => api.post('/auth/otp', { email, otp });

// Product endpoints
export const getAllProducts = (params = {}) => api.get('/products', { params });
export const getProductById = (productId) => api.get(`/products/${productId}`);

// Order endpoints
export const createOrder = (orderData) => api.post('/orders', orderData);
export const getUserOrders = () => api.get('/orders/user');
export const getOrderById = (orderId) => api.get(`/orders/${orderId}`);

// Payment endpoints
export const createPaymentOrder = (amount) => api.post('/payment/create-order', { 
    amount: amount * 100,
    currency: "INR"
});
export const verifyPayment = (paymentId) => api.get(`/payment/${paymentId}`);

export default api;