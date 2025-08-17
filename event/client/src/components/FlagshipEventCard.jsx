import React from "react";

const FlagshipEventCard = ({ event }) => {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#1a093a] to-[#22104a] shadow-xl p-7 flex flex-col items-center border border-purple-900/30 relative min-h-[480px] transition-all duration-300 hover:shadow-purple-700/30">
      <div className="w-full h-36 rounded-xl bg-[#23124a] mb-5 flex items-center justify-center overflow-hidden relative">
        {/* Event image */}
        <img
          src={event.image}
          alt={event.title}
          className="object-cover w-full h-full rounded-xl border border-purple-900/20"
          style={{ background: '#23124a' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
        {/* Fallback if no image */}
        {!event.image && (
          <span className="text-gray-400 text-lg">{event.title}</span>
        )}
        <span className="absolute top-3 right-3 bg-purple-600/80 text-white text-xs px-3 py-1 rounded-full font-semibold tracking-wide shadow">PAST EVENT</span>
      </div>
      {/* Award badge */}
      {event.award && (
        <div className="absolute left-4 top-28 z-10">
          <span className="bg-yellow-400 text-black text-xs px-2 py-1 rounded font-semibold shadow-lg">{event.award.label}</span>
        </div>
      )}
      <h3 className="text-2xl font-extrabold text-white text-center mb-1 mt-2 tracking-tight leading-tight">
        {event.title} <span className="text-yellow-300">✨</span>
      </h3>
      <p className="text-gray-300 text-center text-[15px] mb-4 max-w-xs font-medium">
        {event.description}
      </p>
      <div className="flex flex-col gap-1 mb-4 w-full">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-blue-300">📅 Date:</span>
          <span className="text-white">{event.date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-pink-300">📍 Venue:</span>
          <span className="text-white">{event.venue}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-purple-300">👥 Participants:</span>
          <span className="text-white">{event.participants}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-yellow-400">💰 Fee:</span>
          <span className="text-white">{event.fee}</span>
        </div>
      </div>
      <div className="bg-[#23124a] rounded-lg p-3 mb-4 w-full border border-purple-900/10">
        <h4 className="text-purple-300 font-semibold mb-2 text-sm">Event Highlights:</h4>
        <div className="flex flex-wrap gap-2">
          {event.highlights.map((highlight, idx) => (
            <span key={idx} className="bg-purple-700/80 text-white text-xs px-2 py-1 rounded-full font-medium shadow">{highlight}</span>
          ))}
        </div>
      </div>
      {/* Winner section */}
      {event.award && (
        <div className="bg-yellow-400/90 text-black rounded-lg px-3 py-2 mb-4 w-full text-center font-semibold shadow">
          <span className="text-base">🏆 Winner: {event.award.winner}</span>
          <br />
          <span className="text-xs font-normal">{event.award.label}</span>
        </div>
      )}
      <div className="flex justify-center mt-auto w-full">
        <button className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg font-bold w-full shadow transition-all duration-200">Event Completed</button>
      </div>
    </div>
  );
};

export default FlagshipEventCard;
