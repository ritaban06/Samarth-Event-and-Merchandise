// Flagship events data for Samarth
export const FLAGSHIP_EVENTS = [
  {
    id: 'educ-a-thon-2024',
    title: 'Educ-A-Thon 2024',
    description: 'Hackathon for students to develop innovative solutions for education, focusing on accessibility, inclusivity, and digital literacy.',
    date: '2024-12-17',
    venue: 'GSeries, TMSL',
    participants: '95/100',
    fee: 'Free',
    team: 'team',
    highlights: [
      'Accessibility & Inclusivity',
      'Digital Literacy',
      'Team Collaboration',
      'Mentorship Sessions'
    ],
    award: {
      label: 'Best Educational Project',
      winner: 'Team DEVS'
    },
    image: '/images/educathon.3fed819353f2a500751f.webp',
    isFlagship: true
  },
  {
    id: 'open-odyssey-1',
    title: 'OPEN ODYSSEY 1.0',
    description: 'Open Source Contribution Event.',
    date: '2024-05-15',
    venue: 'Online',
    participants: '2K+',
    fee: 'Free',
    team: 'solo',
    highlights: [
      'Open Source Projects',
      'Mentor Guidance',
      'Collaboration',
      'Certificate for All'
    ],
    award: {
      label: 'Top Contributor',
      winner: 'Koustav Singh & Ritaban Ghosh'
    },
    image: '/images/oodc.fb8393d8c761f0e42a7b.webp',
    isFlagship: true
  },
  {
    id: 'titans-of-situation',
    title: 'TITANS OF SITUATION',
    description: 'A challenge event for critical thinking and problem solving.',
    date: '2024-02-12',
    venue: 'G Series, TMSL',
    participants: '95/100',
    fee: 'Free',
    team: 'solo',
    highlights: [
      'Scenario-Based Challenges',
      'Team Play',
      'Industry Mentors',
      'Prize Pool'
    ],
    award: {
      label: 'Best Titan',
      winner: 'Name to be announced'
    },
    image: '/images/TOS-24.5955ccfbaab2cb50a380.webp',
    isFlagship: true
  },
  {
    id: 'matrix-of-mock',
    title: 'MATRIX OF MOCK',
    description: 'An event to showcase communication, critical thinking and professionalism in front of industry professionals.',
    date: '2024-03-20',
    venue: 'TMSL',
    participants: '95/100',
    fee: 'Rs.50',
    team: 'solo',
    highlights: [
      'Mock Interviews',
      'Industry Feedback',
      'Skill Development',
      'Certificates'
    ],
    award: {
      label: 'Best Communicator',
      winner: 'Name to be announced'
    },
    image: '/images/MATRiX OF MOCK 1080 (1).88af42b2c1be48222ccc.webp',
    isFlagship: true
  },
];

// Helper function to get flagship events by year
export const getFlagshipEventsByYear = (year) => {
  return FLAGSHIP_EVENTS.filter(event => {
    const eventYear = new Date(event.date).getFullYear();
    return eventYear === year;
  });
};

// Helper function to get all unique years from flagship events
export const getFlagshipEventYears = () => {
  const years = FLAGSHIP_EVENTS.map(event => new Date(event.date).getFullYear());
  return [...new Set(years)].sort((a, b) => b - a); // Sort in descending order
};

// Helper function to get flagship events by type
export const getFlagshipEventsByType = (type) => {
  return FLAGSHIP_EVENTS.filter(event => {
    const fee = (event.fee || '').toString().trim().toLowerCase();
    if (type === 'paid') {
      // Consider as paid if fee is not empty, not 'free', and contains a digit (e.g., 'Rs.50', '100')
      return fee !== 'free' && /\d/.test(fee);
    }
    if (type === 'free') {
      // Consider as free if fee is 'free' (case-insensitive, ignoring whitespace)
      return fee === 'free';
    }
    if (type === 'team') return event.team === 'team';
    if (type === 'solo') return event.team === 'solo';
    return true;
  });
};
