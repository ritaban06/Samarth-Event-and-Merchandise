import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, MenuItem, FormControlLabel, Checkbox } from '@mui/material';

const API_URL = import.meta.env.VITE_API_URL;

// Product categories for merchandise
const PRODUCT_CATEGORIES = [
  'T-Shirts',
  'Hoodies',
  'Accessories',
  'Bags',
  'Mugs',
  'Stickers',
  'Phone Cases',
  'Other'
];

// Product sizes
const PRODUCT_SIZES = [
  'XS',
  'S', 
  'M',
  'L',
  'XL',
  'XXL',
  'One Size'
];

const Merch = () => {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    category: '',
    price: 0,
    discountPrice: 0,
    imageUrls: [''],
    sizes: [],
    colors: [],
    stock: {},
    isActive: false,
    featured: false,
    tags: [],
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      // Map 'name' to 'productName' and 'images' to 'imageUrls' for compatibility with UI
      const mappedProducts = response.data.map((product) => ({
        ...product,
        productName: product.productName || product.name || '',
        imageUrls: product.imageUrls || product.images || [''],
      }));
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleOpen = (product = null) => {
    setOpen(true);
    if (product) {
      setIsEditing(true);
      setFormData({
        ...product,
        imageUrls: product.imageUrls || [''],
        sizes: product.sizes || [],
        colors: product.colors || [],
        stock: product.stock || {},
        tags: product.tags || [],
      });
    } else {
      setIsEditing(false);
      setFormData({
        productName: '',
        description: '',
        category: '',
        price: 0,
        discountPrice: 0,
        imageUrls: [''],
        sizes: [],
        colors: [],
        stock: {},
        isActive: false,
        featured: false,
        tags: [],
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setIsEditing(false);
  };

  const handleAddProduct = async () => {
    try {
      // Validate required fields
      if (!formData.productName.trim()) {
        setSnackbar({ open: true, message: 'Product name is required', severity: 'error' });
        return;
      }

      if (!formData.description.trim()) {
        setSnackbar({ open: true, message: 'Description is required', severity: 'error' });
        return;
      }

      if (!formData.category) {
        setSnackbar({ open: true, message: 'Category is required', severity: 'error' });
        return;
      }

      if (formData.price <= 0) {
        setSnackbar({ open: true, message: 'Price must be greater than 0', severity: 'error' });
        return;
      }

      // Map UI fields to backend fields and only include backend fields
      const dataToSend = {
        name: formData.productName,
        description: formData.description,
        price: formData.price,
        discountPrice: formData.discountPrice,
        images: formData.imageUrls.filter(url => url.trim() !== ''),
        category: formData.category,
        variants: formData.variants || [],
        isActive: isEditing ? formData.isActive : false,
        featured: formData.featured,
        tags: formData.tags,
        stock: formData.stock,
        sizes: formData.sizes,
        colors: formData.colors,
      };

      console.log('Data being sent to the backend');

      if (isEditing) {
        await axios.patch(`${API_URL}/admin/products/${formData._id}`, dataToSend, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });
        setSnackbar({ open: true, message: 'Product updated successfully!', severity: 'success' });
      } else {
        await axios.post(`${API_URL}/admin/products`, dataToSend, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });
        setSnackbar({ open: true, message: 'Product added successfully!', severity: 'success' });
      }

      fetchProducts();
      handleClose();
    } catch (error) {
      console.error('Error adding/updating product:', error.response ? error.response.data : error.message);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to add/update product. Please try again.', 
        severity: 'error' 
      });
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_URL}/admin/products/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });
        setSnackbar({ open: true, message: 'Product deleted successfully!', severity: 'success' });
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error.response ? error.response.data : error.message);
        setSnackbar({ open: true, message: 'Failed to delete product. Please try again.', severity: 'error' });
      }
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const productToToggle = products.find(product => product._id === id);
      if (!productToToggle) {
        throw new Error('Product not found');
      }

      const updatedStatus = !productToToggle.isActive;

      const response = await axios.patch(
        `${API_URL}/admin/products/${id}`, 
        { isActive: updatedStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data) {
        setProducts(products.map(product => 
          product._id === id ? { ...product, isActive: updatedStatus } : product
        ));
        setSnackbar({ 
          open: true, 
          message: `Product ${updatedStatus ? 'activated' : 'deactivated'} successfully!`, 
          severity: 'success' 
        });
      }
    } catch (error) {
      console.error('Error toggling product status:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to update product status. Please try again.', 
        severity: 'error' 
      });
    }
  };

  const handleImageUrlChange = (index, value) => {
    const updatedUrls = [...formData.imageUrls];
    updatedUrls[index] = value;
    setFormData({ ...formData, imageUrls: updatedUrls });
  };

  const addImageUrl = () => {
    setFormData({ ...formData, imageUrls: [...formData.imageUrls, ''] });
  };

  const removeImageUrl = (index) => {
    const updatedUrls = formData.imageUrls.filter((_, i) => i !== index);
    setFormData({ ...formData, imageUrls: updatedUrls });
  };

  const handleSizeToggle = (size) => {
    const updatedSizes = formData.sizes.includes(size)
      ? formData.sizes.filter(s => s !== size)
      : [...formData.sizes, size];
    setFormData({ ...formData, sizes: updatedSizes });
  };

  const addColor = () => {
    const color = prompt('Enter color name:');
    if (color && !formData.colors.includes(color)) {
      setFormData({ ...formData, colors: [...formData.colors, color] });
    }
  };

  const removeColor = (colorToRemove) => {
    setFormData({ 
      ...formData, 
      colors: formData.colors.filter(color => color !== colorToRemove) 
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({ 
      ...formData, 
      tags: formData.tags.filter(tag => tag !== tagToRemove) 
    });
  };

  return (
    <div>
      <h1>Merchandise Dashboard</h1>
      <Button variant="contained" color="primary" onClick={() => handleOpen()}>
        Add Product
      </Button>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Discount Price</TableCell>
              <TableCell>Featured</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id}>
                <TableCell>{product.productName}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>₹{product.price}</TableCell>
                <TableCell>
                  {product.discountPrice > 0 ? `₹${product.discountPrice}` : '-'}
                </TableCell>
                <TableCell>
                  <span style={{ 
                    color: product.featured ? '#4caf50' : '#757575',
                    fontWeight: product.featured ? 'bold' : 'normal'
                  }}>
                    {product.featured ? 'Yes' : 'No'}
                  </span>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outlined" 
                    color={product.isActive ? 'primary' : 'secondary'} 
                    onClick={() => handleToggleActive(product._id)}
                  >
                    {product.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={() => handleOpen(product)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    onClick={() => handleDeleteProduct(product._id)} 
                    style={{ marginLeft: '10px' }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Product Name"
            value={formData.productName}
            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            required
          />

          <TextField
            label="Category"
            select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            fullWidth
            margin="normal"
            required
          >
            {PRODUCT_CATEGORIES.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Price (₹)"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            label="Discount Price (₹)"
            type="number"
            value={formData.discountPrice}
            onChange={(e) => setFormData({ ...formData, discountPrice: Number(e.target.value) })}
            fullWidth
            margin="normal"
            helperText="Leave 0 for no discount"
          />

          <div style={{ marginTop: '20px', marginBottom: '10px' }}>
            <h4>Product Images</h4>
            {formData.imageUrls.map((url, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <TextField
                  label={`Image URL ${index + 1}`}
                  value={url}
                  onChange={(e) => handleImageUrlChange(index, e.target.value)}
                  fullWidth
                  margin="normal"
                />
                {formData.imageUrls.length > 1 && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => removeImageUrl(index)}
                    style={{ marginLeft: '10px' }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outlined"
              color="primary"
              onClick={addImageUrl}
            >
              Add Image URL
            </Button>
          </div>

          <div style={{ marginTop: '20px', marginBottom: '10px' }}>
            <h4>Available Sizes</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {PRODUCT_SIZES.map((size) => (
                <FormControlLabel
                  key={size}
                  control={
                    <Checkbox
                      checked={formData.sizes.includes(size)}
                      onChange={() => handleSizeToggle(size)}
                    />
                  }
                  label={size}
                />
              ))}
            </div>
          </div>

          <div style={{ marginTop: '20px', marginBottom: '10px' }}>
            <h4>Available Colors</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
              {formData.colors.map((color) => (
                <div key={color} style={{ 
                  background: '#f5f5f5', 
                  padding: '5px 10px', 
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {color}
                  <Button
                    size="small"
                    color="secondary"
                    onClick={() => removeColor(color)}
                    style={{ marginLeft: '5px', minWidth: 'auto' }}
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outlined"
              color="primary"
              onClick={addColor}
            >
              Add Color
            </Button>
          </div>

          <div style={{ marginTop: '20px', marginBottom: '10px' }}>
            <h4>Product Tags</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
              {formData.tags.map((tag) => (
                <div key={tag} style={{ 
                  background: '#e3f2fd', 
                  padding: '5px 10px', 
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {tag}
                  <Button
                    size="small"
                    color="secondary"
                    onClick={() => removeTag(tag)}
                    style={{ marginLeft: '5px', minWidth: 'auto' }}
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <TextField
                label="New Tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                size="small"
              />
              <Button
                variant="outlined"
                color="primary"
                onClick={addTag}
                disabled={!newTag.trim()}
              >
                Add Tag
              </Button>
            </div>
          </div>

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              />
            }
            label="Featured Product"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddProduct} color="primary" variant="contained">
            {isEditing ? 'Update Product' : 'Add Product'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </div>
  );
};

export default Merch;
