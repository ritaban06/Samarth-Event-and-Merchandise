import axios from 'axios';

// Create base API instance with the correct base URL
const api = axios.create({
    // Remove /api from base URL since it's included in env variable
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    // withCredentials: true,
});

// Auth endpoints - add /api prefix
export const googleAuth = (code) => api.get(`/auth/googleVerify?code=${code}`);

// Payment endpoints - no need for /api prefix since it's in baseURL
export const createOrder = (amount) => api.post('/orders', { 
    amount: amount * 100,
    currency: "INR"
});

export const verifyPayment = (paymentId) => api.get(`/payment/${paymentId}`);

// Event endpoints - no need for /api prefix since it's in baseURL
export const registerForEvent = (eventId, userData) => api.patch(`/events/${eventId}/register`, userData);

export const getEventDetails = (eventId) => api.get(`/events/${eventId}`);

export const getAllEvents = () => api.get('/events');

export default api;