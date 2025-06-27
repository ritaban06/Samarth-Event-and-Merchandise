// Middleware to check if the events site is active
const siteStatusMiddleware = (req, res, next) => {
  // Check if site is active via environment variable
  const siteActive = process.env.SITE_ACTIVE;
  
  // If environment variable is set to 'false' or 'disabled', return maintenance message
  if (siteActive === 'false' || siteActive === 'disabled') {
    return res.status(503).json({
      success: false,
      message: 'Events site is temporarily unavailable. Redirecting to merchandise store.',
      redirectUrl: 'https://merch.ritaban.me',
      status: 'maintenance'
    });
  }
  
  // Default to active if not specified or set to 'true'
  next();
};

module.exports = siteStatusMiddleware;
