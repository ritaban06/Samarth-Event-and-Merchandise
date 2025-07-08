export const convertGoogleDriveUrl = (url) => {
  if (!url) return '';

  try {
    // Extract file ID from various Google Drive URL formats
    let fileId = '';
    const fileIdRegex = /(?:file\/d\/|open\?id=|uc\?id=|d\/|folders\/|id=)([\w-]{25,})/;
    const match = url.match(fileIdRegex);
    if (match && match[1]) {
      fileId = match[1];
    } else {
      // Try to extract from sharing link
      const shareLinkRegex = /https:\/\/drive\.google\.com\/file\/d\/([\w-]{25,})/;
      const shareMatch = url.match(shareLinkRegex);
      if (shareMatch && shareMatch[1]) {
        fileId = shareMatch[1];
      } else {
        return url; // Not a recognized Google Drive link
      }
    }
    // Return the direct link format for viewing
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  } catch (error) {
    console.error('Error converting Google Drive URL:', error);
    return url;
  }
};

export const isGoogleDriveUrl = (url) => {
  return url && url.includes('drive.google.com');
};