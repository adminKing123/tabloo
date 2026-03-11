/**
 * Validate column configuration
 */
export const validateColumn = (column) => {
  const errors = [];
  
  if (!column.name || column.name.trim() === '') {
    errors.push('Column name is required');
  }
  
  if (!column.type) {
    errors.push('Column type is required');
  }
  
  // Type-specific validations
  if (column.type === 'status' || column.type === 'dropdown') {
    if (!column.options || column.options.length === 0) {
      errors.push('At least one option is required');
    }
  }
  
  if (column.type === 'apiDropdown') {
    if (!column.apiConfig?.url) {
      errors.push('API URL is required');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate record data against table schema
 */
export const validateRecord = (record, columns) => {
  const errors = {};
  
  columns.forEach(column => {
    const value = record[column.id];
    
    // Required field check
    if (column.required && !value) {
      errors[column.id] = `${column.name} is required`;
      return;
    }
    
    // Skip validation if no value and not required
    if (!value) return;
    
    // Type-specific validations
    switch (column.type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors[column.id] = 'Invalid email format';
        }
        break;
        
      case 'url':
        try {
          new URL(value);
        } catch {
          errors[column.id] = 'Invalid URL format';
        }
        break;
        
      case 'number':
        if (isNaN(value)) {
          errors[column.id] = 'Must be a valid number';
        }
        break;
        
      case 'date':
        if (isNaN(new Date(value).getTime())) {
          errors[column.id] = 'Invalid date format';
        }
        break;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate project data
 */
export const validateProject = (project) => {
  const errors = {};
  
  if (!project.name || project.name.trim() === '') {
    errors.name = 'Project name is required';
  }
  
  if (project.name && project.name.length > 100) {
    errors.name = 'Project name is too long';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate table name
 */
export const validateTableName = (name) => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Table name is required' };
  }
  
  if (name.length > 50) {
    return { isValid: false, error: 'Table name is too long' };
  }
  
  return { isValid: true };
};

/**
 * Validate section name
 */
export const validateSectionName = (name) => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Section name is required' };
  }
  
  if (name.length > 50) {
    return { isValid: false, error: 'Section name is too long' };
  }
  
  return { isValid: true };
};

/**
 * Sanitize user input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
