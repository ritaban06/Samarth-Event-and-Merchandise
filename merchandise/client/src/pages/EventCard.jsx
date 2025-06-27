import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { convertGoogleDriveUrl } from "../utils/googleDriveUtils";
import { Button } from "@mui/material";
import { useState, useEffect } from "react";

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

const EventCard = ({
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
  user,
  participants,
  teamName,
  teamuid,
  teamLeader,
}) => {
  const displayImageUrl = imageUrl ? convertGoogleDriveUrl(imageUrl) : "/placeholder-event.jpg";
  const formattedDate = new Date(date).toLocaleDateString();
  const isEventRegistered = participants?.some((p) => p.uid === user?.uid);
  const token = localStorage.getItem("token");

  let registrationStatusText = "";
  let isButtonDisabled = false;

  if (!user || !token) {
    registrationStatusText = "🔑 Login to Register";
  } else if (isEventRegistered) {
    const userRegistration = participants.find((p) => p.uid === user.uid);
    registrationStatusText =
      payment?.status === "paid"
        ? userRegistration?.payment?.status === "paid"
          ? "✅ Registration Confirmed"
          : `⌛ Pending (${userRegistration?.payment?.type === "cash" ? "Cash" : "Online"})`
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`relative bg-[#121826] text-white rounded-3xl shadow-xl p-6 transition-all duration-300 overflow-hidden group ${
        isActive ? "border-4 border-blue-900/20 shadow-blue-500/50" : ""
      }`}
    >
      {/* Hover Glow & Diagonal Sweep Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-600 opacity-0 group-hover:opacity-30 transition-all duration-500 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-40 transition-all duration-500 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[#ffffff1a] opacity-0 group-hover:opacity-10 transition-all duration-500 pointer-events-none"></div>

      {/* Particles */}
      {isActive && <Sparkles />}

      {/* Image with Overlay */}
      {imageUrl && (
        <div className="relative w-full overflow-hidden rounded-xl">
          <motion.img
            src={displayImageUrl}
            alt={eventName}
            className="w-full h-64 object-cover rounded-xl transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all duration-500 rounded-xl"></div>
        </div>
      )}

      {/* Event Details */}
      <div className="text-center mt-4">
        <h3 className="text-2xl font-bold text-blue-300">{eventName} ✨</h3>
        <pre className="text-gray-400 text-sm mb-3">{description}</pre>
        <p className="text-sm">
          <span className="font-semibold uppercase text-yellow-300">📅 Date:</span> {formattedDate}
        </p>
        <p className="text-sm">
          <span className="font-semibold uppercase text-yellow-300">📍 Venue:</span> { venue}
        </p>
        {/* <p className="text-sm">
          <span className="font-semibold uppercase text-yellow-300">🎭 Status:</span> {registrationStatusText}
        </p> */}

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

        {/* Buttons with Ripple Effect */}
        <div className="mt-4 flex justify-center gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onRegister}
            disabled={isButtonDisabled}
            className={`relative bg-gradient-to-r from-blue-600 to-purple-700 text-white px-5 py-2 rounded-lg shadow-lg transition-all overflow-hidden ${
              isButtonDisabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-xl"
            }`}
          >
            {registrationStatusText}
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
              className="relative bg-yellow-500 hover:text-[#eaeaea] text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition-all shadow-lg hover:shadow-[0_4px_20px_rgba(255,255,0,0.7)]"
            >
              📜 Rulebook
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

EventCard.propTypes = {
  imageUrl: PropTypes.string,
  rulebookUrl: PropTypes.string,
  eventName: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  venue: PropTypes.string.isRequired,
  maxParticipants: PropTypes.number.isRequired,
  currentParticipants: PropTypes.number.isRequired,
  isActive: PropTypes.bool.isRequired,
  onRegister: PropTypes.func.isRequired,
  user: PropTypes.object,
  payment: PropTypes.object,
  participants: PropTypes.array,
  teamName: PropTypes.string,
  teamuid: PropTypes.string,
  teamLeader: PropTypes.bool,
};

export default EventCard;
