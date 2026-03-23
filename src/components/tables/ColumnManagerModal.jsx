import { useState, useEffect } from 'react';
import { Modal, Button, Label, TextInput, Select, Radio } from 'flowbite-react';
import { Plus, Trash2, Eye, EyeOff, GripVertical, Save, Copy, Database, X } from 'lucide-react';
import { COLUMN_TYPES, COLUMN_TYPE_LABELS, DEFAULT_STATUS_OPTIONS, DEFAULT_PRIORITY_OPTIONS } from '../../utils/constants';
import { useStore } from '../../store/store';
import TableSelectorModal from './TableSelectorModal';

/**
 * Generate a unique ID for columns
 */
const generateColumnId = () => {
  return `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Column Manager Modal
 */
export default function ColumnManagerModal({ isOpen, onClose, columns, onSave }) {
  const [editingColumns, setEditingColumns] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [showGlobalFields, setShowGlobalFields] = useState(false);
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [currentColumnIndex, setCurrentColumnIndex] = useState(null);
  
  const { globalFields, createGlobalField, deleteGlobalField } = useStore();

  useEffect(() => {
    setEditingColumns(columns || []);
  }, [columns, isOpen]);

  const handleAddColumn = () => {
    const defaultWidth = 180; // Default width for new columns
    const newColumn = {
      id: generateColumnId(),
      name: 'New Column',
      type: COLUMN_TYPES.TEXT,
      required: false,
      visible: true,
      order: editingColumns.length,
      width: defaultWidth
    };
    setEditingColumns([...editingColumns, newColumn]);
  };

  const handleAddFromGlobalField = (globalField) => {
    const newColumn = {
      id: generateColumnId(),
      name: globalField.name,
      type: globalField.type,
      required: globalField.required || false,
      visible: true,
      order: editingColumns.length,
      options: globalField.options ? [...globalField.options] : undefined
    };
    setEditingColumns([...editingColumns, newColumn]);
    setShowGlobalFields(false);
  };

  const handleSaveAsGlobalField = async (column) => {
    try {
      const globalField = {
        name: column.name,
        type: column.type,
        required: column.required,
        options: column.options ? [...column.options] : undefined
      };
      await createGlobalField(globalField);
      alert(`"${column.name}" saved as global field!`);
    } catch (error) {
      console.error('Failed to save global field:', error);
      alert('Failed to save as global field');
    }
  };

  const handleDeleteGlobalField = async (fieldId) => {
    if (window.confirm('Delete this global field?')) {
      try {
        await deleteGlobalField(fieldId);
      } catch (error) {
        console.error('Failed to delete global field:', error);
      }
    }
  };

  const handleTableSelect = (selection) => {
    if (currentColumnIndex !== null) {
      const updated = [...editingColumns];
      updated[currentColumnIndex] = {
        ...updated[currentColumnIndex],
        optionsSource: 'table',
        linkedTable: {
          tableId: selection.tableId,
          tableName: selection.tableName,
          columnId: selection.columnId,
          columnName: selection.columnName
        },
        options: [] // Clear manual options when switching to table source
      };
      setEditingColumns(updated);
    }
    setShowTableSelector(false);
    setCurrentColumnIndex(null);
  };

  const handleOpenTableSelector = (index) => {
    setCurrentColumnIndex(index);
    setShowTableSelector(true);
  };

  const handleClearTableLink = (index) => {
    const updated = [...editingColumns];
    updated[index] = {
      ...updated[index],
      optionsSource: 'manual',
      linkedTable: null
    };
    setEditingColumns(updated);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newColumns = [...editingColumns];
    const draggedItem = newColumns[draggedIndex];
    newColumns.splice(draggedIndex, 1);
    newColumns.splice(index, 0, draggedItem);

    // Update order
    newColumns.forEach((col, idx) => {
      col.order = idx;
    });

    setEditingColumns(newColumns);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleUpdateColumn = (index, field, value) => {
    const updated = [...editingColumns];
    updated[index] = { ...updated[index], [field]: value };
    
    // Initialize options for status/dropdown columns
    if (field === 'type' && (value === COLUMN_TYPES.STATUS || value === COLUMN_TYPES.DROPDOWN)) {
      if (!updated[index].options) {
        updated[index].options = value === COLUMN_TYPES.STATUS 
          ? [...DEFAULT_STATUS_OPTIONS]
          : [...DEFAULT_PRIORITY_OPTIONS];
      }
    }
    
    // Set appropriate width based on column type
    if (field === 'type') {
      const typeWidths = {
        [COLUMN_TYPES.LINKS]: 220,
        [COLUMN_TYPES.LONG_TEXT]: 250,
        [COLUMN_TYPES.TAGS]: 220,
        [COLUMN_TYPES.DROPDOWN]: 180,
        [COLUMN_TYPES.STATUS]: 180,
        [COLUMN_TYPES.URL]: 200,
        [COLUMN_TYPES.EMAIL]: 200,
        [COLUMN_TYPES.DATE]: 160,
        [COLUMN_TYPES.NUMBER]: 140,
        [COLUMN_TYPES.BOOLEAN]: 100,
        [COLUMN_TYPES.TEXT]: 180
      };
      
      // Only set width if not already set
      if (!updated[index].width) {
        updated[index].width = typeWidths[value] || 180;
      }
    }
    
    setEditingColumns(updated);
  };

  const handleDeleteColumn = (index) => {
    setEditingColumns(editingColumns.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(editingColumns);
  };

  return (
    <>
    <Modal show={isOpen} onClose={onClose} size="2xl">
      <Modal.Header>Manage Columns</Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          {editingColumns.map((column, index) => (
            <div 
              key={column.id} 
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`p-4 border border-gray-200 rounded-lg transition-all ${
                draggedIndex === index ? 'opacity-50' : ''
              } cursor-move hover:border-blue-400`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-2 text-gray-400 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label value="Column Name" />
                      <TextInput
                        value={column.name}
                        onChange={(e) => handleUpdateColumn(index, 'name', e.target.value)}
                        placeholder="Column name"
                      />
                    </div>
                    <div>
                      <Label value="Type" />
                      <Select
                        value={column.type}
                        onChange={(e) => handleUpdateColumn(index, 'type', e.target.value)}
                      >
                        {Object.entries(COLUMN_TYPE_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  {/* Options for status/dropdown columns */}
                  {(column.type === COLUMN_TYPES.STATUS || column.type === COLUMN_TYPES.DROPDOWN) && (
                    <div className="mt-3">
                      <Label value="Options Source" />
                      
                      {/* Source Type Selection */}
                      <div className="flex gap-4 mt-2 mb-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Radio
                            name={`options-source-${column.id}`}
                            value="manual"
                            checked={column.optionsSource !== 'table'}
                            onChange={() => {
                              handleUpdateColumn(index, 'optionsSource', 'manual');
                              if (!column.options || column.options.length === 0) {
                                handleUpdateColumn(index, 'options', 
                                  column.type === COLUMN_TYPES.STATUS 
                                    ? [...DEFAULT_STATUS_OPTIONS]
                                    : [...DEFAULT_PRIORITY_OPTIONS]
                                );
                              }
                            }}
                          />
                          <span className="text-sm text-gray-700">Manual Options</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Radio
                            name={`options-source-${column.id}`}
                            value="table"
                            checked={column.optionsSource === 'table'}
                            onChange={() => handleUpdateColumn(index, 'optionsSource', 'table')}
                          />
                          <span className="text-sm text-gray-700">From Table</span>
                        </label>
                      </div>

                      {/* Manual Options */}
                      {column.optionsSource !== 'table' && (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <Label value="Options" />
                            {/* Copy options from other columns */}
                            {editingColumns.filter((col, colIdx) => 
                              colIdx !== index && 
                              (col.type === COLUMN_TYPES.STATUS || col.type === COLUMN_TYPES.DROPDOWN) && 
                              col.options?.length > 0
                            ).length > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Copy from:</span>
                                <Select
                                  sizing="sm"
                                  className="w-40"
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      const sourceColumn = editingColumns.find(col => col.id === e.target.value);
                                      if (sourceColumn?.options) {
                                        handleUpdateColumn(index, 'options', [...sourceColumn.options]);
                                      }
                                      e.target.value = ''; // Reset select
                                    }
                                  }}
                                >
                                  <option value="">Select column...</option>
                                  {editingColumns
                                    .filter((col, colIdx) => 
                                      colIdx !== index && 
                                      (col.type === COLUMN_TYPES.STATUS || col.type === COLUMN_TYPES.DROPDOWN) && 
                                      col.options?.length > 0
                                    )
                                    .map(col => (
                                      <option key={col.id} value={col.id}>
                                        {col.name} ({col.options.length} options)
                                      </option>
                                    ))}
                                </Select>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2 mt-2">
                            {column.options?.map((option, optIdx) => (
                              <div key={optIdx} className="flex gap-2">
                                <TextInput
                                  value={option.label}
                                  onChange={(e) => {
                                    const newOptions = [...column.options];
                                    newOptions[optIdx].label = e.target.value;
                                    handleUpdateColumn(index, 'options', newOptions);
                                  }}
                                  placeholder="Option label"
                                  sizing="sm"
                                />
                                <input
                                  type="color"
                                  value={option.color}
                                  onChange={(e) => {
                                    const newOptions = [...column.options];
                                    newOptions[optIdx].color = e.target.value;
                                    handleUpdateColumn(index, 'options', newOptions);
                                  }}
                                  className="w-12 h-10 rounded cursor-pointer"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newOptions = column.options.filter((_, i) => i !== optIdx);
                                    handleUpdateColumn(index, 'options', newOptions);
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Remove option"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <Button
                              size="xs"
                              color="light"
                              onClick={() => {
                                const newOptions = [...(column.options || []), { label: 'New Option', color: '#6B7280' }];
                                handleUpdateColumn(index, 'options', newOptions);
                              }}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Option
                            </Button>
                          </div>
                        </>
                      )}

                      {/* Table-based Options */}
                      {column.optionsSource === 'table' && (
                        <div className="mt-2">
                          {column.linkedTable ? (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-2">
                                  <Database className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {column.linkedTable.tableName}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                      Column: {column.linkedTable.columnName}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleClearTableLink(index)}
                                  className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                  title="Remove link"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              color="light"
                              onClick={() => handleOpenTableSelector(index)}
                            >
                              <Database className="w-4 h-4 mr-2" />
                              Select Table and Column
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-3">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={column.required}
                          onChange={(e) => handleUpdateColumn(index, 'required', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Required</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={column.visible !== false}
                          onChange={(e) => handleUpdateColumn(index, 'visible', e.target.checked)}
                          className="rounded"
                        />
                        {column.visible !== false ? (
                          <Eye className="w-4 h-4 text-gray-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-700">Visible</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={column.sortable === true}
                          onChange={(e) => handleUpdateColumn(index, 'sortable', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Sortable</span>
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="xs"
                        color="light"
                        onClick={() => handleSaveAsGlobalField(column)}
                        title="Save as Global Field"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Save as Global
                      </Button>
                      <Button
                        size="xs"
                        color="failure"
                        onClick={() => handleDeleteColumn(index)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {editingColumns.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No columns yet. Add your first column.
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            color="light"
            onClick={handleAddColumn}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Column
          </Button>
          <Button
            color="light"
            onClick={() => setShowGlobalFields(!showGlobalFields)}
          >
            <Copy className="w-4 h-4 mr-2" />
            {showGlobalFields ? 'Hide' : 'Use'} Global Fields
          </Button>
        </div>

        {/* Global Fields Section */}
        {showGlobalFields && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Global Fields</h3>
            {globalFields.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No global fields yet. Save a column as a global field to reuse it across tables.
              </p>
            ) : (
              <div className="space-y-2">
                {globalFields.map((field) => (
                  <div key={field.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">{field.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {COLUMN_TYPE_LABELS[field.type]}
                        {field.required && ' • Required'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="xs"
                        color="blue"
                        onClick={() => handleAddFromGlobalField(field)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Use
                      </Button>
                      <Button
                        size="xs"
                        color="failure"
                        onClick={() => handleDeleteGlobalField(field.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>

    {/* Table Selector Modal */}
    <TableSelectorModal
      isOpen={showTableSelector}
      onClose={() => {
        setShowTableSelector(false);
        setCurrentColumnIndex(null);
      }}
      onSelect={handleTableSelect}
    />
    </>
  );
}
