import { Button } from 'flowbite-react';
import { Plus, Trash2, ExternalLink, GripVertical, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import TableCell from './TableCell';
import { truncate } from '../../utils/helpers';

/**
 * Table View Component - Display data in table format
 */
export default function TableView({ columns, records, onUpdateRecord, onDeleteRecord, onAddRecord, onUpdateColumns, onUpdateRecords, table, onUpdateTable }) {
  const navigate = useNavigate();
  const { projectId, tableId } = useParams();
  const [draggedColumnIndex, setDraggedColumnIndex] = useState(null);
  const [draggedRecordId, setDraggedRecordId] = useState(null);
  // Multi-column sorting: array of { column, direction }
  const [sortColumns, setSortColumns] = useState([]);
  
  // Column resizing state
  const [resizingColumn, setResizingColumn] = useState(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  const [tempColumnWidths, setTempColumnWidths] = useState({});

  // Load sort state from table when it changes or loads
  useEffect(() => {
    if (table?.sortConfig && Array.isArray(table.sortConfig) && columns.length > 0) {
      // Load multi-column sort from new format
      const validSorts = table.sortConfig
        .map(sort => ({
          column: columns.find(c => c.id === sort.columnId),
          direction: sort.direction || 'asc'
        }))
        .filter(sort => sort.column); // Only include sorts with valid columns
      setSortColumns(validSorts);
    } else if (table?.sortColumnId && columns.length > 0) {
      // Support legacy single-column sort
      const column = columns.find(c => c.id === table.sortColumnId);
      if (column) {
        setSortColumns([{ column, direction: table.sortDirection || 'asc' }]);
      } else {
        setSortColumns([]);
      }
    } else {
      setSortColumns([]);
    }
  }, [table?.sortColumnId, table?.sortDirection, table?.sortConfig, columns]);

  // Filter visible columns and sort by order
  const visibleColumns = columns
    .filter(col => col.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Helper function to compare values based on column type
  const compareValues = (aValue, bValue, column, direction) => {
    // Handle empty values
    if (aValue === undefined || aValue === null || aValue === '') {
      return direction === 'asc' ? 1 : -1;
    }
    if (bValue === undefined || bValue === null || bValue === '') {
      return direction === 'asc' ? -1 : 1;
    }
    
    // Compare based on column type
    let comparison = 0;
    
    if (column.type === 'number') {
      const numA = parseFloat(aValue);
      const numB = parseFloat(bValue);
      comparison = numA - numB;
    } else if (column.type === 'date') {
      const dateA = new Date(aValue).getTime();
      const dateB = new Date(bValue).getTime();
      comparison = dateA - dateB;
    } else if (column.type === 'boolean') {
      const boolA = aValue === true || aValue === 'true' ? 1 : 0;
      const boolB = bValue === true || bValue === 'true' ? 1 : 0;
      comparison = boolA - boolB;
    } else {
      // Text, status, dropdown, longText, url, email, tags - string comparison
      comparison = String(aValue).localeCompare(String(bValue), undefined, { numeric: true, sensitivity: 'base' });
    }
    
    return direction === 'asc' ? comparison : -comparison;
  };

  // Sort records - by selected columns (multi-column sort) or by order
  const sortedRecords = [...records].sort((a, b) => {
    // If sort columns are selected, apply them in order
    if (sortColumns.length > 0) {
      for (const { column, direction } of sortColumns) {
        const aValue = a.data?.[column.id];
        const bValue = b.data?.[column.id];
        const comparison = compareValues(aValue, bValue, column, direction);
        
        // If not equal, return the comparison result
        if (comparison !== 0) {
          return comparison;
        }
        // If equal, continue to next sort column
      }
      // All sort columns are equal, maintain original order
      return 0;
    }
    
    // Default: sort by record order
    return (a.order || 0) - (b.order || 0);
  });

  const handleCellChange = async (recordId, columnId, value) => {
    const record = records.find(r => r.id === recordId);
    if (record) {
      await onUpdateRecord(recordId, {
        ...record.data,
        [columnId]: value
      });
    }
  };

  // Column drag handlers
  const handleColumnDragStart = (e, index) => {
    setDraggedColumnIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColumnDragOver = (e, index) => {
    e.preventDefault();
    if (draggedColumnIndex === null || draggedColumnIndex === index) return;
    e.currentTarget.classList.add('bg-blue-50');
  };

  const handleColumnDragLeave = (e) => {
    e.currentTarget.classList.remove('bg-blue-50');
  };

  const handleColumnDrop = async (e, dropIndex) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-50');
    
    if (draggedColumnIndex === null || draggedColumnIndex === dropIndex) return;

    // Get all columns (including hidden ones)
    const allColumns = [...columns].sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Find the actual columns being moved (need to work with full column list)
    const draggedCol = visibleColumns[draggedColumnIndex];
    const dropCol = visibleColumns[dropIndex];
    
    const draggedActualIndex = allColumns.findIndex(c => c.id === draggedCol.id);
    const dropActualIndex = allColumns.findIndex(c => c.id === dropCol.id);

    // Reorder in the full column list
    const [removed] = allColumns.splice(draggedActualIndex, 1);
    allColumns.splice(dropActualIndex, 0, removed);

    // Update order property for all columns
    allColumns.forEach((col, idx) => {
      col.order = idx;
    });

    // Persist the changes
    if (onUpdateColumns) {
      try {
        await onUpdateColumns(allColumns);
      } catch (error) {
        console.error('Failed to update column order:', error);
      }
    }

    setDraggedColumnIndex(null);
  };

  const handleColumnDragEnd = () => {
    setDraggedColumnIndex(null);
  };

  // Record drag handlers
  const handleRecordDragStart = (e, recordId) => {
    setDraggedRecordId(recordId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleRecordDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-blue-50');
  };

  const handleRecordDragLeave = (e) => {
    e.currentTarget.classList.remove('bg-blue-50');
  };

  const handleRecordDrop = async (e, dropRecordId) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-50');
    
    if (!draggedRecordId || draggedRecordId === dropRecordId) return;

    // Reorder records
    const allRecords = [...sortedRecords];
    const draggedIndex = allRecords.findIndex(r => r.id === draggedRecordId);
    const dropIndex = allRecords.findIndex(r => r.id === dropRecordId);

    if (draggedIndex === -1 || dropIndex === -1) return;

    // Move the dragged record to the drop position
    const [removed] = allRecords.splice(draggedIndex, 1);
    allRecords.splice(dropIndex, 0, removed);

    // Update order property for all records
    allRecords.forEach((record, idx) => {
      record.order = idx;
    });

    // Persist the changes
    if (onUpdateRecords) {
      try {
        await onUpdateRecords(allRecords);
      } catch (error) {
        console.error('Failed to update record order:', error);
      }
    }

    setDraggedRecordId(null);
  };

  const handleRecordDragEnd = () => {
    setDraggedRecordId(null);
  };

  // Handle column header click for sorting
  const handleColumnSort = async (column, shiftKey) => {
    // Only allow sorting if explicitly enabled
    if (column.sortable !== true) return;
    
    let newSortColumns;
    const existingIndex = sortColumns.findIndex(s => s.column.id === column.id);
    
    if (shiftKey && sortColumns.length > 0) {
      // Shift+click: Add to multi-column sort or toggle existing
      if (existingIndex >= 0) {
        const existing = sortColumns[existingIndex];
        if (existing.direction === 'asc') {
          // Toggle to desc
          newSortColumns = [...sortColumns];
          newSortColumns[existingIndex] = { column, direction: 'desc' };
        } else {
          // Remove from sort
          newSortColumns = sortColumns.filter((_, i) => i !== existingIndex);
        }
      } else {
        // Add new column to sort
        newSortColumns = [...sortColumns, { column, direction: 'asc' }];
      }
    } else {
      // Regular click: Single column sort
      if (existingIndex >= 0 && sortColumns.length === 1) {
        const existing = sortColumns[0];
        if (existing.direction === 'asc') {
          // Toggle to desc
          newSortColumns = [{ column, direction: 'desc' }];
        } else {
          // Clear sort
          newSortColumns = [];
        }
      } else {
        // Set as single sort column
        newSortColumns = [{ column, direction: 'asc' }];
      }
    }
    
    // Update local state
    setSortColumns(newSortColumns);
    
    // Persist to database
    if (onUpdateTable && table) {
      try {
        const sortConfig = newSortColumns.map(s => ({
          columnId: s.column.id,
          direction: s.direction
        }));
        await onUpdateTable(table.id, {
          sortConfig,
          // Keep legacy fields for backward compatibility
          sortColumnId: sortConfig[0]?.columnId || null,
          sortDirection: sortConfig[0]?.direction || 'asc'
        });
      } catch (error) {
        console.error('Failed to save sort state:', error);
      }
    }
  };

  // Column resize handlers
  const handleResizeMouseDown = (e, column) => {
    e.preventDefault();
    e.stopPropagation();
    
    setResizingColumn(column.id);
    setResizeStartX(e.clientX);
    setResizeStartWidth(column.width || 200);
    
    // Prevent text selection during resize
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizingColumn) return;
      
      const diff = e.clientX - resizeStartX;
      const newWidth = Math.max(100, resizeStartWidth + diff); // Min width 100px
      
      // Update temporary width for instant visual feedback
      setTempColumnWidths(prev => ({
        ...prev,
        [resizingColumn]: newWidth
      }));
    };

    const handleMouseUp = async () => {
      if (!resizingColumn) return;
      
      // Restore text selection
      document.body.style.userSelect = '';
      
      // Get the final width from temp state
      const finalWidth = tempColumnWidths[resizingColumn] || resizeStartWidth;
      
      const updatedColumns = columns.map(col => 
        col.id === resizingColumn ? { ...col, width: finalWidth } : col
      );
      
      if (onUpdateColumns) {
        try {
          await onUpdateColumns(updatedColumns);
        } catch (error) {
          console.error('Failed to save column width:', error);
        }
      }
      
      // Clear temp widths and reset resize state
      setTempColumnWidths({});
      setResizingColumn(null);
      setResizeStartX(0);
      setResizeStartWidth(0);
    };

    if (resizingColumn) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizingColumn, resizeStartX, resizeStartWidth, tempColumnWidths, columns, onUpdateColumns]);

  // Get column width with default, prioritizing temp width during resize
  const getColumnWidth = (column) => {
    // Use temp width if this column is being resized
    if (tempColumnWidths[column.id] !== undefined) {
      return tempColumnWidths[column.id];
    }
    return column.width || 200;
  };

  return (
    <div className="overflow-x-auto" style={{ maxWidth: '100%' }}>
      <table className="border-collapse bg-white" style={{ tableLayout: 'fixed', width: 'max-content' }}>
        <thead>
          <tr className="bg-gray-50 border-b-2 border-gray-200">
            <th className="text-left px-4 py-3 font-semibold text-gray-900" style={{ width: '50px', minWidth: '50px' }}>
              <GripVertical className="w-4 h-4 text-gray-400" />
            </th>
            <th className="text-left px-4 py-3 font-semibold text-gray-900" style={{ width: '150px', minWidth: '150px' }}>
              Record ID
            </th>
            {visibleColumns.map((column, index) => (
              <th
                key={column.id}
                draggable
                onDragStart={(e) => handleColumnDragStart(e, index)}
                onDragOver={(e) => handleColumnDragOver(e, index)}
                onDragLeave={handleColumnDragLeave}
                onDrop={(e) => handleColumnDrop(e, index)}
                onDragEnd={handleColumnDragEnd}
                style={{ 
                  width: `${getColumnWidth(column)}px`,
                  minWidth: `${getColumnWidth(column)}px`,
                  maxWidth: `${getColumnWidth(column)}px`,
                  position: 'relative'
                }}
                className={`text-left px-4 py-3 font-semibold text-gray-900 transition-colors ${
                  draggedColumnIndex === index ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="cursor-move flex-shrink-0">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                  </div>
                  <div 
                    className={`flex items-center gap-2 flex-1 ${
                      column.sortable === true ? 'cursor-pointer hover:text-blue-600' : ''
                    }`}
                    onClick={(e) => handleColumnSort(column, e.shiftKey)}
                  >
                    <span>{column.name}</span>
                    {column.required && (
                      <span className="text-red-500">*</span>
                    )}
                    {column.sortable === true && (() => {
                      const sortIndex = sortColumns.findIndex(s => s.column.id === column.id);
                      const sortInfo = sortIndex >= 0 ? sortColumns[sortIndex] : null;
                      
                      return (
                        <span className="text-gray-400 flex items-center gap-0.5">
                          {sortInfo ? (
                            <>
                              {sortInfo.direction === 'asc' ? (
                                <ArrowUp className="w-4 h-4 text-blue-600" />
                              ) : (
                                <ArrowDown className="w-4 h-4 text-blue-600" />
                              )}
                              {sortColumns.length > 1 && (
                                <span className="text-xs font-bold text-blue-600">{sortIndex + 1}</span>
                              )}
                            </>
                          ) : (
                            <ArrowUpDown className="w-4 h-4" />
                          )}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                {/* Resize handle */}
                <div
                  className="absolute top-0 right-0 w-4 h-full cursor-col-resize flex items-center justify-center group hover:bg-blue-50"
                  onMouseDown={(e) => handleResizeMouseDown(e, column)}
                  onClick={(e) => e.stopPropagation()}
                  style={{ zIndex: 20 }}
                >
                  <div className="w-0.5 h-full bg-gray-300 group-hover:bg-blue-500 transition-colors"></div>
                </div>
              </th>
            ))}
            <th className="px-4 py-3" style={{ width: '80px', minWidth: '80px' }}></th>
          </tr>
        </thead>
        <tbody>
          {sortedRecords.map((record) => (
            <tr 
              key={record.id} 
              draggable
              onDragStart={(e) => handleRecordDragStart(e, record.id)}
              onDragOver={handleRecordDragOver}
              onDragLeave={handleRecordDragLeave}
              onDrop={(e) => handleRecordDrop(e, record.id)}
              onDragEnd={handleRecordDragEnd}
              className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                draggedRecordId === record.id ? 'opacity-50' : ''
              }`}
            >
              <td className="px-4 py-2 text-center cursor-move" style={{ width: '50px' }}>
                <GripVertical className="w-4 h-4 text-gray-400 mx-auto" />
              </td>
              <td className="px-4 py-2 border-r border-gray-100" style={{ width: '150px' }}>
                <button
                  onClick={() => navigate(`/project/${projectId}/table/${tableId}/record/${record.id}`)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-mono text-sm hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  {truncate(record.id, 12)}
                </button>
              </td>
              {visibleColumns.map((column) => (
                <td 
                  key={column.id} 
                  className="border-r border-gray-100"
                  style={{ 
                    width: `${getColumnWidth(column)}px`,
                    maxWidth: `${getColumnWidth(column)}px`,
                    overflow: 'hidden'
                  }}
                >
                  <TableCell
                    column={column}
                    value={record.data?.[column.id]}
                    onChange={(value) => handleCellChange(record.id, column.id, value)}
                  />
                </td>
              ))}
              <td className="px-4 py-2 text-center" style={{ width: '80px' }}>
                <Button
                  size="xs"
                  color="failure"
                  onClick={() => onDeleteRecord(record.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
          
          {sortedRecords.length === 0 && (
            <tr>
              <td
                colSpan={visibleColumns.length + 3}
                className="px-4 py-8 text-center text-gray-500"
              >
                No records yet. Click "Add Record" to create one.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="p-4 border-t border-gray-200">
        <Button
          size="sm"
          color="light"
          onClick={onAddRecord}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Record
        </Button>
      </div>
    </div>
  );
}
