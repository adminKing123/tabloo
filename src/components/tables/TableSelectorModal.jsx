import { useState, useEffect } from 'react';
import { Modal, Button, Card } from 'flowbite-react';
import { ChevronRight, ChevronDown, Table as TableIcon, Folder, Database } from 'lucide-react';
import { useStore } from '../../store/store';

/**
 * Table Selector Modal - Navigate and select table and column for dropdowns
 */
export default function TableSelectorModal({ isOpen, onClose, onSelect }) {
  const { projects, globalTables, loadProjects, loadGlobalTables } = useStore();
  const [expandedProjects, setExpandedProjects] = useState(new Set());
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedGlobal, setSelectedGlobal] = useState(false);
  const [projectTables, setProjectTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableColumns, setTableColumns] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProjects();
      loadGlobalTables();
      setExpandedProjects(new Set());
      setSelectedProject(null);
      setSelectedGlobal(false);
      setSelectedTable(null);
      setProjectTables([]);
      setTableColumns([]);
    }
  }, [isOpen, loadProjects, loadGlobalTables]);

  const toggleGlobalTables = () => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has('global')) {
      newExpanded.delete('global');
      setExpandedProjects(newExpanded);
      if (selectedGlobal) {
        setSelectedGlobal(false);
        setProjectTables([]);
        setSelectedTable(null);
        setTableColumns([]);
      }
    } else {
      newExpanded.add('global');
      setExpandedProjects(newExpanded);
      setSelectedGlobal(true);
      setSelectedProject(null);
      setProjectTables(globalTables);
    }
  };

  const toggleProject = async (projectId) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
      setExpandedProjects(newExpanded);
      if (selectedProject === projectId) {
        setSelectedProject(null);
        setProjectTables([]);
        setSelectedTable(null);
        setTableColumns([]);
      }
    } else {
      newExpanded.add(projectId);
      setExpandedProjects(newExpanded);
      setSelectedProject(projectId);
      setSelectedGlobal(false);
      
      // Load tables for this project
      setLoading(true);
      try {
        const { getTables } = await import('../../services/indexedDB');
        const tables = await getTables(projectId);
        setProjectTables(tables);
      } catch (error) {
        console.error('Failed to load tables:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const selectTable = async (table) => {
    setSelectedTable(table);
    
    // Load columns for this table
    setLoading(true);
    try {
      const { getColumns } = await import('../../services/indexedDB');
      const columns = await getColumns(table.id);
      setTableColumns(columns);
    } catch (error) {
      console.error('Failed to load columns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleColumnSelect = (column) => {
    if (selectedTable && column) {
      onSelect({
        tableId: selectedTable.id,
        tableName: selectedTable.name,
        columnId: column.id,
        columnName: column.name
      });
      onClose();
    }
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="3xl">
      <Modal.Header>Select Table and Column for Dropdown Options</Modal.Header>
      <Modal.Body>
        <div className="grid grid-cols-3 gap-4 h-96">
          {/* Projects List */}
          <div className="border-r pr-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Projects</h3>
            <div className="space-y-1">
              {/* Global Tables Section */}
              <div>
                <button
                  onClick={toggleGlobalTables}
                  className={`w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition-colors text-left ${
                    selectedGlobal ? 'bg-blue-50' : ''
                  }`}
                >
                  {expandedProjects.has('global') ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  <Database className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium truncate">Global Tables</span>
                </button>
              </div>
              
              {/* Projects */}
              {projects.map((project) => (
                <div key={project.id}>
                  <button
                    onClick={() => toggleProject(project.id)}
                    className={`w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition-colors text-left ${
                      selectedProject === project.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    {expandedProjects.has(project.id) ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                    <Folder className="w-4 h-4 text-gray-600" />
                    <span className="text-sm truncate">{project.name}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tables List */}
          <div className="border-r pr-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Tables</h3>
            {loading && (selectedProject || selectedGlobal) && !selectedTable ? (
              <p className="text-sm text-gray-500">Loading tables...</p>
            ) : projectTables.length > 0 ? (
              <div className="space-y-1">
                {projectTables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => selectTable(table)}
                    className={`w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition-colors text-left ${
                      selectedTable?.id === table.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <TableIcon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm truncate">{table.name}</span>
                  </button>
                ))}
              </div>
            ) : (selectedProject || selectedGlobal) ? (
              <p className="text-sm text-gray-500">
                No tables {selectedGlobal ? 'in global tables' : 'in this project'}
              </p>
            ) : (
              <p className="text-sm text-gray-400">Select a project or global tables to view tables</p>
            )}
          </div>

          {/* Columns List */}
          <div className="overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Columns</h3>
            {loading && selectedTable ? (
              <p className="text-sm text-gray-500">Loading columns...</p>
            ) : tableColumns.length > 0 ? (
              <div className="space-y-1">
                {tableColumns.map((column) => (
                  <button
                    key={column.id}
                    onClick={() => handleColumnSelect(column)}
                    className="w-full flex items-center gap-2 p-2 rounded hover:bg-blue-100 hover:border-blue-300 border border-transparent transition-colors text-left"
                  >
                    <Database className="w-4 h-4 text-gray-600" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{column.name}</div>
                      <div className="text-xs text-gray-500">{column.type}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : selectedTable ? (
              <p className="text-sm text-gray-500">No columns in this table</p>
            ) : (
              <p className="text-sm text-gray-400">Select a table to view columns</p>
            )}
          </div>
        </div>

        {selectedTable && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Selected:</strong> {selectedTable.name}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Click on a column above to use it as dropdown options
            </p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
