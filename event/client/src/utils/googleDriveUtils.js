export const isGoogleDriveUrl = (url) => {
  return url?.includes('drive.google.com');
};

export const convertGoogleDriveUrl = (url) => {
  if (!url) return '';
  
  if (!isGoogleDriveUrl(url)) {
    return url;
  }

  try {
    const fileId = url.match(/[-\w]{25,}/);
    if (fileId) {
      return `https://lh3.googleusercontent.com/d/${fileId[0]}`;
    }
  } catch (error) {
    console.error('Error converting Google Drive URL:', error);
  }
  
  return url;
};