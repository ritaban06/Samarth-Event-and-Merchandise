export const convertGoogleDriveUrl = (url) => {
  if (!url) return '';
  
  try {
    // Check if it's already a direct link
    if (url.includes('uc?export=view')) {
      return url;
    }

    // Extract file ID from various Google Drive URL formats
    let fileId = '';
    
    if (url.includes('drive.google.com/file/d/')) {
      fileId = url.split('file/d/')[1].split('/')[0];
    } else if (url.includes('drive.google.com/open?id=')) {
      fileId = url.split('open?id=')[1].split('&')[0];
    } else if (url.includes('drive.google.com/uc?id=')) {
      fileId = url.split('uc?id=')[1].split('&')[0];
    } else {
      return url; // Return original URL if format is not recognized
    }

    // Return the direct link format
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  } catch (error) {
    console.error('Error converting Google Drive URL:', error);
    return url;
  }
};

export const isGoogleDriveUrl = (url) => {
  return url && url.includes('drive.google.com');
};