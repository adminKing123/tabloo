// Utility functions for Tabloo application

/**
 * Generate unique ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format date with time
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Validate email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL
 */
export const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get nested value from object by path
 */
export const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

/**
 * Set nested value in object by path
 */
export const setNestedValue = (obj, path, value) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
  return obj;
};

/**
 * Search filter function
 */
export const searchFilter = (items, searchTerm, fields) => {
  if (!searchTerm) return items;
  
  const term = searchTerm.toLowerCase();
  return items.filter(item => {
    return fields.some(field => {
      const value = getNestedValue(item, field);
      return value?.toString().toLowerCase().includes(term);
    });
  });
};

/**
 * Sort array by field
 */
export const sortBy = (items, field, direction = 'asc') => {
  return [...items].sort((a, b) => {
    const aVal = getNestedValue(a, field);
    const bVal = getNestedValue(b, field);
    
    if (aVal === bVal) return 0;
    
    const comparison = aVal > bVal ? 1 : -1;
    return direction === 'asc' ? comparison : -comparison;
  });
};

/**
 * Truncate text
 */
export const truncate = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Get contrast color for background
 */
export const getContrastColor = (hexColor) => {
  if (!hexColor) return '#000000';
  
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

/**
 * Download JSON file
 */
export const downloadJSON = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Apply filters to records
 */
export const applyFilters = (records, filterConfig, columns) => {
  if (!filterConfig || !filterConfig.filters || filterConfig.filters.length === 0) {
    return records;
  }

  const { filters, logic } = filterConfig;

  return records.filter(record => {
    const results = filters.map(filter => {
      const column = columns.find(c => c.id === filter.columnId);
      if (!column) return false;

      const value = record.data?.[filter.columnId];
      return evaluateFilter(value, filter.operator, filter.value, column);
    });

    // Apply logic (AND/OR)
    if (logic === 'AND') {
      return results.every(r => r);
    } else {
      return results.some(r => r);
    }
  });
};

/**
 * Evaluate a single filter condition
 */
const evaluateFilter = (value, operator, filterValue, column) => {
  // Handle empty value checks
  const isEmpty = value === undefined || value === null || value === '' || 
    (Array.isArray(value) && value.length === 0);

  switch (operator) {
    case 'isEmpty':
      return isEmpty;
    
    case 'isNotEmpty':
      return !isEmpty;
    
    case 'isChecked':
      return value === true || value === 'true';
    
    case 'isNotChecked':
      return value !== true && value !== 'true';
    
    case 'contains':
      if (isEmpty) return false;
      if (Array.isArray(value)) {
        return value.some(v => String(v).toLowerCase().includes(String(filterValue).toLowerCase()));
      }
      return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
    
    case 'notContains':
      if (isEmpty) return true;
      if (Array.isArray(value)) {
        return !value.some(v => String(v).toLowerCase().includes(String(filterValue).toLowerCase()));
      }
      return !String(value).toLowerCase().includes(String(filterValue).toLowerCase());
    
    case 'is':
      if (column.type === 'date') {
        const recordDate = value ? new Date(value).toISOString().split('T')[0] : '';
        const filterDate = filterValue ? new Date(filterValue).toISOString().split('T')[0] : '';
        return recordDate === filterDate;
      }
      return String(value).toLowerCase() === String(filterValue).toLowerCase();
    
    case 'isNot':
      if (column.type === 'date') {
        const recordDate = value ? new Date(value).toISOString().split('T')[0] : '';
        const filterDate = filterValue ? new Date(filterValue).toISOString().split('T')[0] : '';
        return recordDate !== filterDate;
      }
      return String(value).toLowerCase() !== String(filterValue).toLowerCase();
    
    case 'equals':
      return parseFloat(value) === parseFloat(filterValue);
    
    case 'notEquals':
      return parseFloat(value) !== parseFloat(filterValue);
    
    case 'greaterThan':
      return parseFloat(value) > parseFloat(filterValue);
    
    case 'lessThan':
      return parseFloat(value) < parseFloat(filterValue);
    
    case 'greaterThanOrEqual':
      return parseFloat(value) >= parseFloat(filterValue);
    
    case 'lessThanOrEqual':
      return parseFloat(value) <= parseFloat(filterValue);
    
    case 'isBefore':
      if (isEmpty) return false;
      return new Date(value) < new Date(filterValue);
    
    case 'isAfter':
      if (isEmpty) return false;
      return new Date(value) > new Date(filterValue);
    
    case 'isOnOrBefore':
      if (isEmpty) return false;
      return new Date(value) <= new Date(filterValue);
    
    case 'isOnOrAfter':
      if (isEmpty) return false;
      return new Date(value) >= new Date(filterValue);
    
    case 'isAnyOf':
    case 'hasAnyOf': {
      if (isEmpty) return false;
      const filterValues = filterValue.split(',').map(v => v.trim().toLowerCase());
      const recordValues = Array.isArray(value) 
        ? value.map(v => String(v).toLowerCase())
        : [String(value).toLowerCase()];
      return recordValues.some(rv => filterValues.includes(rv));
    }
    
    case 'isNoneOf':
    case 'hasNoneOf': {
      if (isEmpty) return true;
      const filterValues = filterValue.split(',').map(v => v.trim().toLowerCase());
      const recordValues = Array.isArray(value) 
        ? value.map(v => String(v).toLowerCase())
        : [String(value).toLowerCase()];
      return !recordValues.some(rv => filterValues.includes(rv));
    }
    
    case 'hasAllOf': {
      if (isEmpty) return false;
      const filterValues = filterValue.split(',').map(v => v.trim().toLowerCase());
      const recordValues = Array.isArray(value) 
        ? value.map(v => String(v).toLowerCase())
        : [String(value).toLowerCase()];
      return filterValues.every(fv => recordValues.includes(fv));
    }
    
    default:
      return false;
  }
};

