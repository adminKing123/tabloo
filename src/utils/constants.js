// Constants for Tabloo application

// Column Types
export const COLUMN_TYPES = {
  TEXT: 'text',
  LONG_TEXT: 'longText',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  DATE: 'date',
  STATUS: 'status',
  DROPDOWN: 'dropdown',
  TAGS: 'tags',
  URL: 'url',
  EMAIL: 'email',
  LINKS: 'links',
  API_DROPDOWN: 'apiDropdown',
  CALCULATED: 'calculated',
  NESTED_TABLE: 'nestedTable',
  RELATION: 'relation',
  JSON: 'json'
};

// Column Type Labels
export const COLUMN_TYPE_LABELS = {
  [COLUMN_TYPES.TEXT]: 'Text',
  [COLUMN_TYPES.LONG_TEXT]: 'Long Text',
  [COLUMN_TYPES.NUMBER]: 'Number',
  [COLUMN_TYPES.BOOLEAN]: 'Boolean',
  [COLUMN_TYPES.DATE]: 'Date',
  [COLUMN_TYPES.STATUS]: 'Status',
  [COLUMN_TYPES.DROPDOWN]: 'Dropdown',
  [COLUMN_TYPES.TAGS]: 'Tags',
  [COLUMN_TYPES.URL]: 'URL',
  [COLUMN_TYPES.EMAIL]: 'Email',
  [COLUMN_TYPES.LINKS]: 'Link List',
  [COLUMN_TYPES.API_DROPDOWN]: 'API Dropdown',
  [COLUMN_TYPES.CALCULATED]: 'Calculated',
  [COLUMN_TYPES.NESTED_TABLE]: 'Nested Table',
  [COLUMN_TYPES.RELATION]: 'Relation',
  [COLUMN_TYPES.JSON]: 'JSON'
};

// Default Status Options
export const DEFAULT_STATUS_OPTIONS = [
  { label: 'To Do', color: '#6B7280' },
  { label: 'In Progress', color: '#3B82F6' },
  { label: 'Blocked', color: '#EF4444' },
  { label: 'Completed', color: '#10B981' }
];

// Default Priority Options
export const DEFAULT_PRIORITY_OPTIONS = [
  { label: 'Low', color: '#9CA3AF' },
  { label: 'Medium', color: '#F59E0B' },
  { label: 'High', color: '#EF4444' }
];

// Project Icon Options (lucide-react icon names)
export const PROJECT_ICONS = [
  'Folder', 'BarChart2', 'Target', 'Briefcase', 'FileText', 'Rocket', 
  'Lightbulb', 'Wrench', 'TrendingUp', 'Palette', 'Building2', 'Smartphone'
];

// Project Color Options
export const PROJECT_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
];

// Sort Options
export const SORT_OPTIONS = {
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
  DATE_ASC: 'date_asc',
  DATE_DESC: 'date_desc',
  UPDATED_ASC: 'updated_asc',
  UPDATED_DESC: 'updated_desc'
};

// IndexedDB Configuration
export const DB_NAME = 'TablooDatabase';
export const DB_VERSION = 2;

export const STORES = {
  PROJECTS: 'projects',
  SECTIONS: 'sections',
  TABLES: 'tables',
  RECORDS: 'records',
  TEMPLATES: 'templates',
  COLUMNS: 'columns',
  GLOBAL_FIELDS: 'globalFields'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  LAST_PROJECT: 'tabloo_last_project',
  USER_PREFERENCES: 'tabloo_user_preferences'
};

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  NOT_FOUND: 'Item not found.',
  VALIDATION: 'Please check your input and try again.',
  DELETE_FAILED: 'Failed to delete item.',
  SAVE_FAILED: 'Failed to save changes.'
};
