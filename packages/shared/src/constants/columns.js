/**
 * Column definitions
 */

export const COLUMNS = [
  { id: 'inbox', label: 'Inbox', maxCards: null },
  { id: 'next', label: 'Next', maxCards: null },
  { id: 'in-progress', label: 'In Progress', maxCards: 3 },
  { id: 'waiting', label: 'Waiting', maxCards: null },
  { id: 'done', label: 'Done', maxCards: null }
];

export const AREAS = [
  { id: 'team-a', label: 'Team A', color: '#d4e4f0' },
  { id: 'team-b', label: 'Team B', color: '#d4e8d4' },
  { id: 'cross-team', label: 'Cross-team', color: '#f0dcc8' },
  { id: 'other', label: 'Other', color: '#e8e4db' }
];

export const CARD_TYPES = [
  { id: 'discovery', label: 'Discovery', icon: '◆' },
  { id: 'design', label: 'Design', icon: '○' },
  { id: 'support', label: 'Support', icon: '□' }
];
