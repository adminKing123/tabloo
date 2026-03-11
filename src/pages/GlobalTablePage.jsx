import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, TextInput, Dropdown } from 'flowbite-react';
import { ChevronLeft, Settings, Search, ClipboardList, MoreVertical, Trash2, Edit } from 'lucide-react';
import { useStore } from '../store/store';
import Layout from '../components/layout/Layout';
import TableView from '../components/tables/TableView';
import ColumnManagerModal from '../components/tables/ColumnManagerModal';
import TableCreateModal from '../components/tables/TableCreateModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

/**
 * Global Table Page - View and manage global table data (workspace-level)
 */
export default function GlobalTablePage() {
  const { tableId } = useParams();
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
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setCurrentTable(tableId);
  }, [tableId, setCurrentTable]);

  const handleAddRecord = async () => {
    const emptyData = {};
    columns.forEach(col => {
      emptyData[col.id] = '';
    });

    // Calculate the order for the new record (highest order + 1)
    const maxOrder = records.reduce((max, record) => {
      return Math.max(max, record.order || 0);
    }, -1);

    try {
      await createRecord({
        tableId,
        data: emptyData,
        order: maxOrder + 1
      });
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

  // Filter records based on search
  const filteredRecords = records.filter(record => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return columns.some(col => {
      const value = record.data?.[col.id];
      return value?.toString().toLowerCase().includes(searchLower);
    });
  });

  if (loading && !currentTable) {
    return (
      <Layout>
        <LoadingSpinner message="Loading global table..." />
      </Layout>
    );
  }

  if (!currentTable) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Global table not found</h2>
          <Button onClick={() => navigate('/')} className="mt-4">
            Back to Workspace
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              color="light"
              onClick={() => navigate('/')}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 break-words">
                {currentTable.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Global Table • {records.length} {records.length === 1 ? 'record' : 'records'}
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
                      navigate('/');
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

        {/* Search Bar */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <TextInput
              icon={Search}
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

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
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <TableView
              columns={columns}
              records={filteredRecords}
              onUpdateRecord={handleUpdateRecord}
              onDeleteRecord={handleDeleteRecord}
              onAddRecord={handleAddRecord}
              onUpdateColumns={updateColumns}
              onUpdateRecords={updateRecords}
              table={currentTable}
              onUpdateTable={updateTable}
            />
          </div>
        )}

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
          projectId={null}
          table={currentTable}
        />
      </div>
    </Layout>
  );
}
