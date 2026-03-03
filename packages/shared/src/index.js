/**
 * Shared package exports
 */

// Models
export { Card } from './models/Card.js';

// Constants
export { COLUMNS, AREAS, CARD_TYPES } from './constants/columns.js';

// Utilities
export * from './utils/dateUtils.js';
export * from './utils/fileUtils.js';

// Theme (Japandi Design System)
// NOTE: Theme is NOT currently used by desktop app (uses custom CSS)
// Kept for potential future mobile app usage
// export {
//   theme,
//   colors,
//   typography,
//   spacing,
//   shadows,
//   zIndex,
//   utils,
//   presets,
// } from './theme/index.js';
