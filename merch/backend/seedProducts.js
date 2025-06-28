require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/productModel');

// Sample product data
const sampleProducts = [
  {
    name: "Samarth T-Shirt - Classic",
    description: "Premium quality cotton t-shirt with the official Samarth logo. Comfortable and stylish for everyday wear.",
    price: 599,
    images: [
      "https://via.placeholder.com/400x400/1e40af/ffffff?text=Samarth+Classic+Tee"
    ],
    category: "clothing",
    subcategory: "t-shirts",
    variants: [
      { size: "S", color: "Black", stock: 50 },
      { size: "M", color: "Black", stock: 75 },
      { size: "L", color: "Black", stock: 100 },
      { size: "XL", color: "Black", stock: 50 },
      { size: "S", color: "White", stock: 50 },
      { size: "M", color: "White", stock: 75 },
      { size: "L", color: "White", stock: 100 },
      { size: "XL", color: "White", stock: 50 }
    ],
    tags: ["samarth", "logo", "cotton", "casual"],
    status: "active"
  },
  {
    name: "Samarth Hoodie - Premium",
    description: "Warm and cozy hoodie with embroidered Samarth logo. Perfect for winter and casual outings.",
    price: 1299,
    images: [
      "https://via.placeholder.com/400x400/374151/ffffff?text=Samarth+Hoodie"
    ],
    category: "clothing",
    subcategory: "hoodies",
    variants: [
      { size: "S", color: "Grey", stock: 30 },
      { size: "M", color: "Grey", stock: 45 },
      { size: "L", color: "Grey", stock: 60 },
      { size: "XL", color: "Grey", stock: 30 },
      { size: "S", color: "Navy", stock: 25 },
      { size: "M", color: "Navy", stock: 40 },
      { size: "L", color: "Navy", stock: 55 },
      { size: "XL", color: "Navy", stock: 25 }
    ],
    tags: ["samarth", "hoodie", "winter", "warm"],
    status: "active"
  },
  {
    name: "Samarth Coffee Mug",
    description: "Ceramic coffee mug with beautiful Samarth branding. Perfect for your morning coffee or tea.",
    price: 299,
    images: [
      "https://via.placeholder.com/400x400/dc2626/ffffff?text=Samarth+Mug"
    ],
    category: "accessories",
    subcategory: "drinkware",
    variants: [
      { size: "Standard", color: "White", stock: 100 },
      { size: "Standard", color: "Black", stock: 75 }
    ],
    tags: ["samarth", "mug", "ceramic", "coffee"],
    status: "active"
  },
  {
    name: "Samarth Laptop Sticker Pack",
    description: "Set of 5 high-quality vinyl stickers featuring various Samarth designs. Waterproof and durable.",
    price: 199,
    images: [
      "https://via.placeholder.com/400x400/059669/ffffff?text=Sticker+Pack"
    ],
    category: "accessories",
    subcategory: "stickers",
    variants: [
      { size: "Pack of 5", color: "Mixed", stock: 200 }
    ],
    tags: ["samarth", "stickers", "laptop", "vinyl"],
    status: "active"
  },
  {
    name: "Samarth Tote Bag",
    description: "Eco-friendly canvas tote bag with Samarth logo. Perfect for shopping and daily use.",
    price: 399,
    images: [
      "https://via.placeholder.com/400x400/7c3aed/ffffff?text=Samarth+Tote"
    ],
    category: "accessories",
    subcategory: "bags",
    variants: [
      { size: "Standard", color: "Natural", stock: 80 },
      { size: "Standard", color: "Black", stock: 60 }
    ],
    tags: ["samarth", "tote", "eco-friendly", "canvas"],
    status: "active"
  }
];

async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${products.length} sample products`);

    // Display created products
    products.forEach(product => {
      console.log(`- ${product.name} (₹${product.price})`);
    });

    console.log('✅ Product seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seeding script
seedProducts();
