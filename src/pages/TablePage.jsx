import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, TextInput, Dropdown, Badge } from 'flowbite-react';
import { ChevronLeft, Settings, Search, Filter, ClipboardList, MoreVertical, Trash2, Edit, Plus } from 'lucide-react';
import { useStore } from '../store/store';
import Layout from '../components/layout/Layout';
import TableView from '../components/tables/TableView';
import ColumnManagerModal from '../components/tables/ColumnManagerModal';
import FilterModal from '../components/tables/FilterModal';
import TableCreateModal from '../components/tables/TableCreateModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { applyFilters } from '../utils/helpers';

/**
 * Table Page - View and manage table data
 */
export default function TablePage() {
  const { projectId, tableId } = useParams();
  const navigate = useNavigate();

  const {
    currentTable,
    records,
    columns,
    loading,
    error,
    setCurrentTable,
    createRecord,
    updateRecord,
    updateRecords,
    deleteRecord,
    createColumn,
    updateColumn,
    updateColumns,
    deleteColumn,
    deleteTable,
    updateTable,
    clearError
  } = useStore();

  const [showColumnManager, setShowColumnManager] = useState(false);
  const [showEditTable, setShowEditTable] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterConfig, setFilterConfig] = useState({ filters: [], logic: 'AND' });
  const [recentlyAddedRecordId, setRecentlyAddedRecordId] = useState(null);

  useEffect(() => {
    setCurrentTable(tableId);
  }, [tableId, setCurrentTable]);

  // Load filter config from table
  useEffect(() => {
    if (currentTable?.filterConfig) {
      setFilterConfig(currentTable.filterConfig);
    } else {
      setFilterConfig({ filters: [], logic: 'AND' });
    }
  }, [currentTable]);

  const handleAddRecord = async () => {
    const emptyData = {};
    columns.forEach(col => {
      emptyData[col.id] = '';
    });

    try {
      // Add new record at the TOP (order 0)
      const newRecord = await createRecord({
        tableId,
        data: emptyData,
        order: 0
      });
      
      // Shift all existing records down by updating their order
      const updatedRecords = records.map(record => ({
        ...record,
        order: (record.order || 0) + 1
      }));
      
      if (updatedRecords.length > 0) {
        await updateRecords(updatedRecords);
      }
      
      // Highlight the new record for 3 seconds
      if (newRecord?.id) {
        setRecentlyAddedRecordId(newRecord.id);
        setTimeout(() => setRecentlyAddedRecordId(null), 3000);
      }
    } catch (error) {
      console.error('Failed to create record:', error);
    }
  };

  const handleUpdateRecord = async (recordId, data) => {
    try {
      await updateRecord(recordId, { data });
    } catch (error) {
      console.error('Failed to update record:', error);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await deleteRecord(recordId);
      } catch (error) {
        console.error('Failed to delete record:', error);
      }
    }
  };

  const handleSaveColumns = async (updatedColumns) => {
    try {
      // Delete removed columns
      const updatedIds = updatedColumns.map(c => c.id);
      const columnsToDelete = columns.filter(c => !updatedIds.includes(c.id));
      for (const col of columnsToDelete) {
        await deleteColumn(col.id);
      }

      // Update or create columns
      for (const col of updatedColumns) {
        const existing = columns.find(c => c.id === col.id);
        if (existing) {
          await updateColumn(col.id, col);
        } else {
          await createColumn({ ...col, tableId });
        }
      }

      setShowColumnManager(false);
      // Reload table data
      await setCurrentTable(tableId);
    } catch (error) {
      console.error('Failed to save columns:', error);
    }
  };

  const handleSaveFilters = async (newFilterConfig) => {
    setFilterConfig(newFilterConfig);
    
    // Persist to database
    if (onUpdateTable && currentTable) {
      try {
        await updateTable(currentTable.id, {
          filterConfig: newFilterConfig
        });
      } catch (error) {
        console.error('Failed to save filters:', error);
      }
    }
  };

  const handleClearFilters = async () => {
    const emptyConfig = { filters: [], logic: 'AND' };
    setFilterConfig(emptyConfig);
    
    // Persist to database
    if (currentTable) {
      try {
        await updateTable(currentTable.id, {
          filterConfig: emptyConfig
        });
      } catch (error) {
        console.error('Failed to clear filters:', error);
      }
    }
  };

  // Filter records based on search
  const filteredRecords = records.filter(record => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return columns.some(col => {
      const value = record.data?.[col.id];
      return value?.toString().toLowerCase().includes(searchLower);
    });
  });

  // Apply advanced filters
  const finalFilteredRecords = applyFilters(filteredRecords, filterConfig, columns);

  if (loading && !currentTable) {
    return (
      <Layout>
        <LoadingSpinner message="Loading table..." />
      </Layout>
    );
  }

  if (!currentTable) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Table not found</h2>
          <Button onClick={() => navigate(`/project/${projectId}`)} className="mt-4">
            Back to Project
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <Button
              color="light"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 break-words">
                {currentTable.name}
              </h1>
              <p className="text-gray-600 mt-1">
                {records.length} {records.length === 1 ? 'record' : 'records'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              color="light"
              onClick={() => setShowColumnManager(true)}
            >
              <Settings className="w-5 h-5 mr-2" />
              Manage Columns
            </Button>
            <Dropdown
              label=""
              dismissOnClick={true}
              renderTrigger={() => (
                <button className="p-2 hover:bg-gray-100 rounded border border-gray-300">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              )}
            >
              <Dropdown.Item 
                icon={Edit} 
                onClick={() => setShowEditTable(true)}
              >
                Edit Table
              </Dropdown.Item>
              <Dropdown.Item 
                icon={Trash2} 
                onClick={async () => {
                  if (window.confirm(`Are you sure you want to delete "${currentTable.name}"? This will delete all records in this table.`)) {
                    try {
                      await deleteTable(tableId);
                      navigate(`/project/${projectId}`);
                    } catch (error) {
                      console.error('Failed to delete table:', error);
                    }
                  }
                }}
              >
                Delete Table
              </Dropdown.Item>
            </Dropdown>
          </div>
        </div>

        {/* Error Alert */}
        {error && <ErrorAlert message={error} onClose={clearError} />}

        {/* Search, Filter, and Add Record Bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <TextInput
              icon={Search}
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {columns.length > 0 && (
            <>
              <Button
                color={filterConfig.filters.length > 0 ? "info" : "light"}
                onClick={() => setShowFilterModal(true)}
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
                {filterConfig.filters.length > 0 && (
                  <Badge color="info" className="ml-2">
                    {filterConfig.filters.length}
                  </Badge>
                )}
              </Button>
              {filterConfig.filters.length > 0 && (
                <Button
                  color="gray"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
              )}
              <Button
                onClick={handleAddRecord}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Record
              </Button>
            </>
          )}
        </div>

        {/* Active Filters Display */}
        {filterConfig.filters.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-blue-900">Active Filters ({filterConfig.logic}):</span>
              {filterConfig.filters.map((filter, idx) => {
                const column = columns.find(c => c.id === filter.columnId);
                // Convert filter value to string, handling objects
                const displayValue = filter.value ? 
                  (typeof filter.value === 'object' ? JSON.stringify(filter.value) : String(filter.value)) 
                  : '';
                return (
                  <Badge key={idx} color="info" size="sm">
                    {column?.name}: {filter.operator} {displayValue && `"${displayValue}"`}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Table Content */}
        {columns.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No columns defined
            </h3>
            <p className="text-gray-600 mb-6">
              Add columns to start organizing your data
            </p>
            <Button onClick={() => setShowColumnManager(true)}>
              <Settings className="w-5 h-5 mr-2" />
              Add Columns
            </Button>
          </div>
        ) : (
          <div className="bg-white -mx-6 overflow-hidden">
            <TableView
              columns={columns}
              records={finalFilteredRecords}
              onUpdateRecord={handleUpdateRecord}
              onDeleteRecord={handleDeleteRecord}
              onAddRecord={handleAddRecord}
              onUpdateColumns={updateColumns}
              onUpdateRecords={updateRecords}
              table={currentTable}
              onUpdateTable={updateTable}
              recentlyAddedRecordId={recentlyAddedRecordId}
            />
          </div>
        )}

        {/* Filter Modal */}
        <FilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          columns={columns}
          filters={filterConfig.filters}
          onSave={handleSaveFilters}
        />

        {/* Column Manager Modal */}
        <ColumnManagerModal
          isOpen={showColumnManager}
          onClose={() => setShowColumnManager(false)}
          columns={columns}
          onSave={handleSaveColumns}
        />

        {/* Edit Table Modal */}
        <TableCreateModal
          isOpen={showEditTable}
          onClose={() => setShowEditTable(false)}
          projectId={projectId}
          table={currentTable}
        />
      </div>
    </Layout>
  );
}
