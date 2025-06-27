import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { convertGoogleDriveUrl } from "../utils/googleDriveUtils";
import { useState } from "react";

// Sparkle Effect Component
const Sparkles = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-purple-300 rounded-full opacity-0"
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5],
            x: [Math.random() * 100 - 50, Math.random() * 100 - 50],
            y: [Math.random() * 100 - 50, Math.random() * 100 - 50],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

const ProductCard = ({
  imageUrl,
  name,
  description,
  price,
  variants,
  isActive,
  onAddToCart,
}) => {
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const displayImageUrl = imageUrl ? convertGoogleDriveUrl(imageUrl) : "/placeholder-product.jpg";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`relative bg-[#121826] text-white rounded-3xl shadow-xl p-6 transition-all duration-300 overflow-hidden group ${
        isActive ? "border-4 border-purple-900/20 shadow-purple-500/50" : ""
      }`}
    >
      {/* Hover Glow & Diagonal Sweep Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-purple-600 opacity-0 group-hover:opacity-30 transition-all duration-500 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-40 transition-all duration-500 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[#ffffff1a] opacity-0 group-hover:opacity-10 transition-all duration-500 pointer-events-none"></div>

      {/* Particles */}
      {isActive && <Sparkles />}

      {/* Image with Overlay */}
      {imageUrl && (
        <div className="relative w-full overflow-hidden rounded-xl">
          <motion.img
            src={displayImageUrl}
            alt={name}
            className="w-full h-64 object-cover rounded-xl transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all duration-500 rounded-xl"></div>
        </div>
      )}

      {/* Product Details */}
      <div className="text-center mt-4">
        <h3 className="text-2xl font-bold text-purple-300">{name} ✨</h3>
        <p className="text-gray-400 text-sm mb-3">{description}</p>
        <p className="text-lg font-bold text-yellow-300">₹{price}</p>

        {/* Variant Selection */}
        <div className="mt-4 space-y-3">
          {/* Size Selection */}
          <div className="flex justify-center gap-2">
            {Array.from(new Set(variants.map(v => v.size))).map(size => (
              <button
                key={size}
                onClick={() => {
                  const newVariant = variants.find(v => v.size === size && v.color === selectedVariant.color);
                  if (newVariant) setSelectedVariant(newVariant);
                }}
                className={`px-3 py-1 rounded-lg ${selectedVariant.size === size
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Color Selection */}
          <div className="flex justify-center gap-2">
            {Array.from(new Set(variants.map(v => v.color))).map(color => (
              <button
                key={color}
                onClick={() => {
                  const newVariant = variants.find(v => v.color === color && v.size === selectedVariant.size);
                  if (newVariant) setSelectedVariant(newVariant);
                }}
                className={`w-6 h-6 rounded-full border-2 ${selectedVariant.color === color
                  ? 'border-white'
                  : 'border-transparent'
                }`}
                style={{ backgroundColor: color.toLowerCase() }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Add to Cart Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onAddToCart({ ...selectedVariant, productId: id, price })}
          disabled={!isActive || selectedVariant.stock === 0}
          className={`mt-4 relative bg-gradient-to-r from-purple-600 to-pink-700 text-white px-5 py-2 rounded-lg shadow-lg transition-all overflow-hidden ${
            !isActive || selectedVariant.stock === 0 ? "opacity-50 cursor-not-allowed" : "hover:shadow-xl"
          }`}
        >
          {!isActive ? "Coming Soon" : selectedVariant.stock === 0 ? "Out of Stock" : "Add to Cart 🛍️"}
          {/* Ripple Effect */}
          <span className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute w-16 h-16 bg-white/20 rounded-full"
              animate={{ scale: [0, 4], opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            ></motion.div>
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

ProductCard.propTypes = {
  imageUrl: PropTypes.string,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  variants: PropTypes.arrayOf(
    PropTypes.shape({
      size: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      stock: PropTypes.number.isRequired,
    })
  ).isRequired,
  isActive: PropTypes.bool.isRequired,
  onAddToCart: PropTypes.func.isRequired,
};

export default ProductCard;