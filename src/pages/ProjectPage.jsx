import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Dropdown } from 'flowbite-react';
import { Plus, ChevronLeft, Table as TableIcon, BarChart2, MoreVertical, Trash2, Edit } from 'lucide-react';
import { useStore } from '../store/store';
import Layout from '../components/layout/Layout';
import Section from '../components/sections/Section';
import SectionFormModal from '../components/sections/SectionFormModal';
import TableCreateModal from '../components/tables/TableCreateModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import ProjectIcon from '../components/common/ProjectIcon';

/**
 * Project Page - Shows sections and tables within a project
 */
export default function ProjectPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const {
    currentProject,
    sections,
    tables,
    loading,
    error,
    setCurrentProject,
    createSection,
    updateSection,
    deleteSection,
    deleteTable,
    clearError
  } = useStore();

  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editingTable, setEditingTable] = useState(null);
  const [parentSectionId, setParentSectionId] = useState(null);
  const [tableSectionId, setTableSectionId] = useState(null);

  useEffect(() => {
    setCurrentProject(projectId);
  }, [projectId, setCurrentProject]);

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
          parentId: parentSectionId
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

  // Organize sections hierarchically
  const getChildSections = (parentId) => {
    return sections.filter(s => s.parentId === parentId);
  };

  const getSectionTables = (sectionId) => {
    return tables.filter(t => t.sectionId ===sectionId && !t.parentTableId);
  };

  const rootSections = sections.filter(s => !s.parentId);
  const rootTables = tables.filter(t => !t.sectionId && !t.parentTableId);

  if (loading && !currentProject) {
    return (
      <Layout>
        <LoadingSpinner message="Loading project..." />
      </Layout>
    );
  }

  if (!currentProject) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
          <Button onClick={() => navigate('/')} className="mt-4">
            Back to Workspace
          </Button>
        </div>
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
          <div className="flex items-center gap-3 flex-1">
            <ProjectIcon icon={currentProject.icon || 'Folder'} className="w-10 h-10" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {currentProject.name}
              </h1>
              {currentProject.description && (
                <p className="text-gray-600 mt-1">{currentProject.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && <ErrorAlert message={error} onClose={clearError} />}

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

        {/* Root Tables (tables not in any section) */}
        {rootTables.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Tables</h3>
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
            <h3 className="text-lg font-semibold text-gray-900">Sections</h3>
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
          table={editingTable}
        />
      </div>
    </Layout>
  );
}
