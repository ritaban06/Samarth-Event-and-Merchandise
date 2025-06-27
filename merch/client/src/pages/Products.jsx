import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { motion } from "framer-motion";
import { TextField, MenuItem, Select, FormControl, InputLabel, Snackbar } from "@mui/material";

const API_URL = import.meta.env.VITE_API_URL;

const Products = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    minPrice: '',
    maxPrice: '',
  });
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/products?`;
      if (filters.category) url += `category=${filters.category}&`;
      if (filters.search) url += `search=${filters.search}&`;
      if (filters.minPrice) url += `minPrice=${filters.minPrice}&`;
      if (filters.maxPrice) url += `maxPrice=${filters.maxPrice}&`;

      const { data } = await axios.get(url);
      setProducts(data);
    } catch (err) {
      setError('Error loading products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const existingItem = cart.find(
      item => item.productId === product.productId && 
      item.size === product.size && 
      item.color === product.color
    );

    if (existingItem) {
      setCart(cart.map(item => 
        item.productId === product.productId && 
        item.size === product.size && 
        item.color === product.color
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }

    setSnackbar({
      open: true,
      message: 'Product added to cart!',
      severity: 'success'
    });
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filters */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <TextField
          label="Search Products"
          variant="outlined"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select
            value={filters.category}
            label="Category"
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="clothing">Clothing</MenuItem>
            <MenuItem value="accessories">Accessories</MenuItem>
            <MenuItem value="stickers">Stickers</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Min Price"
          type="number"
          variant="outlined"
          value={filters.minPrice}
          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          fullWidth
        />
        <TextField
          label="Max Price"
          type="number"
          variant="outlined"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          fullWidth
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ProductCard
              {...product}
              onAddToCart={handleAddToCart}
            />
          </motion.div>
        ))}
      </div>

      {/* Cart Preview */}
      {cart.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-4 right-4 bg-purple-600 text-white p-4 rounded-lg shadow-lg cursor-pointer"
          onClick={() => navigate('/cart')}
        >
          🛒 Cart ({cart.reduce((total, item) => total + item.quantity, 0)} items)
        </motion.div>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </div>
  );
};

export default Products;