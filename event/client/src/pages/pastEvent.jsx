import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PastEvent = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to Events page with past events tab
    navigate('/events?tab=past', { replace: true });
  }, [navigate]);

  return null; // This component just redirects
};

export default PastEvent;