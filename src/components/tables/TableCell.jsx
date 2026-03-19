import { useState, useEffect } from 'react';
import { TextInput, Checkbox, Textarea, Button } from 'flowbite-react';
import { Link as LinkIcon, ExternalLink } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import LinksModal from './LinksModal';
import { COLUMN_TYPES } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';

/**
 * Table Cell Component with inline editing
 */
export default function TableCell({ column, value, onChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [tableOptions, setTableOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  
  // Links modal state
  const [showLinksModal, setShowLinksModal] = useState(false);

  // Fetch options from linked table if configured
  useEffect(() => {
    const fetchTableOptions = async () => {
      if (column.linkedTable && column.optionsSource === 'table') {
        setLoadingOptions(true);
        try {
          const { getRecords } = await import('../../services/indexedDB');
          const records = await getRecords(column.linkedTable.tableId);
          
          // Extract unique values from the linked column
          const uniqueValues = [...new Set(
            records
              .map(record => record.data[column.linkedTable.columnId])
              .filter(val => val !== null && val !== undefined && val !== '')
          )];
          
          // Convert to option format with random colors
          const options = uniqueValues.map(val => ({
            label: String(val),
            color: '#6B7280' // Default gray color for table-based options
          }));
          
          setTableOptions(options);
        } catch (error) {
          console.error('Failed to fetch table options:', error);
          setTableOptions([]);
        } finally {
          setLoadingOptions(false);
        }
      }
    };

    fetchTableOptions();
  }, [column.linkedTable, column.optionsSource]);

  // Get current options (manual or from table)
  const getCurrentOptions = () => {
    if (column.optionsSource === 'table' && column.linkedTable) {
      return tableOptions;
    }
    return column.options || [];
  };

  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && column.type !== COLUMN_TYPES.LONG_TEXT) {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value || '');
      setIsEditing(false);
    }
  };

  // Links management handlers
  const handleLinksChange = (updatedLinks) => {
    onChange(updatedLinks);
  };

  const handleOpenLinksModal = (e) => {
    e.stopPropagation();
    setShowLinksModal(true);
  };

  // Render based on column type
  const renderCellContent = () => {
    if (isEditing) {
      switch (column.type) {
        case COLUMN_TYPES.LONG_TEXT:
          return (
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              rows={3}
              autoFocus
              className="w-full"
            />
          );
        
        case COLUMN_TYPES.NUMBER:
          return (
            <TextInput
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              autoFocus
              sizing="sm"
            />
          );
        
        case COLUMN_TYPES.DATE:
          return (
            <TextInput
              type="date"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              autoFocus
              sizing="sm"
            />
          );
        
        case COLUMN_TYPES.EMAIL:
          return (
            <TextInput
              type="email"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              autoFocus
              sizing="sm"
            />
          );
        
        case COLUMN_TYPES.URL:
          return (
            <TextInput
              type="url"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              autoFocus
              sizing="sm"
            />
          );
        
        case COLUMN_TYPES.STATUS:
        case COLUMN_TYPES.DROPDOWN:
          const currentOptions = getCurrentOptions();
          return (
            <select
              value={editValue}
              onChange={(e) => {
                setEditValue(e.target.value);
                onChange(e.target.value);
                setIsEditing(false);
              }}
              onBlur={() => setIsEditing(false)}
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={loadingOptions}
            >
              <option value="">{loadingOptions ? 'Loading...' : 'Select...'}</option>
              {currentOptions.map((option, idx) => (
                <option key={idx} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        
        default:
          return (
            <TextInput
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              autoFocus
              sizing="sm"
            />
          );
      }
    }

    // Display mode
    switch (column.type) {
      case COLUMN_TYPES.BOOLEAN:
        return (
          <Checkbox
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
          />
        );
      
      case COLUMN_TYPES.STATUS:
        if (value) {
          const currentOptions = getCurrentOptions();
          const option = currentOptions.find(opt => opt.label === value);
          return <StatusBadge label={value} color={option?.color} />;
        }
        return <span className="text-gray-400">No status</span>;
      
      case COLUMN_TYPES.DROPDOWN:
        if (value) {
          const currentOptions = getCurrentOptions();
          const option = currentOptions.find(opt => opt.label === value);
          return option ? (
            <StatusBadge label={value} color={option?.color} />
          ) : (
            <span>{value}</span>
          );
        }
        return <span className="text-gray-400">Not selected</span>;
      
      case COLUMN_TYPES.DATE:
        return value ? (
          <span>{formatDate(value)}</span>
        ) : (
          <span className="text-gray-400">No date</span>
        );
      
      case COLUMN_TYPES.URL:
        return value ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
            {value}
          </a>
        ) : (
          <span className="text-gray-400">No URL</span>
        );
      
      case COLUMN_TYPES.EMAIL:
        return value ? (
          <a href={`mailto:${value}`} className="text-blue-600 hover:underline break-all">
            {value}
          </a>
        ) : (
          <span className="text-gray-400">No email</span>
        );
      
      case COLUMN_TYPES.LONG_TEXT:
        return value ? (
          <div className="whitespace-pre-wrap break-words">{value}</div>
        ) : (
          <span className="text-gray-400">No content</span>
        );
      
      case COLUMN_TYPES.LINKS:
        const links = Array.isArray(value) ? value : [];
        const normalizedLinks = links.map(link => 
          typeof link === 'string' ? { url: link, label: '' } : link
        );
        
        return (
          <div onClick={(e) => e.stopPropagation()} className="space-y-1.5">
            {normalizedLinks.length > 0 ? (
              <>
                {/* Show first 2 links with compact design */}
                <div className="space-y-1">
                  {normalizedLinks.slice(0, 2).map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1.5 text-sm group"
                      onClick={(e) => e.stopPropagation()}
                      title={link.url}
                    >
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 opacity-60 group-hover:opacity-100" />
                      <span className="truncate max-w-[200px] font-medium">
                        {link.label || link.url}
                      </span>
                    </a>
                  ))}
                </div>
                {normalizedLinks.length > 2 && (
                  <div className="text-xs text-gray-500 pl-5">
                    +{normalizedLinks.length - 2} more link{normalizedLinks.length - 2 > 1 ? 's' : ''}
                  </div>
                )}
                <Button
                  size="xs"
                  color="light"
                  onClick={handleOpenLinksModal}
                  className="w-full"
                >
                  <LinkIcon className="w-3 h-3 mr-1.5" />
                  Manage ({normalizedLinks.length})
                </Button>
              </>
            ) : (
              <Button
                size="xs"
                color="light"
                onClick={handleOpenLinksModal}
                className="w-full"
              >
                <LinkIcon className="w-3 h-3 mr-1.5" />
                Add Links
              </Button>
            )}
            
            {/* Links Modal */}
            <LinksModal
              isOpen={showLinksModal}
              onClose={() => setShowLinksModal(false)}
              links={normalizedLinks}
              onChange={handleLinksChange}
            />
          </div>
        );
      
      default:
        return value ? (
          <span className="break-words whitespace-pre-wrap">{value}</span>
        ) : (
          <span className="text-gray-400">Empty</span>
        );
    }
  };

  return (
    <div
      className="table-cell-editable min-h-[36px] px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => {
        if (column.type === COLUMN_TYPES.BOOLEAN || column.type === COLUMN_TYPES.LINKS) return;
        if (!isEditing) setIsEditing(true);
      }}
    >
      {renderCellContent()}
    </div>
  );
}
