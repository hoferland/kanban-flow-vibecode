export interface Card {
  id: number;
  title: string;
  area: string;
  type: string | null;
  notes: string;
  column: string;
  position: number;
  dueDate: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface Column {
  id: string;
  label: string;
  position: number;
  wipLimit: number | null;
  color: string | null;
  isActive: boolean;
}

export interface Attribute {
  id: string;
  type: 'area' | 'type';
  label: string;
  position: number;
  color: string | null;
  isActive: boolean;
}

export interface Area extends Attribute {
  type: 'area';
}

export interface CardType extends Attribute {
  type: 'type';
}

export interface SyncState {
  connected: boolean;
  lastSyncedAt: number | null;
  error: string | null;
}

export interface WidgetState {
  serverHost: string;
  serverPort: number;
  wsPort: number;
  cards: Card[];
  columns: Column[];
  areas: Area[];
  types: CardType[];
  syncState: SyncState;
  areaFilter: string[];
  compactMode: boolean;
}

// Default columns matching Flow app
export const DEFAULT_COLUMNS: Column[] = [
  { id: 'inbox', label: 'Inbox', position: 0, wipLimit: null, color: null, isActive: true },
  { id: 'next', label: 'Next', position: 1, wipLimit: null, color: null, isActive: true },
  { id: 'in-progress', label: 'In Progress', position: 2, wipLimit: 3, color: null, isActive: true },
  { id: 'waiting', label: 'Waiting', position: 3, wipLimit: null, color: null, isActive: true },
  { id: 'done', label: 'Done', position: 4, wipLimit: null, color: null, isActive: true },
];

// Default areas matching Flow app
export const DEFAULT_AREAS: Area[] = [
  { id: 'team-a', type: 'area', label: 'SD Team', position: 0, color: '#d4e4f0', isActive: true },
  { id: 'team-b', type: 'area', label: 'TM Team', position: 1, color: '#d4e8d4', isActive: true },
  { id: 'cross-team', type: 'area', label: 'Cross-team', position: 2, color: '#f0dcc8', isActive: true },
  { id: 'other', type: 'area', label: 'Other', position: 3, color: '#e8e4db', isActive: true },
];

// Default card types matching Flow app
export const DEFAULT_TYPES: CardType[] = [
  { id: 'discovery', type: 'type', label: 'Discovery', position: 0, color: null, isActive: true },
  { id: 'design', type: 'type', label: 'Design', position: 1, color: null, isActive: true },
  { id: 'support', type: 'type', label: 'Support', position: 2, color: null, isActive: true },
];

// Type icons
export const TYPE_ICONS: Record<string, string> = {
  'discovery': '◆',
  'design': '○',
  'support': '□',
};
