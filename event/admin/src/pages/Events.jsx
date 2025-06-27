import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, MenuItem, FormControlLabel, Checkbox } from '@mui/material';

const API_URL = import.meta.env.VITE_API_URL;



// Get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Field types available in Google Forms
const FIELD_TYPES = [
  'text',
  'paragraph',
  'number',
  'date',
  'time',
  'email',
  'phone',
  'checkbox',
  'radio',
  'dropdown',
  'file'
];


const Events = () => {
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    date: '',
    venue: '',
    maxParticipants: '',
    imageUrl: '',
    rulebookUrl: '',
    additionalFields: [],
    payment: {
      status: 'unpaid',
      amount: 0,
    },
    isActive: false,
    team: 'solo',
    teamSize: 2,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [newField, setNewField] = useState({ name: '', type: '', options: [] });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_URL}/events`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleOpen = (event = null) => {
    setOpen(true);
    if (event) {
      setIsEditing(true);
      setFormData({
        ...event,
        date: new Date(event.date).toISOString().split('T')[0]
      });
    } else {
      setIsEditing(false);
      setFormData({
        eventName: '',
        description: '',
        date: '',
        venue: '',
        maxParticipants: '',
        imageUrl: '',
        rulebookUrl: '',
        additionalFields: [],
        payment: {
          status: 'unpaid',
          amount: 0,
        },
        isActive: false,
        team: 'solo',
        teamSize: 2,
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setIsEditing(false);
  };

  const handleAddEvent = async () => {
    try {
      // Validate required fields
      if (!formData.eventName.trim()) {
        setSnackbar({ open: true, message: 'Event name is required', severity: 'error' });
        return;
      }

      if (!formData.description.trim()) {
        setSnackbar({ open: true, message: 'Description is required', severity: 'error' });
        return;
      }

      if (!formData.date) {
        setSnackbar({ open: true, message: 'Date is required', severity: 'error' });
        return;
      }

      if (!formData.venue.trim()) {
        setSnackbar({ open: true, message: 'Venue is required', severity: 'error' });
        return;
      }

      if (!formData.maxParticipants) {
        setSnackbar({ open: true, message: 'Max participants is required', severity: 'error' });
        return;
      }

      // Validate additional fields configuration
      const invalidFields = formData.additionalFields.filter(field => !field.name.trim() || !field.type);
      if (invalidFields.length > 0) {
        setSnackbar({ 
          open: true, 
          message: 'All additional fields must have a name and type', 
          severity: 'error' 
        });
        return;
      }

      // Validate options for fields that require them
      const invalidOptions = formData.additionalFields.filter(field => 
        ['radio', 'checkbox', 'dropdown'].includes(field.type) && 
        (!field.options || field.options.length < 2 || field.options.some(opt => !opt.trim()))
      );
      if (invalidOptions.length > 0) {
        setSnackbar({ 
          open: true, 
          message: 'Fields with type radio, checkbox, or dropdown must have at least 2 non-empty options', 
          severity: 'error' 
        });
        return;
      }

      const formattedDate = new Date(formData.date).toISOString();
      const isActive = isEditing ? formData.isActive : false;
      
      const dataToSend = { 
        ...formData, 
        date: formattedDate,
        isActive,
        team: formData.team,
      };

      // Conditionally add teamSize only if the event is a team event
      if (formData.team === 'team') {
        dataToSend.teamSize = formData.teamSize;
      }

      // Log the data being sent to the backend
      // console.log('Data being sent to the backend', JSON.stringify(dataToSend, null, 2));
      console.log('Data being sent to the backend');

      if (isEditing) {
        await axios.patch(`${API_URL}/events/${formData._id}`, dataToSend, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });
        setSnackbar({ open: true, message: 'Event updated successfully!', severity: 'success' });
      } else {
        await axios.post(`${API_URL}/events`, dataToSend, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });
        setSnackbar({ open: true, message: 'Event added successfully!', severity: 'success' });
      }

      fetchEvents();
      handleClose();
    } catch (error) {
      console.error('Error adding/updating event:', error.response ? error.response.data : error.message);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to add/update event. Please try again.', 
        severity: 'error' 
      });
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`${API_URL}/events/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });
        setSnackbar({ open: true, message: 'Event deleted successfully!', severity: 'success' });
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error.response ? error.response.data : error.message);
        setSnackbar({ open: true, message: 'Failed to delete event. Please try again.', severity: 'error' });
      }
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const eventToToggle = events.find(event => event._id === id);
      if (!eventToToggle) {
        throw new Error('Event not found');
      }

      const updatedStatus = !eventToToggle.isActive;

      const response = await axios.patch(
        `${API_URL}/events/${id}`, 
        { isActive: updatedStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data) {
        setEvents(events.map(event => 
          event._id === id ? { ...event, isActive: updatedStatus } : event
        ));
        setSnackbar({ 
          open: true, 
          message: `Event ${updatedStatus ? 'activated' : 'deactivated'} successfully!`, 
          severity: 'success' 
        });
      }
    } catch (error) {
      console.error('Error toggling event status:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to update event status. Please try again.', 
        severity: 'error' 
      });
    }
  };

  const handleAddField = () => {
    setFormData({
      ...formData,
      additionalFields: [
        ...formData.additionalFields,
        newField
      ]
    });
    setNewField({ name: '', type: '', options: [] });
  };

  const handleFieldChange = (index, field, value) => {
    const updatedFields = [...formData.additionalFields];
    updatedFields[index] = {
      ...updatedFields[index],
      [field]: value
    };
    setFormData({
      ...formData,
      additionalFields: updatedFields
    });
  };

  const handleDeleteField = (index) => {
    const updatedFields = formData.additionalFields.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      additionalFields: updatedFields
    });
  };

  return (
    <div>
      <h1>Event Dashboard</h1>
      <Button variant="contained" color="primary" onClick={() => handleOpen()}>
        Add Event
      </Button>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Event Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Venue</TableCell>
              <TableCell>Max Participants</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event._id}>
                <TableCell>{event.eventName}</TableCell>
                <TableCell>{event.description}</TableCell>
                <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                <TableCell>{event.venue}</TableCell>
                <TableCell>{event.maxParticipants}</TableCell>
                <TableCell>
                  <span style={{ 
                    color: event.payment.status === 'free' ? '#9c27b0' : 'inherit',
                    fontWeight: event.payment.status === 'free' ? 'bold' : 'normal'
                  }}>
                    {event.payment.status.charAt(0).toUpperCase() + event.payment.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outlined" 
                    color={event.isActive ? 'primary' : 'secondary'} 
                    onClick={() => handleToggleActive(event._id)}
                  >
                    {event.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={() => handleOpen(event)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    onClick={() => handleDeleteEvent(event._id)} 
                    style={{ marginLeft: '10px' }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEditing ? 'Edit Event' : 'Add New Event'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Image URL (Google Drive)"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            fullWidth
            margin="normal"
            helperText="Enter a Google Drive sharing link"
          />

          <TextField
            label="Event Name"
            value={formData.eventName}
            onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            required
          />

          <TextField
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            fullWidth
            margin="normal"
            required
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              inputProps: { 
                min: getCurrentDate(),
                placeholder: '' 
              }
            }}
          />

          <TextField
            label="Venue"
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Max Participants"
            type="number"
            value={formData.maxParticipants}
            onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Payment Status"
            select
            value={formData.payment.status}
            onChange={(e) => {
              const newStatus = e.target.value;
              setFormData({ 
                ...formData, 
                payment: { 
                  ...formData.payment, 
                  status: newStatus,
                  // Set amount to 0 if status is free
                  amount: newStatus === 'free' ? 0 : formData.payment.amount 
                } 
              });
            }}
            fullWidth
            margin="normal"
          >
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="free">Free</MenuItem>
          </TextField>

          <TextField
            label="Payment Amount"
            type="number"
            value={formData.payment.amount}
            onChange={(e) => setFormData({ 
              ...formData, 
              payment: { 
                ...formData.payment, 
                amount: Number(e.target.value) 
              } 
            })}
            fullWidth
            margin="normal"
            // Disable if free
            disabled={formData.payment.status === 'free'}
          />

          <TextField
            label="Rulebook Link"
            value={formData.rulebookUrl}
            onChange={(e) => setFormData({ ...formData, rulebookUrl: e.target.value })}
            fullWidth
            margin="normal"
	      helperText="Enter a link to the rulebook pdf"
          />

          <TextField
            label="Event Type"
            select
            value={formData.team}
            onChange={(e) => setFormData({ ...formData, team: e.target.value })}
            fullWidth
            margin="normal"
            required
          >
            <MenuItem value="solo">Solo</MenuItem>
            <MenuItem value="team">Team</MenuItem>
          </TextField>

          {formData.team === 'team' && (
            <TextField
              label="Team Size"
              type="number"
              value={formData.teamSize}
              onChange={(e) => setFormData({ 
                ...formData, 
                teamSize: Number(e.target.value) 
              })}
              fullWidth
              margin="normal"
              required
            />
          )}

          <div style={{ marginTop: '20px', marginBottom: '10px' }}>
            <Button 
              onClick={handleAddField} 
              color="primary" 
              variant="outlined"
              fullWidth
            >
              Add Additional Field
            </Button>
          </div>

          {formData.additionalFields.map((field, index) => (
            <div key={index} style={{ 
              border: '1px solid #e0e0e0', 
              padding: '15px', 
              marginBottom: '10px',
              borderRadius: '4px' 
            }}>
              <TextField
                label="Field Name"
                value={field.name}
                onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                select
                label="Field Type"
                value={field.type}
                onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                fullWidth
                margin="normal"
                required
              >
                {FIELD_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
              
              {['radio', 'checkbox', 'dropdown'].includes(field.type) && (
                <div>
                  {field.options.map((option, optionIndex) => (
                    <div key={optionIndex} style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                      <TextField
                        label={`Option ${optionIndex + 1}`}
                        value={option}
                        onChange={(e) => {
                          const updatedOptions = [...field.options];
                          updatedOptions[optionIndex] = e.target.value;
                          handleFieldChange(index, 'options', updatedOptions);
                        }}
                        fullWidth
                        margin="normal"
                      />
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => {
                          const updatedOptions = field.options.filter((_, i) => i !== optionIndex);
                          handleFieldChange(index, 'options', updatedOptions);
                        }}
                        style={{ marginLeft: '10px' }}
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      const updatedOptions = [...field.options, '']; // Add an empty option
                      handleFieldChange(index, 'options', updatedOptions);
                    }}
                    style={{ marginTop: '10px' }}
                  >
                    Add Option
                  </Button>
                </div>
              )}
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.required}
                    onChange={(e) => handleFieldChange(index, 'required', e.target.checked)}
                  />
                }
                label="Required field"
              />
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleDeleteField(index)}
                style={{ marginTop: '10px' }}
              >
                Delete Field
              </Button>
            </div>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddEvent} color="primary" variant="contained">
            {isEditing ? 'Update Event' : 'Add Event'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </div>
  );
};

export default Events;
