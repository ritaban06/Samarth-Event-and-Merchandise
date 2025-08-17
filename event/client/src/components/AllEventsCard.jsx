import PropTypes from "prop-types";
import { convertGoogleDriveUrl } from "../utils/googleDriveUtils";

const AllEventsCard = ({
  imageUrl,
  payment,
  rulebookUrl,
  eventName,
  description,
  date,
  venue,
  maxParticipants,
  currentParticipants,
  isActive,
  onRegister,
  onViewMore,
  user,
  participants,
  teamName,
  teamuid,
  teamLeader,
  eventType = "current", // "current" or "past"
  highlights = [],
  winner = null,
}) => {
  const displayImageUrl = imageUrl
    ? convertGoogleDriveUrl(imageUrl)
    : "/placeholder-event.jpg";
  const formattedDate = new Date(date).toLocaleDateString();
  const isEventRegistered = participants?.some((p) => p.uid === user?.uid);
  const token = localStorage.getItem("token");
  const isPastEvent = eventType === "past";

  let registrationStatusText = "";
  let isButtonDisabled = false;

  if (isPastEvent) {
    registrationStatusText = "🏆 Event Completed";
    isButtonDisabled = true;
  } else {
    // Current event logic
    if (!user || !token) {
      registrationStatusText = "🔑 Login to Register";
    } else if (isEventRegistered) {
      const userRegistration = participants.find((p) => p.uid === user.uid);
      registrationStatusText =
        payment?.status === "paid"
          ? userRegistration?.payment?.status === "paid"
            ? "✅ Registration Confirmed"
            : `⌛ Pending (${
                userRegistration?.payment?.type === "cash" ? "Cash" : "Online"
              })`
          : "✅ Registration Confirmed";
      isButtonDisabled = true;
    } else if (!isActive) {
      registrationStatusText = "🚀 Going LIVE Soon";
      isButtonDisabled = true;
    } else if (currentParticipants >= maxParticipants) {
      registrationStatusText = "🎟️ Event Full";
      isButtonDisabled = true;
    } else {
      registrationStatusText = "🪄 Register Now";
    }
  }

  return (
    <div
      className={`relative bg-[#121826] text-white rounded-3xl shadow-xl p-6 transition-all duration-300 overflow-hidden group ${
        isActive && !isPastEvent
          ? "border-4 border-blue-900/20 shadow-blue-500/50"
          : isPastEvent
          ? "border-4 border-purple-900/20 shadow-purple-500/50"
          : ""
      }`}
    >
      {/* Event Type Badge */}
      {isPastEvent && (
        <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-purple-600 to-purple-800 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          PAST EVENT
        </div>
      )}

      {/* Hover Glow & Diagonal Sweep Effect - Kept for potential future use */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-600 opacity-0 pointer-events-none"></div>

      {/* Image with Overlay */}
      {imageUrl && (
        <div className="relative w-full overflow-hidden rounded-xl">
          <img
            src={displayImageUrl}
            alt={eventName}
            className="w-full h-64 object-cover rounded-xl"
          />
          <div
            className={`absolute inset-0 ${
              isPastEvent ? "bg-purple-900/40" : "bg-black/30"
            } rounded-xl`}
          ></div>

          {/* Winner Badge for Past Events
          {isPastEvent && winner && (
            <div className="absolute bottom-2 left-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-2 py-1 rounded-lg text-xs font-bold">
              🏆 {winner.achievement}
            </div>
          )} */}
        </div>
      )}

      {/* Event Details */}
      <div className="text-center mt-4">
        <h3
          className={`text-2xl font-bold ${
            isPastEvent ? "text-slate-50" : "text-blue-300"
          }`}
        >
          {eventName} ✨
        </h3>
        <pre className="text-gray-400 text-sm mb-3 break-words whitespace-normal">{description}</pre>

        {/* Event Info */}
        {!isPastEvent && (
          <>
            <p className="text-sm">
              <span className="font-semibold uppercase text-yellow-300">📅 Date:</span> {formattedDate}
            </p>
            <p className="text-sm">
              <span className="font-semibold uppercase text-yellow-300">📍 Venue:</span> {venue}
            </p>
            <p className="text-sm">
              <span className="font-semibold uppercase text-yellow-300">👥 Participants:</span> {currentParticipants}/{maxParticipants}
            </p>

            {payment.status === "paid" && (
              <p className="text-sm text-yellow-300">
                <span className="font-semibold uppercase">💰 Fee:</span> Rs.{payment.amount}
              </p>
            )}

            {teamName && (
              <p className="text-sm">
                <span className="font-semibold text-yellow-300">🏆 Team:</span> {teamName}
              </p>
            )}
            {teamLeader && (
              <p className="text-sm">
                <span className="font-semibold text-yellow-300">👑 Role:</span> Team Leader
              </p>
            )}
          </>
        )}

        {/* Past Event Highlights */}
        {/* {isPastEvent && highlights.length > 0 && (
          <div className="mt-4 p-3  rounded-lg ">
            <h4 className="text-sm font-bold text-purple-300 mb-2">Event Highlights:</h4>
            <div className="flex flex-wrap gap-1">
              {highlights.map((highlight, index) => (
                <span key={index} className="bg-purple-600/30 text-purple-200 px-2 py-1 rounded-full text-xs">
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        )} */}

        {/* Winner Information */}
        {/* {isPastEvent && winner && (
          <div className="mt-3 p-3 bg-yellow-600/10 rounded-lg border border-yellow-500/30">
            <p className="text-yellow-300 text-sm font-bold">
              🏆 Winner: {winner.name}
            </p>
            <p className="text-yellow-200 text-xs">{winner.achievement}</p>
          </div>
        )} */}

        {/* Buttons */}
        <div className="mt-4 flex justify-center gap-4">
          {!isPastEvent && (
            <button
              onClick={onRegister}
              disabled={isButtonDisabled}
              className={`relative bg-gradient-to-r from-blue-600 to-purple-700 text-white px-5 py-2 rounded-lg shadow-lg transition-all overflow-hidden ${
                isButtonDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:shadow-xl"
              }`}
            >
              {registrationStatusText}
            </button>
          )}

          {/* {isPastEvent && (
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-5 py-2 rounded-lg shadow-lg opacity-75">
              {registrationStatusText}
            </div>
          )} */}

          {rulebookUrl && (
            <button
              onClick={onViewMore}
              className="relative bg-gradient-to-r from-[#6a0dad] to-[#d8b4fe] hover:text-[#eaeaea] text-black px-4 py-2 rounded-lg hover:bg-purple-600 transition-all shadow-lg hover:shadow-[0_4px_20px_rgba(168,85,247,0.6)]"
            >
              📜 View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

AllEventsCard.propTypes = {
  imageUrl: PropTypes.string,
  payment: PropTypes.object,
  rulebookUrl: PropTypes.string,
  eventName: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  venue: PropTypes.string.isRequired,
  maxParticipants: PropTypes.number.isRequired,
  currentParticipants: PropTypes.number.isRequired,
  isActive: PropTypes.bool.isRequired,
  onRegister: PropTypes.func,
  onViewMore: PropTypes.func,
  user: PropTypes.object,
  participants: PropTypes.array,
  teamName: PropTypes.string,
  teamuid: PropTypes.string,
  teamLeader: PropTypes.bool,
  eventType: PropTypes.oneOf(["current", "past"]),
  highlights: PropTypes.array,
  winner: PropTypes.object,
};

export default AllEventsCard;
