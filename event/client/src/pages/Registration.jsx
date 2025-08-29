import { useState, useEffect } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from "@mui/material";
import axios from "axios";
import PropTypes from "prop-types";

const Registration = ({ open, handleClose, event, user, updateEvents }) => {
  const [registrationData, setRegistrationData] = useState({
    uid: user?.uid || "",
    name: user?.userName || "",
    email: user?.email || "",
    paymentType: "cash",
    paymentStatus: "unpaid",
  });

  useEffect(() => {
    if (user) {
      setRegistrationData((prev) => ({
        ...prev,
        uid: user.uid,
        name: user.userName,
        email: user.email,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setRegistrationData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    try {
      // Special case for Ignite event: Autofill year based on semester
      if (/^ignite(\s+|$|\d*|\s+\d*|\s*\d+\s*)/i.test(event?.eventName)) {
        const semester = parseInt(registrationData.semester, 10);
        if (!isNaN(semester)) {
          if (semester === 1 || semester === 2) {
            registrationData.year = "1";
          } else if (semester === 3 || semester === 4) {
            registrationData.year = "2";
          } else if (semester === 5 || semester === 6) {
            registrationData.year = "3";
          } else if (semester === 7 || semester === 8) {
            registrationData.year = "4";
          } else {
            registrationData.year = "N/A";
          }
        } else {
          registrationData.year = "N/A";
        }
      }

      await axios.patch(`/api/events/${event._id}/register`, registrationData);
      updateEvents();
      handleClose();
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Register for {event?.eventName}</DialogTitle>
      <DialogContent>
        <TextField label="UID" name="uid" value={registrationData.uid} disabled fullWidth />
        <TextField label="Name" name="name" value={registrationData.name} disabled fullWidth />
        <TextField label="Email" name="email" value={registrationData.email} disabled fullWidth />
        {event?.payment?.status === "paid" && (
          <TextField
            select
            label="Payment Type"
            name="paymentType"
            value={registrationData.paymentType}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="online">Online</MenuItem>
          </TextField>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained" color="error">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Register
        </Button>
      </DialogActions>
    </Dialog>
  );
};

Registration.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  event: PropTypes.object.isRequired,
  user: PropTypes.object,
  updateEvents: PropTypes.func.isRequired,
};

export default Registration;