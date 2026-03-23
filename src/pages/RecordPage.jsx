import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Dropdown, Badge } from 'flowbite-react';
import { Plus, ChevronLeft, Table as TableIcon, Info, ClipboardList, MoreVertical, Trash2, Edit, ExternalLink, Copy, Check } from 'lucide-react';
import { useStore } from '../store/store';
import Layout from '../components/layout/Layout';
import Section from '../components/sections/Section';
import SectionFormModal from '../components/sections/SectionFormModal';
import TableCreateModal from '../components/tables/TableCreateModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import StatusBadge from '../components/common/StatusBadge';
import DateDisplay from '../components/common/DateDisplay';
import { formatDateTime } from '../utils/helpers';
import { COLUMN_TYPES } from '../utils/constants';

/**
 * Record Page - Shows individual record with its nested sections and tables
 */
export default function RecordPage() {
  const { projectId, tableId, recordId } = useParams();
  const navigate = useNavigate();
  
  const {
    currentTable,
    sections,
    tables,
    records,
    columns,
    loading,
    error,
    setCurrentTable,
    createSection,
    updateSection,
    deleteSection,
    deleteTable,
    clearError
  } = useStore();

  const [currentRecord, setCurrentRecord] = useState(null);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editingTable, setEditingTable] = useState(null);
  const [parentSectionId, setParentSectionId] = useState(null);
  const [tableSectionId, setTableSectionId] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    const loadTable = async () => {
      await setCurrentTable(tableId);
    };
    loadTable();
  }, [tableId, setCurrentTable]);

  useEffect(() => {
    // Find and set the current record once records are loaded
    if (records.length > 0) {
      const record = records.find(r => r.id === recordId);
      if (record) {
        setCurrentRecord(record);
      }
    }
  }, [records, recordId]);

  const handleCreateSection = (parentId = null) => {
    setParentSectionId(parentId);
    setEditingSection(null);
    setShowSectionModal(true);
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setShowSectionModal(true);
  };

  const handleSaveSection = async (formData) => {
    try {
      if (editingSection) {
        await updateSection(editingSection.id, formData);
      } else {
        await createSection({
          ...formData,
          projectId,
          parentId: parentSectionId,
          parentRecordId: recordId // Link section to this record
        });
      }
      setShowSectionModal(false);
      setEditingSection(null);
      setParentSectionId(null);
    } catch (error) {
      console.error('Failed to save section:', error);
    }
  };

  const handleDeleteSection = async (section) => {
    if (window.confirm(`Are you sure you want to delete "${section.name}"? This will delete all nested content.`)) {
      try {
        await deleteSection(section.id);
      } catch (error) {
        console.error('Failed to delete section:', error);
      }
    }
  };

  const handleCreateTable = (sectionId = null) => {
    setTableSectionId(sectionId);
    setEditingTable(null);
    setShowTableModal(true);
  };

  const handleEditTable = (table) => {
    setEditingTable(table);
    setShowTableModal(true);
  };

  const handleTableClick = (table) => {
    navigate(`/project/${projectId}/table/${table.id}`);
  };

  const handleDeleteTable = async (table) => {
    if (window.confirm(`Are you sure you want to delete "${table.name}"?`)) {
      try {
        await deleteTable(table.id);
      } catch (error) {
        console.error('Failed to delete table:', error);
      }
    }
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(currentRecord.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (error) {
      console.error('Failed to copy ID:', error);
    }
  };

  // Filter sections and tables that belong to this record
  const getChildSections = (parentId) => {
    return sections.filter(s => s.parentId === parentId && s.parentRecordId === recordId);
  };

  const getSectionTables = (sectionId) => {
    return tables.filter(t => t.sectionId === sectionId && t.parentRecordId === recordId);
  };

  const rootSections = sections.filter(s => !s.parentId && s.parentRecordId === recordId);
  const rootTables = tables.filter(t => !t.sectionId && t.parentRecordId === recordId);

  // Helper function to render field value based on column type
  const renderFieldValue = (column, value) => {
    if (value === undefined || value === null || value === '') {
      return <span className="text-gray-400 dark:text-gray-500">Empty</span>;
    }

    switch (column.type) {
      case COLUMN_TYPES.LINKS:
        if (!Array.isArray(value) || value.length === 0) {
          return <span className="text-gray-400 dark:text-gray-500">No links</span>;
        }
        return (
          <div className="flex flex-col gap-1">
            {value.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 w-fit"
              >
                <ExternalLink className="w-3 h-3" />
                <span className="underline">{link.label || link.url}</span>
              </a>
            ))}
          </div>
        );

      case COLUMN_TYPES.TAGS:
        if (!Array.isArray(value) || value.length === 0) {
          return <span className="text-gray-400 dark:text-gray-500">No tags</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((tag, idx) => (
              <Badge key={idx} color="info" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        );

      case COLUMN_TYPES.STATUS:
        // Look up the color from column options
        const statusOption = column.options?.find(opt => opt.label === value);
        return <StatusBadge label={value} color={statusOption?.color} />;

      case COLUMN_TYPES.DROPDOWN:
        // Look up the color from column options (if available)
        const dropdownOption = column.options?.find(opt => {
          // Support both string options and object options
          if (typeof opt === 'string') return opt === value;
          return opt.label === value;
        });
        const dropdownColor = typeof dropdownOption === 'object' ? dropdownOption.color : undefined;
        
        if (dropdownColor) {
          return <StatusBadge label={value} color={dropdownColor} />;
        }
        return <Badge color="gray">{value}</Badge>;

      case COLUMN_TYPES.BOOLEAN:
        return (
          <Badge color={value ? 'success' : 'gray'}>
            {value ? 'Yes' : 'No'}
          </Badge>
        );

      case COLUMN_TYPES.URL:
        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 w-fit"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="underline break-all">{value}</span>
          </a>
        );

      case COLUMN_TYPES.EMAIL:
        return (
          <a
            href={`mailto:${value}`}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
          >
            {value}
          </a>
        );

      case COLUMN_TYPES.DATE:
        return <DateDisplay date={value} compact={false} showTime={false} />;

      case COLUMN_TYPES.JSON:
        if (typeof value === 'object') {
          return (
            <pre className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded overflow-x-auto">
              {JSON.stringify(value, null, 2)}
            </pre>
          );
        }
        return <span className="text-gray-900 dark:text-white">{value}</span>;

      default:
        // Handle arrays and objects
        if (Array.isArray(value)) {
          return <span className="text-gray-900 dark:text-white">{value.join(', ')}</span>;
        }
        if (typeof value === 'object') {
          return <span className="text-gray-900 dark:text-white">{JSON.stringify(value)}</span>;
        }
        return <span className="whitespace-pre-wrap break-words text-gray-900 dark:text-white">{String(value)}</span>;
    }
  };

  if (loading || !currentRecord || !currentTable) {
    return (
      <Layout>
        <LoadingSpinner message="Loading record..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            color="light"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <span className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer" onClick={() => navigate(-1)}>
                {currentTable.name}
              </span>
              <span>›</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">Record Details</span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-mono">
                {currentRecord.id}
              </h1>
              <button
                onClick={handleCopyId}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Copy ID"
              >
                {copiedId ? (
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && <ErrorAlert message={error} onClose={clearError} />}

        {/* Record Metadata */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <Info className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">ID:</span>
              <span className="text-xs font-mono text-gray-900 dark:text-white">{currentRecord.id}</span>
              <button
                onClick={handleCopyId}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title="Copy ID"
              >
                {copiedId ? (
                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Created:</span>
              <DateDisplay date={currentRecord.createdAt} compact={true} showTime={false} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Updated:</span>
              <DateDisplay date={currentRecord.updatedAt} compact={true} showTime={false} />
            </div>
          </div>
        </div>

        {/* Record Data */}
        {currentRecord.data && Object.keys(currentRecord.data).length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Field Data</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {columns.map((column) => (
                  <div key={column.id} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{column.name}</span>
                      {column.required && (
                        <span className="text-red-500 text-xs">*</span>
                      )}
                      <span className="text-xs text-gray-400 dark:text-gray-500 uppercase">{column.type}</span>
                    </div>
                    <div className="pl-0">
                      {renderFieldValue(column, currentRecord.data[column.id])}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Nested Content */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Add Nested Content</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => handleCreateSection()} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Section
            </Button>
            <Button color="light" onClick={() => handleCreateTable()} size="sm">
              <TableIcon className="w-4 h-4 mr-2" />
              New Table
            </Button>
          </div>
        </div>

        {/* Root Tables */}
        {rootTables.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Nested Tables</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {rootTables.map((table) => (
                <div
                  key={table.id}
                  className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-lg transition-colors group"
                >
                  <button
                    onClick={() => handleTableClick(table)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <TableIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">{table.name}</span>
                  </button>
                  <Dropdown
                    label=""
                    dismissOnClick={true}
                    renderTrigger={() => (
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                    )}
                  >
                    <Dropdown.Item icon={Edit} onClick={() => handleEditTable(table)}>
                      Edit
                    </Dropdown.Item>
                    <Dropdown.Item icon={Trash2} onClick={() => handleDeleteTable(table)}>
                      Delete
                    </Dropdown.Item>
                  </Dropdown>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sections */}
        {rootSections.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Nested Sections</h3>
            {rootSections.map((section) => (
              <Section
                key={section.id}
                section={section}
                allTables={tables}
                allSections={sections}
                onAddTable={handleCreateTable}
                onAddSection={handleCreateSection}
                onEdit={handleEditSection}
                onDelete={handleDeleteSection}
                onTableClick={handleTableClick}
                onEditTable={handleEditTable}
                onDeleteTable={handleDeleteTable}
                depth={0}
              />
            ))}
          </div>
        ) : rootTables.length === 0 ? (
          null
        ) : null}

        {/* Modals */}
        <SectionFormModal
          isOpen={showSectionModal}
          onClose={() => {
            setShowSectionModal(false);
            setEditingSection(null);
            setParentSectionId(null);
          }}
          onSave={handleSaveSection}
          section={editingSection}
        />

        <TableCreateModal
          isOpen={showTableModal}
          onClose={() => {
            setShowTableModal(false);
            setEditingTable(null);
            setTableSectionId(null);
          }}
          projectId={projectId}
          sectionId={tableSectionId}
          parentTableId={tableId}
          parentRecordId={recordId}
          table={editingTable}
        />
      </div>
    </Layout>
  );
}
