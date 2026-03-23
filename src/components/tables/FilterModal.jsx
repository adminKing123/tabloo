import { useState, useEffect } from 'react';
import { Modal, Button, TextInput, Select } from 'flowbite-react';
import { Plus, X } from 'lucide-react';
import { COLUMN_TYPES } from '../../utils/constants';

// Filter operators by column type
const FILTER_OPERATORS = {
  [COLUMN_TYPES.TEXT]: [
    { value: 'contains', label: 'Contains' },
    { value: 'notContains', label: 'Does not contain' },
    { value: 'is', label: 'Is' },
    { value: 'isNot', label: 'Is not' },
    { value: 'isEmpty', label: 'Is empty' },
    { value: 'isNotEmpty', label: 'Is not empty' }
  ],
  [COLUMN_TYPES.LONG_TEXT]: [
    { value: 'contains', label: 'Contains' },
    { value: 'notContains', label: 'Does not contain' },
    { value: 'isEmpty', label: 'Is empty' },
    { value: 'isNotEmpty', label: 'Is not empty' }
  ],
  [COLUMN_TYPES.NUMBER]: [
    { value: 'equals', label: '=' },
    { value: 'notEquals', label: '≠' },
    { value: 'greaterThan', label: '>' },
    { value: 'lessThan', label: '<' },
    { value: 'greaterThanOrEqual', label: '≥' },
    { value: 'lessThanOrEqual', label: '≤' },
    { value: 'isEmpty', label: 'Is empty' },
    { value: 'isNotEmpty', label: 'Is not empty' }
  ],
  [COLUMN_TYPES.DATE]: [
    { value: 'is', label: 'Is' },
    { value: 'isBefore', label: 'Is before' },
    { value: 'isAfter', label: 'Is after' },
    { value: 'isOnOrBefore', label: 'Is on or before' },
    { value: 'isOnOrAfter', label: 'Is on or after' },
    { value: 'isEmpty', label: 'Is empty' },
    { value: 'isNotEmpty', label: 'Is not empty' }
  ],
  [COLUMN_TYPES.BOOLEAN]: [
    { value: 'isChecked', label: 'Is checked' },
    { value: 'isNotChecked', label: 'Is not checked' }
  ],
  [COLUMN_TYPES.STATUS]: [
    { value: 'is', label: 'Is' },
    { value: 'isNot', label: 'Is not' },
    { value: 'isAnyOf', label: 'Is any of' },
    { value: 'isNoneOf', label: 'Is none of' },
    { value: 'isEmpty', label: 'Is empty' },
    { value: 'isNotEmpty', label: 'Is not empty' }
  ],
  [COLUMN_TYPES.DROPDOWN]: [
    { value: 'is', label: 'Is' },
    { value: 'isNot', label: 'Is not' },
    { value: 'isAnyOf', label: 'Is any of' },
    { value: 'isNoneOf', label: 'Is none of' },
    { value: 'isEmpty', label: 'Is empty' },
    { value: 'isNotEmpty', label: 'Is not empty' }
  ],
  [COLUMN_TYPES.TAGS]: [
    { value: 'contains', label: 'Contains' },
    { value: 'notContains', label: 'Does not contain' },
    { value: 'hasAnyOf', label: 'Has any of' },
    { value: 'hasAllOf', label: 'Has all of' },
    { value: 'hasNoneOf', label: 'Has none of' },
    { value: 'isEmpty', label: 'Is empty' },
    { value: 'isNotEmpty', label: 'Is not empty' }
  ],
  [COLUMN_TYPES.URL]: [
    { value: 'contains', label: 'Contains' },
    { value: 'notContains', label: 'Does not contain' },
    { value: 'is', label: 'Is' },
    { value: 'isNot', label: 'Is not' },
    { value: 'isEmpty', label: 'Is empty' },
    { value: 'isNotEmpty', label: 'Is not empty' }
  ],
  [COLUMN_TYPES.EMAIL]: [
    { value: 'contains', label: 'Contains' },
    { value: 'notContains', label: 'Does not contain' },
    { value: 'is', label: 'Is' },
    { value: 'isNot', label: 'Is not' },
    { value: 'isEmpty', label: 'Is empty' },
    { value: 'isNotEmpty', label: 'Is not empty' }
  ],
  [COLUMN_TYPES.LINKS]: [
    { value: 'contains', label: 'Contains' },
    { value: 'notContains', label: 'Does not contain' },
    { value: 'isEmpty', label: 'Is empty' },
    { value: 'isNotEmpty', label: 'Is not empty' }
  ]
};

// Default operators for types not explicitly defined
const DEFAULT_OPERATORS = [
  { value: 'contains', label: 'Contains' },
  { value: 'notContains', label: 'Does not contain' },
  { value: 'isEmpty', label: 'Is empty' },
  { value: 'isNotEmpty', label: 'Is not empty' }
];

export default function FilterModal({ isOpen, onClose, columns, filters, onSave }) {
  const [localFilters, setLocalFilters] = useState([]);
  const [filterLogic, setFilterLogic] = useState('AND');

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters.length > 0 ? filters : [createEmptyFilter()]);
      setFilterLogic(filters.length > 0 && filters[0]?.logic ? filters[0].logic : 'AND');
    }
  }, [isOpen, filters]);

  const createEmptyFilter = () => ({
    id: Date.now() + Math.random(),
    columnId: columns[0]?.id || '',
    operator: 'contains',
    value: ''
  });

  const getOperatorsForColumn = (columnId) => {
    const column = columns.find(c => c.id === columnId);
    if (!column) return DEFAULT_OPERATORS;
    return FILTER_OPERATORS[column.type] || DEFAULT_OPERATORS;
  };

  const needsValueInput = (operator) => {
    return !['isEmpty', 'isNotEmpty', 'isChecked', 'isNotChecked'].includes(operator);
  };

  const handleAddFilter = () => {
    setLocalFilters([...localFilters, createEmptyFilter()]);
  };

  const handleRemoveFilter = (filterId) => {
    setLocalFilters(localFilters.filter(f => f.id !== filterId));
  };

  const handleFilterChange = (filterId, field, value) => {
    setLocalFilters(localFilters.map(f => {
      if (f.id === filterId) {
        const updates = { [field]: value };
        
        // If column changed, reset operator and value
        if (field === 'columnId') {
          const operators = getOperatorsForColumn(value);
          updates.operator = operators[0]?.value || 'contains';
          updates.value = '';
        }
        
        // If operator changed to one that doesn't need value, clear value
        if (field === 'operator' && !needsValueInput(value)) {
          updates.value = '';
        }
        
        return { ...f, ...updates };
      }
      return f;
    }));
  };

  const handleSave = () => {
    // Only save non-empty filters
    const validFilters = localFilters.filter(f => {
      if (!f.columnId) return false;
      if (needsValueInput(f.operator) && !f.value) return false;
      return true;
    });

    onSave({
      filters: validFilters,
      logic: filterLogic
    });
    onClose();
  };

  const handleClearAll = () => {
    setLocalFilters([createEmptyFilter()]);
    setFilterLogic('AND');
  };

  const getValueInput = (filter) => {
    const column = columns.find(c => c.id === filter.columnId);
    if (!column || !needsValueInput(filter.operator)) return null;

    // For operators that support multiple values
    if (['isAnyOf', 'isNoneOf', 'hasAnyOf', 'hasAllOf', 'hasNoneOf'].includes(filter.operator)) {
      return (
        <TextInput
          placeholder="Enter values (comma-separated)"
          value={filter.value}
          onChange={(e) => handleFilterChange(filter.id, 'value', e.target.value)}
        />
      );
    }

    // Type-specific inputs
    switch (column.type) {
      case COLUMN_TYPES.NUMBER:
        return (
          <TextInput
            type="number"
            placeholder="Enter number"
            value={filter.value}
            onChange={(e) => handleFilterChange(filter.id, 'value', e.target.value)}
          />
        );
      
      case COLUMN_TYPES.DATE:
        return (
          <TextInput
            type="date"
            value={filter.value}
            onChange={(e) => handleFilterChange(filter.id, 'value', e.target.value)}
          />
        );
      
      case COLUMN_TYPES.BOOLEAN:
        return null; // Boolean uses isChecked/isNotChecked which don't need value
      
      case COLUMN_TYPES.STATUS:
      case COLUMN_TYPES.DROPDOWN:
        if (column.options && column.options.length > 0) {
          return (
            <select
              value={filter.value}
              onChange={(e) => handleFilterChange(filter.id, 'value', e.target.value)}
              className="block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select option</option>
              {column.options.map((opt, idx) => {
                // Handle both string options (DROPDOWN) and object options (STATUS)
                const optValue = typeof opt === 'object' ? opt.label : opt;
                return (
                  <option key={idx} value={optValue}>
                    {optValue}
                  </option>
                );
              })}
            </select>
          );
        }
        return (
          <TextInput
            placeholder="Enter value"
            value={filter.value}
            onChange={(e) => handleFilterChange(filter.id, 'value', e.target.value)}
          />
        );
      
      default:
        return (
          <TextInput
            placeholder="Enter value"
            value={filter.value}
            onChange={(e) => handleFilterChange(filter.id, 'value', e.target.value)}
          />
        );
    }
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="3xl">
      <Modal.Header>Filter Records</Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          {/* Filter Logic Selector */}
          {localFilters.length > 1 && (
            <div className="flex items-center gap-2 pb-2 border-b dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Show records where</span>
              <select
                value={filterLogic}
                onChange={(e) => setFilterLogic(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="AND">All conditions match (AND)</option>
                <option value="OR">Any condition matches (OR)</option>
              </select>
            </div>
          )}

          {/* Filter Rules */}
          <div className="space-y-3">
            {localFilters.map((filter, index) => (
              <div key={filter.id} className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {/* Filter number */}
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold mt-2">
                  {index + 1}
                </div>

                {/* Column selector */}
                <div className="flex-1">
                  <select
                    value={filter.columnId}
                    onChange={(e) => handleFilterChange(filter.id, 'columnId', e.target.value)}
                    className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 mb-2"
                  >
                    {columns.map(col => (
                      <option key={col.id} value={col.id}>
                        {col.name}
                      </option>
                    ))}
                  </select>

                  {/* Operator selector */}
                  <select
                    value={filter.operator}
                    onChange={(e) => handleFilterChange(filter.id, 'operator', e.target.value)}
                    className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 mb-2"
                  >
                    {getOperatorsForColumn(filter.columnId).map(op => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>

                  {/* Value input */}
                  {getValueInput(filter)}
                </div>

                {/* Remove button */}
                <button
                  onClick={() => handleRemoveFilter(filter.id)}
                  className="flex-shrink-0 p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors mt-2"
                  disabled={localFilters.length === 1}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Filter Button */}
          <Button
            color="light"
            onClick={handleAddFilter}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Filter
          </Button>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex justify-between w-full">
          <Button color="light" onClick={handleClearAll}>
            Clear All
          </Button>
          <div className="flex gap-2">
            <Button color="gray" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Apply Filters
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
