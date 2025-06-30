import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, MenuItem, FormLabel, FormGroup, FormControlLabel, Checkbox, InputLabel, Select, FormControl, Radio } from "@mui/material";
import { useNavigate } from "react-router-dom";
import EventCard from "./EventCard";
import Loader from "../components/Loader";
import { motion } from "framer-motion";
import Packages from "./Packages";

const API_URL = import.meta.env.VITE_API_URL;
const RPG_ID = import.meta.env.VITE_RPG_ID;
//("url:",API_URL);
//("RPG_ID:",RPG_ID); // Add this to debug

// Validate critical environment variables
if (!RPG_ID) {
  console.error('CRITICAL ERROR: Razorpay Key ID is missing!');
  console.error('Make sure VITE_RPG_ID is set in your .env file');
}

if (!API_URL) {
  console.error('CRITICAL ERROR: API URL is missing!');
  console.error('Make sure VITE_API_URL is set in your .env file');
}


const getDefaultRegistrationData = () => ({
  uid: '',
  name: '',
  email: '',
  additionalDetails: new Map(),
  paymentType: 'online',
  paymentStatus: 'unpaid',
  paymentDate: new Date().toISOString(),
  team: {
    teamLeader: false,
    teamuid: '',
    teamName: '',
    teammates: []
  }
});

const Events = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [particles, setParticles] = useState([]);
  const [error, setError] = useState(null);
  const [openRegisterModal, setOpenRegisterModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [registrationData, setRegistrationData] = useState(getDefaultRegistrationData());
  const [isTeamLeader, setIsTeamLeader] = useState(false); // New state for team leader
  
  // Payment related states
  const [paymentId, setPaymentId] = useState("");
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [userPackage, setUserPackage] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('token') || !localStorage.getItem('user')) {
      setSelectedEvent(null);
      setOpenRegisterModal(false);
      setRegistrationData(getDefaultRegistrationData());
    }
  }, [user]);

  useEffect(() => {
    // Generate random floating particles (like magical sparks)
    const newParticles = Array.from({ length: 25 }).map(() => ({
      id: Math.random(),
      top: Math.random() * 100 + "%",
      left: Math.random() * 100 + "%",
      size: Math.random() * 4 + 2 + "px",
      delay: Math.random() * 5 + "s",
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/events`);
        setEvents(data);
      } catch (err) {
        setError('Coming Soon !');
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  

  // Add new function to fetch package details
  const fetchUserPackage = async (uid) => {
    try {
      const response = await axios.get(`${API_URL}/packages/datafetch`, {
        params: { id: uid }  // Send as query parameter
      });
      setUserPackage(response.data.package);
      return response.data.package;
    } catch (error) {
      console.error('Error fetching user package:', error);
      return null;
    }
  };

  const handleRegisterClick = async (event) => {
    if (!localStorage.getItem('token') || !localStorage.getItem('user') || !user) {
      navigate('/login', { state: { from: '/events', eventId: event._id } });
      return;
    }

    // Fetch package details when opening registration modal
    const packageDetails = await fetchUserPackage(user.uid);
    
    // Check package status and limits
    const hasActivePackage = packageDetails?.status === 'active';
    const withinLimit = packageDetails?.registered < packageDetails?.limit;
    
    setSelectedEvent(event);
    setRegistrationData({
      ...getDefaultRegistrationData(),
      uid: user.uid || '',
      name: user.userName || '',
      email: user.email || '',
      // Set payment type to 'package' if user has active package and within limits
      paymentType: (hasActivePackage && withinLimit && packageDetails.payment.status === 'paid' && event.payment.status === 'paid') ? 'package' : 'online'
    });
    setIsTeamLeader(false);
    setOpenRegisterModal(true);
  };

  const handleRegisterClose = () => {
    setOpenRegisterModal(false);
    setSelectedEvent(null);
    setRegistrationData(prev => ({ ...prev, additionalDetails: new Map(), paymentType: 'cash', paymentDate: new Date().toISOString() }));
  };

  const handleTeamLeaderChange = (e) => {
    setIsTeamLeader(e.target.checked);
  };

  const handleTeamUIDChange = (e) => {
    setRegistrationData(prev => ({
      ...prev,
      team: {
        ...prev.team,
        teamuid: e.target.value
      }
    }));
  };


  const handleRegistrationChange = (fieldName, value) => {
    setRegistrationData(prev => ({
      ...prev,
      additionalDetails: new Map(prev.additionalDetails).set(fieldName, value)
    }));
  };

  // Add Razorpay related functions
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createRazorpayOrder = async (amount) => {
    try {
      setIsPaymentProcessing(true);
      
      let data = JSON.stringify({
        amount: amount * 100,
        currency: "INR"
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${API_URL}/orders`,
        headers: { 'Content-Type': 'application/json' },
        data: data
      };

      const response = await axios.request(config);
      return handleRazorpayScreen(response.data.amount, response.data.order_id);
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      setSnackbar({
        open: true,
        message: 'Failed to initiate payment. Please try again.',
        severity: 'error'
      });
      return false;
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const handleRazorpayScreen = async (amount, orderId) => {
    try {
      // Validate Razorpay key before proceeding
      if (!RPG_ID) {
        setSnackbar({
          open: true,
          message: 'Payment system configuration error. Please contact support.',
          severity: 'error'
        });
        return false;
      }

      const res = await loadRazorpayScript();
  
      if (!res) {
        setSnackbar({
          open: true,
          message: 'Razorpay SDK failed to load. Please try again later.',
          severity: 'error'
        });
        return false;
      }
  
      return new Promise((resolve) => {
        const options = {
          key: RPG_ID,
          amount: amount,
          currency: 'INR',
          name: "Samarth TMSL",
          description: `Payment for ${selectedEvent?.eventName || 'Event Registration'}`,
          image: "https://www.samarthtmsl.xyz/static/media/newlogo.4c305fa8ce55a571ace0.webp",
          order_id: orderId,
          handler: async function (response) {
            const razorpayPaymentId = response.razorpay_payment_id;
            setPaymentId(razorpayPaymentId);
            
            try {
              const registrationPayload = {
                uid: registrationData.uid,
                name: registrationData.name,
                email: registrationData.email,
                additionalDetails: Object.fromEntries(registrationData.additionalDetails),
                payment: {
                  status: 'pending',
                  type: 'online',
                  payment_id: razorpayPaymentId,
                  amount: selectedEvent.payment.amount,
                  date: new Date().toISOString()
                }
              };

              // Include team information if it's a team event
              if (selectedEvent.team === 'team') {

                
                
                registrationPayload.team = {
                  teamLeader: isTeamLeader,
                  teamuid: registrationData.team.teamuid,
                  teammates: isTeamLeader ? [] : undefined,
                  teamName: isTeamLeader ? registrationData.teamName : undefined
                };
              }

              const response = await axios.patch(
                `${API_URL}/events/${selectedEvent._id}/register`, 
                registrationPayload
              );

              

              setEvents(prevEvents => 
                prevEvents.map(event => 
                  event._id === selectedEvent._id ? response.data : event
                )
              );

              setSnackbar({
                open: true,
                message: 'Registration successful! Payment is being verified.',
                severity: 'success'
              });

              handleRegisterClose();
              fetchPaymentDetails(razorpayPaymentId);
              resolve(true);

              if (selectedEvent.team === 'team') {
                let teamDetails;
                if (isTeamLeader) {
                  teamDetails = {
                    teamLeader: true,
                    teamName: registrationData.teamName,
                    teamuid: registrationData.team.teamuid,
                    };
                }
                else{
                  const response = await axios.get(`${API_URL}/events/${selectedEvent._id}/team/${registrationData.team.teamuid}`);
                  teamDetails = {
                    teamLeader: false,
                    teamName: response.data.teamName,
                    teamuid: response.data.teamuid,
                  };
                }
                
                setEvents(prevEvents => 
                  prevEvents.map(event => 
                    event._id === selectedEvent._id ? { ...event, ...teamDetails } : event
                  )
                );
              }
              
            } catch (error) {
              console.error('Registration error:', error);
              setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Registration failed. Please contact support.',
                severity: 'error'
              });
              resolve(false);
            }
          },
          modal: {
            ondismiss: function() {
              //("Payment modal dismissed");
              setSnackbar({
                open: true,
                message: 'Payment cancelled. Please try again.',
                severity: 'warning'
              });
              resolve(false);
            }
          },
          prefill: {
            name: user?.userName || "",
            email: user?.email || "",
            contact: user?.phone || ""  // Add phone if available
          },
          notes: {
            eventName: selectedEvent?.eventName,
            userId: user?.uid
          },
          theme: {
            color: "#F4C430"
          }
        };
  
        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function (response) {
          console.error("Payment failed:", response.error);
          setSnackbar({
            open: true,
            message: `Payment failed: ${response.error.description}`,
            severity: 'error'
          });
          resolve(false);
        });
        
        paymentObject.open();
      });
    } catch (error) {
      console.error("Error handling Razorpay screen:", error);
      return false;
    }
  };

  const fetchPaymentDetails = async (paymentId) => {
    try {
      const response = await axios.get(`${API_URL}/payment/${paymentId}`);
      setPaymentDetails(response.data);
      
      if (response.data.status === 'captured' || response.data.status === 'authorized') {
        const statusUpdated = await handlePaymentStatusUpdate(
          selectedEvent._id,
          user.uid,
          'paid'
        );
        
        if (statusUpdated) {
          setSnackbar({
            open: true,
            message: 'Payment successful! Registration confirmed.',
            severity: 'success'
          });
        }
        return true;
      } else {
        setSnackbar({
          open: true,
          message: `Payment ${response.data.status}. Please contact support if needed.`,
          severity: 'info'
        });
        return false;
      }
    } catch (error) {
      console.error("Error fetching payment details:", error);
      setSnackbar({
        open: true,
        message: 'Failed to verify payment status. Please contact support.',
        severity: 'error'
      });
      return false;
    }
  };

  const handleRegisterSubmit = async () => {
    try {
      // Validate required fields
      const validationError = validateRegistrationData(registrationData, selectedEvent);
      if (validationError) {
        setSnackbar({
          open: true,
          message: validationError,
          severity: 'error'
        });
        return;
      }
  
      // Generate teamuid for team leaders
      const teamuid = isTeamLeader ? generateTeamCode() : registrationData.team.teamuid;
      registrationData.team.teamuid = teamuid;
 
      let payload = {
        uid: registrationData.uid,
        name: registrationData.name,
        email: registrationData.email,
        additionalDetails: Object.fromEntries(registrationData.additionalDetails),
        payment: {
          status: selectedEvent.payment.status === 'free' ? 'free' : 'pending',
          type: registrationData.paymentType,
          amount: selectedEvent.payment.amount,
          date: new Date().toISOString()
        }
      };
  
      // Handle team event logic
      if (selectedEvent.team === 'team') {
        payload.team = {
          teamLeader: isTeamLeader,
          teamuid: teamuid,
          teammates: isTeamLeader ? [] : undefined, // Only include teammates for team leaders
          teamName: isTeamLeader ? registrationData.teamName : undefined // Add team name only for team leaders
        };
      }

      if (selectedEvent.team === 'team' && !isTeamLeader) {
        // Fetch the event details to check the current number of participants
        var currentParticipants = 0;
        selectedEvent.participants.forEach((participant) => {
          if(participant.team.teamuid === payload.team.teamuid){
            currentParticipants+=1;
          }
        });

        if (currentParticipants >= selectedEvent.teamSize) {
          setSnackbar({
            open: true,
            message: "Team is already full",
            severity: 'error'
          });
          return;
        }
      }
  
      if (registrationData.paymentType === 'online' && selectedEvent.payment.status === 'paid') {
        const paymentSuccess = await createRazorpayOrder(selectedEvent.payment.amount);
        if (!paymentSuccess) return;
      } else {
        const registrationResponse = await axios.patch(`${API_URL}/events/${selectedEvent._id}/register`, payload);
        setEvents(prevEvents => prevEvents.map(event => event._id === selectedEvent._id ? registrationResponse.data : event));
        
        // If registration was successful and payment type was 'package'
        if (registrationResponse.data && registrationData.paymentType === 'package') {
          try {
            await axios.patch(`${API_URL}/packages/update-count/${user.uid}`);
          } catch (error) {
            console.error('Failed to update package count:', error);
            setSnackbar({
              open: true,
              message: 'Event registration successful but package count update failed',
              severity: 'warning'
            });
            return;
          }
        }

        setSnackbar({
          open: true,
          message: 'Registration successful!',
          severity: 'success'
        });
        handleRegisterClose();
      }

      // Fetch team details after registration
      if (selectedEvent.team === 'team') {
        let teamDetails;
        if (isTeamLeader) {
          teamDetails = {
            teamLeader: true,
            teamName: registrationData.teamName,
            teamuid: teamuid,
          };
        } else {
          const response = await axios.get(`${API_URL}/events/${selectedEvent._id}/team/${registrationData.team.teamuid}`);
          teamDetails = {
            teamLeader: false,
            teamName: response.data.teamName,
            teamuid: response.data.teamuid,
          };
        }

        // Update the event card with team details
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event._id === selectedEvent._id ? { ...event, ...teamDetails } : event
          )
        );
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Registration failed',
        severity: 'error'
      });
    }
  };
  
  // Helper function to generate a 6-digit team code
  const generateTeamCode = () => {
    const lastFourDigits = user.uid.slice(-4); // Extract last 4 digits
    const randomTwoDigits = Math.floor(Math.random() * 100).toString().padStart(2, "0");
    return lastFourDigits + randomTwoDigits;
};

  // Add this function to handle payment status updates
  const handlePaymentStatusUpdate = async (eventId, userId, status) => {
    try {
      const response = await axios.patch(`${API_URL}/events/${eventId}/payment-status`, {
        userId,
        status
      });
      
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event._id === eventId ? response.data : event
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error updating payment status:', error);
      return false;
    }
  };

  // Add this validation function near the top of the file
  const validateRegistrationData = (registrationData, selectedEvent) => {
    // Check basic required fields
    if (!registrationData.name || !registrationData.email) {
      return 'Name and email are required';
    }

    // Check if team name is provided only by team leaders
    if (selectedEvent.team === 'team' && registrationData.teamName && !isTeamLeader) {
      return 'Only team leaders can provide a team name';
    }

    // Check additional required fields
    for (const field of selectedEvent.additionalFields || []) {
      if (field.required && !registrationData.additionalDetails.get(field.name)) {
        return `${field.name} is required`;
      }
    }

    return null; // Return null if validation passes
  };

  if (loading)
    return (
      <Loader/>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-red-400 text-center">
          <p className="text-xl mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-yellow-700/50 text-white rounded-lg hover:bg-yellow-700/70">Retry</button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen py-20 px-6 flex flex-col items-center bg-gradient-to-r text-white">
      <header className="relative text-center py-10 flex flex-col items-center">
      <h1 className="m-3 pt-1 pb-3 text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-purple-300">
          🧙‍♂️ The Marauder's Map
        </h1>
        <p className="max-w-2xl text-center text-gray-300 text-lg mb-4">
        The Package Event grants you entry into any six legendary trials of your choosing at a fixed price but choose wisely, for each step seals your fate! 🪄
        </p>
        <div className="h-1 w-32 bg-yellow-400 rounded-full mb-6 justify-center items-center"></div>
      </header>
      <Packages/>
      <header className="relative text-center py-10 flex flex-col items-center mt-12">
      <h1 className="m-3 pt-1 pb-3 text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-purple-300">
          🧙‍♂️ Magical Events at Hogwarts
        </h1>
        <p className="max-w-2xl text-center text-gray-300 text-lg mb-4">
          Discover enchanting events and immerse yourself in a world of magic and mystery. Register now and let the magic begin! ✨🪄
        </p>
        <div className="h-1 w-32 bg-yellow-400 rounded-full mb-6 justify-center items-center"></div>
      </header>

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="text-center text-gray-300">
          <p>{error}</p>
        </div>
      ) : events && events.length === 0 ? (
        <div className="text-center text-gray-300">
          <p>No events available at the moment. Check back later for more magical happenings!</p>
        </div>
      ) : events && Array.isArray(events) ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10 max-w-7xl"
        >
          {events.map((event) => (
            <EventCard
              key={event._id}
              {...event}
              onRegister={() => handleRegisterClick(event)}
              user={user}
            />
          ))}
        </motion.div>
      ) : null}
      <Dialog 
        open={openRegisterModal} 
        onClose={handleRegisterClose} 
        PaperProps={{ className: "bg-gray-800 text-white rounded-xl" }}
      >
        <DialogTitle className="text-center">Register for {selectedEvent?.eventName}</DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-2">
            <TextField 
              label="UID" 
              value={registrationData.uid} 
              disabled 
              fullWidth 
              className="bg-gray-700/30 border border-yellow-400/30 rounded-xl text-white placeholder-yellow-300 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all duration-300" 
            />
            <TextField 
              label="Name" 
              value={registrationData.name} 
              disabled 
              fullWidth 
              className="bg-gray-700/30 border border-yellow-400/30 rounded-xl text-white placeholder-yellow-300 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all duration-300" 
            />
            <TextField 
              label="Email" 
              value={registrationData.email} 
              disabled 
              fullWidth 
              className="bg-gray-700/30 border border-yellow-400/30 rounded-xl text-white placeholder-yellow-300 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all duration-300" 
            />

            {selectedEvent?.team === 'team' && (
                  <>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isTeamLeader}
                          onChange={handleTeamLeaderChange}
                          sx={{
                            color: 'rgb(0 0 0)',
                            '&.Mui-checked': {
                              color: 'rgb(0 0 0)',
                            },
                          }}
                        />
                      }
                      label="Register as Team Leader"
                      style={{ color: 'rgb(0 0 0)' }}
                    />
                    {!isTeamLeader && (
                      <TextField
                        label="Team UID"
                        value={registrationData.team.teamuid}
                        onChange={handleTeamUIDChange}
                        fullWidth
                        required
                        className="bg-gray-700/30 border border-yellow-400/30 rounded-xl text-white"
                      />
                    )}

                    {isTeamLeader && (
                      <TextField
                         label="Team Name"
                         value={registrationData.teamName}
                         onChange={(e) => setRegistrationData(prev => ({ ...prev, teamName: e.target.value }))}
                         fullWidth
                         required
                         className="bg-gray-700/30 border border-yellow-400/30 rounded-xl text-white"
                      />
                    )}
                  </>
                )}

            {selectedEvent?.payment?.status === 'paid' && (
              <TextField
                select
                label="Payment Type"
                value={registrationData.paymentType}
                onChange={(e) => setRegistrationData(prev => ({ ...prev, paymentType: e.target.value }))}
                fullWidth
                required
                // Use userPackage state for checking status and limits
                disabled={userPackage?.status === 'active' && 
                         userPackage?.registered < userPackage?.limit && userPackage?.payment?.status === 'paid'}
                className="bg-gray-700/30 border border-yellow-400/30 rounded-xl text-white"
              >
                {/* Show package option only if user has active package and within limits */}
                {userPackage?.status === 'active' && 
                 userPackage?.registered < userPackage?.limit && userPackage?.payment?.status === 'paid' && (
                  <MenuItem value="package">Package</MenuItem>
                )}
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="online">Online</MenuItem>
              </TextField>
            )}

            {selectedEvent?.additionalFields?.map((field, index) => {
              const commonProps = {
                key: index,
                label: field.name,
                required: field.required,
                fullWidth: true,
                value: registrationData.additionalDetails.get(field.name) || '',
                onChange: (e) => handleRegistrationChange(field.name, e.target.value),
                className: "bg-gray-700/30 border border-yellow-400/30 rounded-xl text-white"
              };

              // Handle basic input types
              if (['text', 'paragraph', 'number', 'date', 'time', 'email', 'phone'].includes(field.type)) {
                return <TextField {...commonProps} type={field.type} />;
              }

              // Handle select/dropdown
              if (field.type === 'select' || field.type === 'dropdown') {
                return (
                  <FormControl key={index} fullWidth variant="outlined">
                    <InputLabel className="text-white">{field.name}</InputLabel>
                    <Select
                      value={registrationData.additionalDetails.get(field.name) || ''}
                      onChange={(e) => handleRegistrationChange(field.name, e.target.value)}
                      label={field.name}
                      required={field.required}
                      className="bg-gray-700/30 border border-yellow-400/30 rounded-xl text-white"
                    >
                      {field.options?.map((option, i) => (
                        <MenuItem key={i} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                );
              }

              // Handle radio buttons
              if (field.type === 'radio') {
                return (
                  <FormControl key={index} component="fieldset">
                    <FormLabel component="legend" style={{ color: 'rgb(0 0 0)' }}>{field.name}</FormLabel>
                    {field.options?.map((option, i) => (
                        <FormControlLabel
                          key={i}
                          value={option}
                          control={
                            <Radio
                              checked={registrationData.additionalDetails.get(field.name) === option}
                              onChange={(e) => handleRegistrationChange(field.name, e.target.value)}
                              sx={{
                                color: 'rgb(0 0 0)',
                                '&.Mui-checked': {
                                  color: 'rgb(0 0 0)',
                                },
                              }}
                            />
                          }
                          label={option}
                          style={{ color: 'rgb(0 0 0)' }}
                        />
                    ))}
                  </FormControl>
                );
              }

              // Handle checkboxes
              if (field.type === 'checkbox') {
                return (
                  <FormControl key={index} component="fieldset">
                    <FormLabel component="legend" style={{ color: 'rgb(250 204 21)' }}>{field.name}</FormLabel>
                    <FormGroup>
                      {field.options?.map((option, i) => (
                        <FormControlLabel
                          key={i}
                          control={
                            <Checkbox
                              checked={registrationData.additionalDetails.get(field.name)?.includes(option) || false}
                              onChange={(e) => {
                                const currentValues = registrationData.additionalDetails.get(field.name) || [];
                                const newValues = e.target.checked 
                                  ? [...currentValues, option] 
                                  : currentValues.filter(val => val !== option);
                                handleRegistrationChange(field.name, newValues);
                              }}
                              sx={{
                                color: 'rgb(0 0 0)',
                                '&.Mui-checked': {
                                  color: 'rgb(0 0 0)',
                                },
                              }}
                            />
                          }
                          label={option}
                          style={{ color: 'rgb(0 0 0)' }}
                        />
                      ))}
                    </FormGroup>
                  </FormControl>
                );
              }

              return null;
            })}

            {paymentId && (
              <div className="mt-4 p-3 bg-purple-900/30 rounded-lg">
                <h4 className="font-medium mb-2">Payment Information</h4>
                <p className="text-sm">Payment ID: {paymentId}</p>
                {paymentDetails && (
                  <>
                    <p className="text-sm">Amount: Rs. {paymentDetails.amount / 100}</p>
                    <p className="text-sm">Status: {paymentDetails.status}</p>
                    <p className="text-sm">Method: {paymentDetails.method}</p>
                  </>
                )}
              </div>
            )}
          </div>
        </DialogContent>
        <DialogActions className="flex justify-between p-4">
          <Button 
            onClick={handleRegisterClose} 
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRegisterSubmit} 
            variant="contained" 
            color="primary" 
            className="bg-green-600 hover:bg-green-700 transition-all rounded-md"
            disabled={isPaymentProcessing}
          >
            {isPaymentProcessing ? 'Processing...' : 'Register'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
        message={snackbar.message} 
      />
      {/* Decorative element */}
      <div className="mt-24 flex justify-center">
            <div className="h-1 w-16 bg-blue-500 mx-2 rounded-full opacity-70"></div>
            <div className="h-1 w-4 bg-yellow-400 mx-2 rounded-full opacity-70"></div>
            <div className="h-1 w-8 bg-purple-500 mx-2 rounded-full opacity-70"></div>
          </div>
    </div>
  );
};

export default Events;
