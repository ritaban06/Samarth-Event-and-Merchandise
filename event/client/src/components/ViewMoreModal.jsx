import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Chip,
  Button
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const ViewMoreModal = ({ open, handleClose, event }) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Blurred background */}
          <motion.div
            className="fixed inset-0 z-40 bg-white/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Dialog Modal */}
          <Dialog
            open={open}
            onClose={handleClose}
            hideBackdrop
            fullWidth
            maxWidth="sm"
            PaperProps={{
              component: motion.div,
              initial: { opacity: 0, scale: 0.85 },
              animate: { opacity: 1, scale: 1 },
              exit: { opacity: 0, scale: 0.85 },
              transition: { duration: 0.4 },
              className:
                'relative z-50 p-1 bg-transparent shadow-2xl rounded-3xl overflow-hidden',
            }}
          >
            {/* Glowing Gradient Border Frame */}
            <div className="relative rounded-[1.7rem] bg-[#f9f0fc] text-purple-900 overflow-hidden">
              {/* Outer gradient ring */}
              <div className="absolute inset-0 rounded-[1.75rem] z-[-1] pointer-events-none">
                <div className="absolute inset-0 m-[2px] rounded-[1.7rem] bg-gradient-to-r from-[#9e38b8] via-[#f40bdc] to-[#7e57c2] opacity-70 blur-sm" />
              </div>

              {/* Inner glow */}
              <div className="absolute inset-0 rounded-[1.7rem] bg-white/20 backdrop-blur-md z-[-2]" />

              <div className="relative z-10 p-6">
                <div className="flex justify-between items-center mb-2">
                  <DialogTitle className="text-3xl font-bold tracking-wide">
                    {event.eventName}
                  </DialogTitle>

                  {/* Animated close button */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <IconButton onClick={handleClose}>
                      <X className="text-purple-700 hover:text-red-500 transition-all duration-200" />
                    </IconButton>
                  </motion.div>
                </div>

                <DialogContent className="space-y-4 text-sm">
                  <div>
                    <Typography variant="subtitle1" className="font-semibold">
                      Venue:
                    </Typography>
                    <Typography>{event.venue}</Typography>
                  </div>

                  <div>
                    <Typography variant="subtitle1" className="font-semibold">
                      Conducted On:
                    </Typography>
                    <Typography>{event.date}</Typography>
                  </div>

                  <div>
                    <Typography variant="subtitle1" className="font-semibold">
                      Total Registrations:
                    </Typography>
                    <Typography>{event.maxParticipants}</Typography>
                  </div>

                  <div className="flex gap-4 flex-wrap">
                    <Chip
                      label={event.eventType === 'paid' ? 'Paid Event' : 'Free Event'}
                      color={event.eventType === 'paid' ? 'error' : 'success'}
                      variant="outlined"
                    />
                    <Chip
                      label={event.teamType === 'team' ? 'Team Event' : 'Solo Event'}
                      color="primary"
                      variant="outlined"
                    />
                  </div>

                  {event.eventType === 'paid' && event.payment?.amount && (
                    <div>
                      <Typography variant="subtitle1" className="font-semibold">
                        Price:
                      </Typography>
                      <Typography>₹{event.payment.amount}</Typography>
                    </div>
                  )}

                  <div>
                    <Typography variant="subtitle1" className="font-semibold">
                      Rule Book:
                    </Typography>
                    {/* Animated CTA */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Button
                        variant="contained"
                        className="mt-2"
                        sx={{
                          background: 'bg-gradient-to-r from-[#6a0dad] to-[#d8b4fe]',
                          color: 'white',
                          borderRadius: '20px',
                          textTransform: 'none',
                          boxShadow: '0 4px 20px rgba(156, 39, 176, 0.5)',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(62, 7, 80, 0.8)',
                          },
                        }}
                        href={event.rulebookLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Rule Book
                      </Button>
                    </motion.div>
                  </div>
                </DialogContent>
              </div>
            </div>
          </Dialog>
        </>
      )}
    </AnimatePresence>
  );
};

export default ViewMoreModal;
