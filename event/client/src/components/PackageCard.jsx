import { motion } from "framer-motion";
import PropTypes from 'prop-types';
import { convertGoogleDriveUrl } from "../utils/googleDriveUtils";

// Sparkle Effect Component
const Sparkles = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-blue-300 rounded-full opacity-0"
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


const PackageCard = ({ package: pkg, onBuyClick, userPackage }) => {
  const isPackageActive = userPackage?.status === 'active';
  const isPaymentPending = userPackage?.payment?.status === 'pending';
  const displayImageUrl = pkg.imageUrl ? convertGoogleDriveUrl(pkg.imageUrl) : "/placeholder-event.jpg";
  const rulebookUrl = pkg.rulebookUrl ? pkg.rulebookUrl : '';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="relative bg-[#121826] text-white rounded-3xl shadow-xl p-6 transition-all duration-300 overflow-hidden group border-4 border-blue-900/20 shadow-blue-500/50"
    >
      {/* Hover Glow & Diagonal Sweep Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-600 opacity-0 group-hover:opacity-30 transition-all duration-500 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-40 transition-all duration-500 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[#ffffff1a] opacity-0 group-hover:opacity-10 transition-all duration-500 pointer-events-none"></div>

      {/* Particles */}
      <Sparkles />

      {/* Image with Overlay */}
      <div className="relative w-full overflow-hidden rounded-xl">
        <motion.img
          src={displayImageUrl}
          alt={pkg.name}
          className="w-full h-64 object-cover rounded-xl transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all duration-500 rounded-xl"></div>
        {isPackageActive && (
          <div className={`absolute top-4 right-4 ${
            isPaymentPending ? 'bg-yellow-500' : 'bg-green-500'
          } text-white px-3 py-1 rounded-full text-sm font-semibold`}>
            {isPaymentPending 
              ? 'Active (Payment Pending)' 
              : `Active (${userPackage.registered}/${userPackage.limit} Used)`}
          </div>
        )}
      </div>

      {/* Package Details */}
      <div className="text-center mt-4">
        <h3 className="text-2xl font-bold text-blue-300">{pkg.name} ✨</h3>
        < pre className="text-gray-400 text-sm mb-3">{pkg.description}</ pre>
        < p className="text-sm">
          <span className="font-semibold uppercase text-yellow-300">🎯 Limit:</span> {pkg.limit} events
        </p>
        <p className="text-sm text-yellow-300">
          <span className="font-semibold uppercase text-yellow-300">💰 Fee:</span> Rs.{pkg.price}
        </p>

        {/* Button with Ripple Effect */}
        <div className="mt-4 flex justify-center gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onBuyClick(pkg)}
            disabled={isPackageActive}
            className={`relative bg-gradient-to-r from-blue-600 to-purple-700 text-white px-5 py-2 rounded-lg shadow-lg transition-all overflow-hidden ${
              isPackageActive 
                ? "bg-gray-600 opacity-50 cursor-not-allowed" 
                : "bg-gradient-to-r from-blue-600 to-purple-700 hover:shadow-xl"
            }`}
          >
            {isPackageActive 
              ? isPaymentPending 
                ? '⌛ Payment Pending' 
                : '✅ Package Active' 
              : '🪄 Buy Package'}
            {/* Ripple Effect */}
            <span className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute w-16 h-16 bg-white/20 rounded-full"
                animate={{ scale: [0, 4], opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              ></motion.div>
            </span>
          </motion.button>

          {rulebookUrl && (
            <motion.a
              href={rulebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.95 }}
              className="relative bg-yellow-500 text-black px-4 py-2 rounded-lg hover:text-[#eaeaea] hover:bg-yellow-600 transition-all shadow-lg hover:shadow-[0_4px_20px_rgba(255,255,0,0.7)]"
            >
              📜 Rulebook
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

PackageCard.propTypes = {
  package: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    imageUrl: PropTypes.string.isRequired,
    limit: PropTypes.number.isRequired,
    rulebookUrl: PropTypes.string
  }).isRequired,
  onBuyClick: PropTypes.func.isRequired,
  userPackage: PropTypes.shape({
    status: PropTypes.string,
    limit: PropTypes.number,
    registered: PropTypes.number,
    payment: PropTypes.shape({
      status: PropTypes.string,
      type: PropTypes.string
    })
  })
};

export default PackageCard; 