import { Button } from 'flowbite-react';
import { Plus, Trash2, ExternalLink, GripVertical } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import TableCell from './TableCell';
import { truncate } from '../../utils/helpers';

/**
 * Table View Component - Display data in table format
 */
export default function TableView({ columns, records, onUpdateRecord, onDeleteRecord, onAddRecord, onUpdateColumns, onUpdateRecords }) {
  const navigate = useNavigate();
  const { projectId, tableId } = useParams();
  const [draggedColumnIndex, setDraggedColumnIndex] = useState(null);
  const [draggedRecordId, setDraggedRecordId] = useState(null);

  // Filter visible columns and sort by order
  const visibleColumns = columns
    .filter(col => col.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Sort records by order
  const sortedRecords = [...records].sort((a, b) => (a.order || 0) - (b.order || 0));

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

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white">
        <thead>
          <tr className="bg-gray-50 border-b-2 border-gray-200">
            <th className="text-left px-4 py-3 font-semibold text-gray-900 w-12">
              <GripVertical className="w-4 h-4 text-gray-400" />
            </th>
            <th className="text-left px-4 py-3 font-semibold text-gray-900 w-32">
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
           sortedR    className={`text-left px-4 py-3 font-semibold text-gray-900 min-w-[150px] cursor-move transition-colors ${
                  draggedColumnIndex === index ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <span>{column.name}</span>
                  {column.required && (
                    <span className="text-red-500">*</span>
                  )}
                </div>
              </th>
            ))}
            <th className="w-20 px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
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
              <td className="px-4 py-2 text-center cursor-move">
                <GripVertical className="w-4 h-4 text-gray-400 mx-auto" />
              </td>
              <td className="px-4 py-2 border-r border-gray-100">
                <button
                  onClick={() => navigate(`/project/${projectId}/table/${tableId}/record/${record.id}`)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-mono text-sm hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  {truncate(record.id, 12)}
                </button>
              </td>
              {visibleColumns.map((column) => (
                <td key={column.id} className="border-r border-gray-100">
                  <TableCell
                    column={column}
                    value={record.data?.[column.id]}
                    onChange={(value) => handleCellChange(record.id, column.id, value)}
                  />
                </td>
              ))}
              <td className="px-4 py-2 text-center">
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
