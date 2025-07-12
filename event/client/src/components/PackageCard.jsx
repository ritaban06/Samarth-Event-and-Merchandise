import PropTypes from 'prop-types';
import { convertGoogleDriveUrl } from "../utils/googleDriveUtils";


const PackageCard = ({ package: pkg, onBuyClick, userPackage }) => {
  const isPackageActive = userPackage?.status === 'active';
  const isPaymentPending = userPackage?.payment?.status === 'pending';
  const displayImageUrl = pkg.imageUrl ? convertGoogleDriveUrl(pkg.imageUrl) : "/placeholder-event.jpg";
  const rulebookUrl = pkg.rulebookUrl ? pkg.rulebookUrl : '';

  return (
    <div
      className="relative bg-[#121826] text-white rounded-3xl shadow-xl p-6 transition-all duration-300 overflow-hidden group border-4 border-blue-900/20 shadow-blue-500/50"
    >
      {/* Hover Glow & Diagonal Sweep Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-600 opacity-0 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[#ffffff1a] opacity-0 pointer-events-none"></div>

      {/* Image with Overlay */}
      <div className="relative w-full overflow-hidden rounded-xl">
        <img
          src={displayImageUrl}
          alt={pkg.name}
          className="w-full h-64 object-cover rounded-xl"
        />
        <div className="absolute inset-0 bg-black/30 rounded-xl"></div>
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

        {/* Button */}
        <div className="mt-4 flex justify-center gap-4">
          <button
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
          </button>

          {rulebookUrl && (
            <a
              href={rulebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative bg-yellow-500 text-black px-4 py-2 rounded-lg hover:text-[#eaeaea] hover:bg-yellow-600 transition-all shadow-lg hover:shadow-[0_4px_20px_rgba(255,255,0,0.7)]"
            >
              📜 Rulebook
            </a>
          )}
        </div>
      </div>
    </div>
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