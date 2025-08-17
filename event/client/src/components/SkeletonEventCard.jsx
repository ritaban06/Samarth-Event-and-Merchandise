import React from 'react';
import {
  Card,
  CardContent,
  Skeleton,
  Box,
  Typography,
  CardActionArea,
} from '@mui/material';

const SkeletonCard = ({ height = 400 }) => {
  return (
    <Card
      sx={{
        width: '100%',
        maxWidth: 350,
        height,
        borderRadius: 4,
        boxShadow: 4,
        bgcolor: 'background.paper',
        transition: 'transform 0.3s ease',
        '&:hover': {
          transform: 'scale(1.02)',
        },
      }}
    >
      <CardActionArea>
        <Skeleton
          variant="rectangular"
          height={250}
          animation="wave"
          sx={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
        />
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Skeleton variant="text" width="80%" height={28} />
            <Skeleton variant="text" width="60%" />
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="text" width="40%" />
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default SkeletonCard;
