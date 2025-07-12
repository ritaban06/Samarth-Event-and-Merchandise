import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  MapPin,
  Mail,
  Clock,
  Edit,
  LogOut,
  Star,
  Award,
  Wand2,
} from "lucide-react";
import { convertGoogleDriveUrl } from "../utils/googleDriveUtils";
import defaultProfilePic from '../images/defaultPrfPic.webp'
import Loader from "../components/Loader";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login"); // Redirect to login if not logged in
    }
    const fetchUserData = async () => {
      if (user) {
        try {
          //(user);
          // Fetch user profile data
          setProfileData({
            uid: user.uid,
            name: user.userName,
            email: user.email,
            bio: "🪄 Wingardium Leviosa ✨", // Example bio
            profilePicture: user.photoURL ? convertGoogleDriveUrl(user.photoURL) : defaultProfilePic, // Use Google profile picture
            dateOfBirth: user.dateOfBirth || "Not provided", // Example date of birth
            accountCreated: user.accountCreated || "Not available", // Example account creation date
          });

          // Fetch events from API
          const response = await axios.get(`${API_URL}/events`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          // Filter events to only include those where the user is a participant
          const userEvents = response.data.filter(event => 
            event.participants.some(participant => participant.uid === user.uid)
          );

          // Transform the data to match the UI format
          const formattedEvents = await Promise.all(userEvents.map(async event => {
            // Find this user's specific registration in the event
            const userRegistration = event.participants.find(
              participant => participant.uid === user.uid
            );

            // Determine payment status
            let paymentStatus;
            if (event.payment?.status === 'paid') {
              paymentStatus = userRegistration?.payment?.status === 'paid' ? 'Registered' : 
                              userRegistration?.payment?.status === 'pending' ? 'Pending' : 'Unpaid';
            } else {
              paymentStatus = 'Free Event';
            }
            // If it's a team event, fetch additional team details
            let teamDetails = null;
            if (event.team === 'team') {
              const teamLeader = event.participants.find(p => p.team && p.team.teamLeader && p.team.teamuid === userRegistration.team.teamuid);
              if (teamLeader) {
                teamDetails = {
                  teamLeader: teamLeader.uid == user.uid ? user.userName : teamLeader.name,
                  teamName: teamLeader.team.teamName,
                  teamuid: teamLeader.team.teamuid,
                  teammates: teamLeader.team.teammates || []
                };
              }
            }

            return {
              id: event._id,
              name: event.eventName,
              date: new Date(event.date).toLocaleDateString(),
              time: event.eventTime || "TBA",
              location: event.venue || "TBA",
              status: paymentStatus,
              icon: getRandomEventIcon(),
              description: event.description || "Join us for this exciting event!",
              imageUrl: event.imageUrl ? convertGoogleDriveUrl(event.imageUrl) : null,
              registrationDate: new Date(userRegistration?.registeredAt || event.createdAt).toLocaleDateString(),
              isPaid: event.payment?.status === 'paid',
              price: event.payment?.amount || 0,
              teamDetails // Include team details in the event object
            };
          }));

          setEvents(formattedEvents);
          setError(null);
        } catch (error) {
          console.error('Error fetching data:', error);
          setError('Failed to fetch event data');
        } finally {
          setLoading(false);
        }
      } else {
        // Handle case where user is not logged in
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  // Helper function to get a random event icon (you could map this based on event type instead)
  const getRandomEventIcon = () => {
    const icons = ["potion", "wand", "star"];
    return icons[Math.floor(Math.random() * icons.length)];
  };

  const getEventIcon = (icon, imageUrl) => {
    // If there's an image URL, use that instead of an icon
    if (imageUrl) {
      return (
        <div className="w-full h-32 overflow-hidden rounded-t-lg">
          <img loading="lazy" src={imageUrl} alt="Event" className="w-full h-full object-cover" />
        </div>
      );
    }
    
    // Fall back to icons if no image is available
    switch(icon) {
      case "potion":
        return <div className="bg-green-500/80 w-10 h-10 rounded-full flex items-center justify-center">
          <span className="text-xl">🧪</span>
        </div>;
      case "wand": 
        return <div className="bg-purple-500/80 w-10 h-10 rounded-full flex items-center justify-center">
          <Wand2 className="h-5 w-5 text-white" />
        </div>;
      case "star":
        return <div className="bg-blue-500/80 w-10 h-10 rounded-full flex items-center justify-center">
          <Star className="h-5 w-5 text-white" />
        </div>;
      default:
        return <div className="bg-yellow-500/80 w-10 h-10 rounded-full flex items-center justify-center">
          <Calendar className="h-5 w-5 text-white" />
        </div>;
    }
  };

  const getEventStatus = (status) => {
    const normalizedStatus = String(status).trim().toLowerCase();
    
    switch(normalizedStatus) {
      case "registered":
        return (
          <span className="bg-green-500/30 text-green-300 text-xs font-medium px-2.5 py-0.5 rounded-full border border-green-500/20">
            Registered
          </span>
        );
      case "unpaid":
        return (
          <span className="bg-red-500/30 text-red-300 text-xs font-medium px-2.5 py-0.5 rounded-full border border-red-500/20">
            Unpaid
          </span>
        );
      case "pending":
        return (
          <span className="bg-yellow-500/30 text-yellow-300 text-xs font-medium px-2.5 py-0.5 rounded-full border border-yellow-500/20">
            Pending
          </span>
        );
      case "free event":
        return (
          <span className="bg-green-500/30 text-green-300 text-xs font-medium px-2.5 py-0.5 rounded-full border border-green-500/20">
            Registered
          </span>
        );
      default:
        return (
          <span className="bg-gray-500/30 text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded-full border border-gray-500/20">
            Unknown
          </span>
        );
    }
  };

  if (loading)
    return (
      <Loader/>
    );

  return (
    <div className="min-h-screen text-white font-sans px-4 md:px-6 pt-20 h-max">
      {/* Header Section */}
      <header className="relative py-8 px-4 flex flex-col items-center">
        <h1 className="m-3 pt-1 pb-3 text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-400">
        🎓 Your Profile
        </h1>
        <p className="max-w-2xl text-center text-gray-300 text-lg mb-4">
        Welcome to your profile! Explore your achievements and showcase your potential. Your journey through the educational realm begins here! 🚀�
        </p>
        <div className="h-1 w-32 bg-amber-400 rounded-full mb-6"></div>
      </header>

      {profileData ? (
        <div className="max-w-7xl mx-auto pb-16 h-max">
          <div className="flex flex-col lg:flex-row gap-6 h-max">
            {/* Profile Card - Takes full width on mobile, side on desktop */}
            <div className="lg:w-1/3 h-max">
              <div className="bg-purple-800/30 backdrop-blur-sm rounded-xl border border-purple-700/50 overflow-hidden h-full">
                {/* Profile Header */}
                <div className="relative bg-gradient-to-r from-purple-900/80 to-purple-800/80 p-6 border-b border-purple-700/50">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-yellow-300/70">
                        <img
                          src={profileData.profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-yellow-300">
                        {profileData.name}
                      </h2>
                      <p className="text-purple-100 italic text-sm mt-1">"{profileData.bio}"</p>
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="p-5">
                  <div className="space-y-4">
                    {/* UID */}
                    <div className="group bg-purple-800/20 backdrop-blur-sm p-3 rounded-lg border border-purple-700/30 hover:border-yellow-400/30 transition-colors duration-300">
                      <div className="flex items-start gap-3">
                        <div className="bg-gradient-to-tr from-yellow-400 to-purple-600 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold mb-1 text-yellow-300">
                            UID
                          </h3>
                          <p className="text-purple-100 text-sm">
                            {profileData.uid}
                          </p>
                        </div>
                      </div>
                    </div>
                  
                    {/* Email */}
                    <div className="group bg-purple-800/20 backdrop-blur-sm p-3 rounded-lg border border-purple-700/30 hover:border-yellow-400/30 transition-colors duration-300">
                      <div className="flex items-start gap-3">
                        <div className="bg-gradient-to-tr from-yellow-400 to-purple-600 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0">
                          <Mail className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold mb-1 text-yellow-300">
                            Email Address
                          </h3>
                          <p className="text-purple-100 text-sm">{profileData.email}</p>
                        </div>
                      </div>
                    </div>

                    
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-col h-max">
                    {/* <button
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-full px-4 py-2 text-sm transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-105 flex items-center justify-center"
                      onClick={() =>
                        alert("Edit Profile functionality to be implemented.")
                      }
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </button> */}

                    <button
                      className="bg-transparent border-4 border-red-400 text-white font-bold rounded-full px-4 py-2 text-sm transition-all duration-300 hover:bg-red-300  flex items-center justify-center"
                      onClick={logout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Events Section - Takes up remaining space on desktop */}
            <div className="lg:w-2/3 h-max">
              <div className="bg-purple-800/30 backdrop-blur-sm rounded-xl border border-purple-700/50 overflow-hidden h-full">
                <div className="relative bg-gradient-to-r from-purple-900/80 to-purple-800/80 p-6 border-b border-purple-700/50">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-tr from-yellow-400 to-purple-600 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-yellow-300">
                      Your Events
                    </h2>
                  </div>
                </div>

                <div className="p-6">
                  {error && (
                    <div className="text-center py-4">
                      <p className="text-red-300">{error}</p>
                      <button 
                        onClick={() => window.location.reload()}
                        className="mt-2 text-yellow-300 underline"
                      >
                        Try again
                      </button>
                    </div>
                  )}
                  
                  {!error && events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {events.map((event) => (
                        <div key={event.id} className="group bg-purple-800/20 backdrop-blur-sm rounded-lg border border-purple-700/30 hover:border-yellow-400/30 transition-colors duration-300 overflow-hidden flex flex-col">
                          {/* Event Image or Icon at the top */}
                          {getEventIcon(event.icon, event.imageUrl)}
                          
                          <div className="p-4">
                            {/* Event Header */}
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-xl font-bold text-yellow-300 line-clamp-1">{event.name}</h3>
                              <div className="flex items-center gap-2 mt-2">{getEventStatus(event.status)}</div>
                            </div>

                            {/* Event Description */}
                            <p className="text-purple-100 text-sm mb-4 line-clamp-3">{event.description}</p>
                            
                            {/* Event Details */}
                            <div className="space-y-2 text-sm text-purple-200 mb-4">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-purple-300 flex-shrink-0" />
                                <span>{event.date}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-purple-300 flex-shrink-0" />
                                <span>{event.time}</span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-purple-300 flex-shrink-0" />
                                <span>{event.location}</span>
                              </div>
                            </div>

                            {/* Team Information */}
                            {event.teamDetails ? (
                              <div className="mt-4 mb-auto">
                                <h4 className="text-yellow-300 font-bold">Team Information</h4>
                                <p className="text-blue-400 font-bold">Team Name: {event.teamDetails.teamName}</p>
                                <p className="text-blue-400 font-bold">Team UID: {event.teamDetails.teamuid}</p>
                                <p className="text-blue-400 font-bold">Team Members:</p>
                                <ul className="list-disc list-inside text-blue-400 mb-4">
                                  {event.teamDetails.teammates.length > 0 ? (
                                    <>
                                      <li className="text-orange-500 font-bold">{event.teamDetails.teamLeader} (Team Leader)</li>
                                      {event.teamDetails.teammates.map((member, index) => (
                                        <li key={index} className="text-white font-bold">
                                          {member.name}
                                        </li>
                                      ))}
                                    </>
                                  ) : (
                                    <li className="text-white font-bold">{event.teamDetails.teamLeader} (Team Leader)</li>
                                  )}
                                </ul>
                              </div>
                            ):
                            (
                              <div className="mt-4 mb-6"><h4 className="text-yellow-300 font-bold">Solo Event</h4></div>
                            )}

                            {/* Registration Info */}
                            <div className="mt-auto pt-3 border-t border-purple-700/50 flex justify-between items-center">
                              <div>
                                {event.price > 0 ? (
                                  <span className="text-yellow-300 font-semibold">Paid Event - Rs. {event.price.toFixed(2)}</span>
                                ) : (
                                  <span className="text-green-300 font-semibold">Free Event</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    !error && (
                      <div className="text-center py-12">
                        <div className="text-5xl mb-4">✨</div>
                        <p className="text-xl text-yellow-300 font-bold mb-2">No Events Found</p>
                        <p className="text-blue-100">You haven't registered for any events yet.</p>
                        <a href="/events"><button className="mt-6 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold rounded-full px-6 py-3 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105">Browse Events</button></a>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Upcoming Events Quick View */}
              {events.length > 0 && (
                <div className="mt-6 bg-purple-800/30 backdrop-blur-sm rounded-xl border border-purple-700/50 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-yellow-300">Next Upcoming Event</h3>
                    {/* Calculate days until next event */}
                    {(() => {
                      // Sort events by date and find the next upcoming one
                      const sortedEvents = [...events].sort((a, b) => {
                        return new Date(a.date) - new Date(b.date);
                      });
                      
                      const nextEvent = sortedEvents.find(event => 
                        new Date(event.date) >= new Date()
                      );
                      
                      if (nextEvent) {
                        const daysUntil = Math.ceil(
                          (new Date(nextEvent.date) - new Date()) / (1000 * 60 * 60 * 24)
                        );
                        return <span className="text-purple-200 text-sm">
                          {daysUntil === 0 ? 'Today' : `In ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}
                        </span>;
                      }
                      return null;
                    })()}
                  </div>
                  
                  {(() => {
                    // Get the next upcoming event
                    const sortedEvents = [...events].sort((a, b) => {
                      return new Date(a.date) - new Date(b.date);
                    });
                    
                    const nextEvent = sortedEvents.find(event => 
                      new Date(event.date) >= new Date()
                    ) || sortedEvents[0]; // Fallback to the first event if none are upcoming
                    
                    if (nextEvent) {
                      return (
                        <div className="flex items-center">
                          {getEventIcon(nextEvent.icon)}
                          <div className="ml-4">
                            <h4 className="text-lg font-bold text-white">{nextEvent.name}</h4>
                            <p className="text-purple-200 text-sm">{nextEvent.date} • {nextEvent.location}</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Decorative element */}
          <div className="mt-12 flex justify-center">
            <div className="h-1 w-16 bg-purple-500 mx-2 rounded-full opacity-70"></div>
            <div className="h-1 w-4 bg-yellow-400 mx-2 rounded-full opacity-70"></div>
            <div className="h-1 w-8 bg-purple-500 mx-2 rounded-full opacity-70"></div>
          </div>
          
        </div>
      ) : (
        <div className="max-w-lg mx-auto px-6">
          <div className="bg-purple-800/30 backdrop-blur-sm p-8 rounded-xl border border-purple-700/50 text-center">
            <div className="text-5xl mb-4">✨</div>
            <p className="text-xl text-yellow-300 font-bold mb-2">No Profile Found</p>
            <p className="text-blue-100">Your profile seems to be hidden right now.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;