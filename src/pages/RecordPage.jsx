import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Dropdown } from 'flowbite-react';
import { Plus, ChevronLeft, Table as TableIcon, Info, ClipboardList, MoreVertical, Trash2, Edit } from 'lucide-react';
import { useStore } from '../store/store';
import Layout from '../components/layout/Layout';
import Section from '../components/sections/Section';
import SectionFormModal from '../components/sections/SectionFormModal';
import TableCreateModal from '../components/tables/TableCreateModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { formatDateTime } from '../utils/helpers';

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

  // Filter sections and tables that belong to this record
  const getChildSections = (parentId) => {
    return sections.filter(s => s.parentId === parentId && s.parentRecordId === recordId);
  };

  const getSectionTables = (sectionId) => {
    return tables.filter(t => t.sectionId === sectionId && t.parentRecordId === recordId);
  };

  const rootSections = sections.filter(s => !s.parentId && s.parentRecordId === recordId);
  const rootTables = tables.filter(t => !t.sectionId && t.parentRecordId === recordId);

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
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <span>{currentTable.name}</span>
              <span>›</span>
              <span>Record Details</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Record: {currentRecord.id.substring(0, 8)}...
            </h1>
          </div>
        </div>

        {/* Error Alert */}
        {error && <ErrorAlert message={error} onClose={clearError} />}

        {/* Record Data Card */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Record Information
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Record ID</span>
              <p className="text-gray-900 font-mono text-sm">{currentRecord.id}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Created</span>
              <p className="text-gray-900">{formatDateTime(currentRecord.createdAt)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Last Updated</span>
              <p className="text-gray-900">{formatDateTime(currentRecord.updatedAt)}</p>
            </div>
          </div>

          {/* Display record data */}
          {currentRecord.data && Object.keys(currentRecord.data).length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Field Values</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {columns.map((column) => (
                  <div key={column.id}>
                    <span className="text-sm font-medium text-gray-500">{column.name}</span>
                    <p className="text-gray-900 whitespace-pre-wrap break-words">
                      {currentRecord.data[column.id] || <span className="text-gray-400">Empty</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Button onClick={() => handleCreateSection()}>
            <Plus className="w-5 h-5 mr-2" />
            New Section
          </Button>
          <Button color="light" onClick={() => handleCreateTable()}>
            <TableIcon className="w-5 h-5 mr-2" />
            New Table
          </Button>
        </div>

        {/* Root Tables */}
        {rootTables.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Nested Tables</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {rootTables.map((table) => (
                <div
                  key={table.id}
                  className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 hover:border-blue-400 rounded-lg transition-colors group"
                >
                  <button
                    onClick={() => handleTableClick(table)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <TableIcon className="w-6 h-6 text-gray-600" />
                    <span className="font-medium text-gray-900">{table.name}</span>
                  </button>
                  <Dropdown
                    label=""
                    dismissOnClick={true}
                    renderTrigger={() => (
                      <button className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-5 h-5 text-gray-600" />
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
            <h3 className="text-lg font-semibold text-gray-900">Nested Sections</h3>
            {rootSections.map((section) => (
              <Section
                key={section.id}
                section={section}
                tables={getSectionTables(section.id)}
                childSections={getChildSections(section.id)}
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
