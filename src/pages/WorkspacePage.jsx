import { useState, useEffect, useRef } from 'react';
import { Button, TextInput, Dropdown, Tabs } from 'flowbite-react';
import { Plus, Search, Folder, Database, MoreVertical, Edit, Trash2, Download, Upload } from 'lucide-react';
import { useStore } from '../store/store';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProjectCard from '../components/workspace/ProjectCard';
import ProjectFormModal from '../components/workspace/ProjectFormModal';
import TableCreateModal from '../components/tables/TableCreateModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { searchFilter } from '../utils/helpers';
import { downloadDatabaseJSON, uploadDatabaseJSON } from '../services/indexedDB';

/**
 * Workspace Page - Main landing page showing all projects
 */
export default function WorkspacePage() {
  const navigate = useNavigate();
  const {
    projects,
    globalTables,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    loadProjects,
    createTable,
    updateTable,
    deleteTable,
    loadGlobalTables,
    clearError
  } = useStore();

  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [activeTab, setActiveTab] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadProjects();
    loadGlobalTables();
  }, [loadProjects, loadGlobalTables]);

  const handleCreate = () => {
    setEditingProject(null);
    setShowModal(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const handleSave = async (formData) => {
    try {
      if (editingProject) {
        await updateProject(editingProject.id, formData);
      } else {
        await createProject(formData);
      }
      setShowModal(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  };

  const handleDelete = async (project) => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"? This will delete all data inside this project.`)) {
      try {
        await deleteProject(project.id);
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  // Global Table Handlers
  const handleCreateGlobalTable = () => {
    setEditingTable(null);
    setShowTableModal(true);
  };

  const handleEditGlobalTable = (table) => {
    setEditingTable(table);
    setShowTableModal(true);
  };

  const handleDeleteGlobalTable = async (table) => {
    if (window.confirm(`Are you sure you want to delete "${table.name}"? This will delete all records in this table.`)) {
      try {
        await deleteTable(table.id);
        await loadGlobalTables();
      } catch (error) {
        console.error('Failed to delete table:', error);
      }
    }
  };

  const handleTableClick = (table) => {
    // Navigate to global table view (we'll use a dummy projectId or handle it specially)
    navigate(`/global-table/${table.id}`);
  };

  const handleCreateTable = async (tableData) => {
    try {
      await createTable(tableData);
      await loadGlobalTables();
      setShowTableModal(false);
    } catch (error) {
      console.error('Failed to create global table:', error);
    }
  };

  const handleUpdateTable = async (tableData) => {
    try {
      await updateTable(editingTable.id, tableData);
      await loadGlobalTables();
      setShowTableModal(false);
      setEditingTable(null);
    } catch (error) {
      console.error('Failed to update global table:', error);
    }
  };

  // Export/Import handlers
  const handleExportDatabase = async () => {
    try {
      await downloadDatabaseJSON();
      alert('Database exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export database. Please try again.');
    }
  };

  const handleImportDatabase = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      alert('Please select a JSON file');
      return;
    }

    const confirmed = window.confirm(
      'WARNING: Importing will replace ALL existing data. Make sure you have a backup. Continue?'
    );

    if (!confirmed) {
      event.target.value = ''; // Reset file input
      return;
    }

    try {
      await uploadDatabaseJSON(file);
      alert('Database imported successfully! The page will now reload.');
      window.location.reload(); // Reload to refresh all data
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import database: ' + error.message);
    } finally {
      event.target.value = ''; // Reset file input
    }
  };

  // Filter and sort projects
  const filteredProjects = searchFilter(projects, searchTerm, ['name', 'description']);
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return new Date(b[sortBy]) - new Date(a[sortBy]);
  });

  if (loading && projects.length === 0) {
    return (
      <Layout>
        <LoadingSpinner message="Loading workspace..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workspace</h1>
            <p className="text-gray-600 mt-1">
              {activeTab === 0 
                ? `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`
                : `${globalTables.length} ${globalTables.length === 1 ? 'global table' : 'global tables'}`
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Export/Import Buttons */}
            <Button color="light" onClick={handleExportDatabase}>
              <Download className="w-4 h-4 mr-2" />
              Export Database
            </Button>
            <Button color="light" onClick={handleImportDatabase}>
              <Upload className="w-4 h-4 mr-2" />
              Import Database
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {/* New Project/Table Button */}
            <Button onClick={activeTab === 0 ? handleCreate : handleCreateGlobalTable}>
              <Plus className="w-5 h-5 mr-2" />
              {activeTab === 0 ? 'New Project' : 'New Global Table'}
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && <ErrorAlert message={error} onClose={clearError} />}

        {/* Tabs */}
        <Tabs aria-label="Workspace tabs" style="underline" onActiveTabChange={(tab) => setActiveTab(tab)}>
          <Tabs.Item active title="Projects" icon={Folder}>
            {/* Search and Sort */}
            <div className="flex items-center gap-4 mb-6 mt-4">
              <div className="flex-1">
                <TextInput
                  icon={Search}
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="updatedAt">Last Updated</option>
                <option value="createdAt">Date Created</option>
                <option value="name">Name</option>
              </select>
            </div>

            {/* Projects Grid */}
            {sortedProjects.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No projects found' : 'No projects yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm
                    ? 'Try adjusting your search'
                    : 'Create your first project to get started'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </Tabs.Item>

          <Tabs.Item title="Tables (Global Tables)" icon={Database}>
            <div className="mt-4">
              {globalTables.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Database className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    No global tables yet
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Create global tables to share data across all your projects
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {globalTables.map((table) => (
                    <div
                      key={table.id}
                      className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 hover:border-blue-400 rounded-lg transition-colors group"
                    >
                      <button
                        onClick={() => handleTableClick(table)}
                        className="flex items-center gap-3 flex-1 text-left min-w-0"
                      >
                        <Database className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <span className="font-medium text-gray-900 break-words">{table.name}</span>
                      </button>
                      <Dropdown
                        label=""
                        dismissOnClick={true}
                        renderTrigger={() => (
                          <button className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <MoreVertical className="w-5 h-5 text-gray-600" />
                          </button>
                        )}
                      >
                        <Dropdown.Item icon={Edit} onClick={() => handleEditGlobalTable(table)}>
                          Edit
                        </Dropdown.Item>
                        <Dropdown.Item icon={Trash2} onClick={() => handleDeleteGlobalTable(table)}>
                          Delete
                        </Dropdown.Item>
                      </Dropdown>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Tabs.Item>
        </Tabs>

        {/* Project Form Modal */}
        <ProjectFormModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingProject(null);
          }}
          onSave={handleSave}
          project={editingProject}
        />

        {/* Table Create/Edit Modal for Global Tables */}
        <TableCreateModal
          isOpen={showTableModal}
          onClose={() => {
            setShowTableModal(false);
            setEditingTable(null);
          }}
          onSave={editingTable ? handleUpdateTable : handleCreateTable}
          table={editingTable}
          projectId={null} // null for global tables
        />
      </div>
    </Layout>
  );
}
