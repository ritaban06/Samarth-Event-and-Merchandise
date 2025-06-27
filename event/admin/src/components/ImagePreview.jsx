import { Box, IconButton, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { convertGoogleDriveUrl } from '../utils/googleDriveUtils';

const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkludmFsaWQgR29vZ2xlIERyaXZlIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

const ImagePreview = ({ url, onClose }) => {
  if (!url) return null;

  let displayUrl;
  try {
    displayUrl = convertGoogleDriveUrl(url);
  } catch (error) {
    return (
      <Box sx={{ 
        mt: 2,
        mb: 2,
        p: 2,
        bgcolor: 'error.light',
        color: 'error.contrastText',
        borderRadius: 1
      }}>
        <Typography>Invalid Google Drive URL. Please use a Google Drive sharing link.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      position: 'relative', 
      mt: 2,
      mb: 2,
      width: '100%',
      height: '200px',
      borderRadius: 1,
      overflow: 'hidden',
      bgcolor: 'grey.100'
    }}>
      <img 
        src={displayUrl} 
        alt="Preview"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = FALLBACK_IMAGE;
        }}
      />
      {onClose && (
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(0,0,0,0.5)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.7)',
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      )}
    </Box>
  );
};

export default ImagePreview;