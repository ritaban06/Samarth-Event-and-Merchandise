export const formatDateTime = (date, currentTime = new Date()) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  const timeDiff = Math.abs(currentTime - dateObj);
  const minutesDiff = Math.floor(timeDiff / (1000 * 60));
  const hoursDiff = Math.floor(minutesDiff / 60);
  const daysDiff = Math.floor(hoursDiff / 24);

  // Show relative time for recent dates
  if (daysDiff === 0) {
    if (minutesDiff < 1) return 'Just now';
    if (minutesDiff < 60) return `${minutesDiff} minutes ago`;
    return `${hoursDiff} hours ago`;
  } else if (daysDiff === 1) {
    return 'Yesterday at ' + new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    }).format(dateObj);
  }

  // Fall back to full date time for older dates
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  }).format(dateObj);
};

export const formatDate = (date) => {
  if (!date) return '';
  
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Kolkata'
  }).format(new Date(date));
};

export const formatTime = (date) => {
  if (!date) return '';
  
  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  }).format(new Date(date));
};

// New function to format date for input fields
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// New function to get readable format with day name
export const formatDateWithDay = (date) => {
  if (!date) return '';
  
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Kolkata'
  }).format(new Date(date));
};