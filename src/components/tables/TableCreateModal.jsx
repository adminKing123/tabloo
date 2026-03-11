import { useState, useEffect } from 'react';
import { Modal, Button, Label, TextInput, Radio } from 'flowbite-react';
import { useStore } from '../../store/store';
import ProjectIcon from '../common/ProjectIcon';

/**
 * Table Creation Modal with Template Selection
 */
export default function TableCreateModal({ 
  isOpen, 
  onClose, 
  projectId,
  sectionId = null,
  parentTableId = null,
  parentRecordId = null,
  table = null
}) {
  const { templates, createTable, updateTable } = useStore();
  const [step, setStep] = useState(1);
  const [tableName, setTableName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [createType, setCreateType] = useState('template'); // 'template' or 'custom'

  useEffect(() => {
    if (isOpen) {
      if (table) {
        // Edit mode - skip to step 1 with table name
        setStep(1);
        setTableName(table.name);
        setSelectedTemplate(null);
        setCreateType('template');
      } else {
        // Create mode
        setStep(1);
        setTableName('');
        setSelectedTemplate(null);
        setCreateType('template');
      }
    }
  }, [isOpen, table]);

  const handleNext = () => {
    if (step === 1 && tableName.trim()) {
      // If editing, skip template selection
      if (table) {
        handleSave();
      } else {
        setStep(2);
      }
    }
  };

  const handleCreate = async () => {
    if (!tableName.trim()) return;

    const tableData = {
      name: tableName.trim(),
      projectId,
      sectionId,
      parentTableId,
      parentRecordId,
      columns: selectedTemplate?.columns || []
    };

    try {
      await createTable(tableData);
      onClose();
    } catch (error) {
      console.error('Failed to create table:', error);
      // Close modal anyway since table might have been created
      onClose();
    }
  };

  const handleSave = async () => {
    if (!tableName.trim()) return;

    try {
      if (table) {
        // Update existing table
        await updateTable(table.id, { name: tableName.trim() });
      }
      onClose();
    } catch (error) {
      console.error('Failed to update table:', error);
    }
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="lg">
      <Modal.Header>
        {table ? 'Edit Table' : `Create New Table ${step === 2 ? '- Choose Template' : ''}`}
      </Modal.Header>
      <Modal.Body>
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="table-name" value="Table Name *" />
              <TextInput
                id="table-name"
                type="text"
                placeholder="Enter table name"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label value="Choose how to create your table:" />
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <Radio
                    id="use-template"
                    name="create-type"
                    value="template"
                    checked={createType === 'template'}
                    onChange={() => setCreateType('template')}
                  />
                  <Label htmlFor="use-template">Use a template</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Radio
                    id="custom-table"
                    name="create-type"
                    value="custom"
                    checked={createType === 'custom'}
                    onChange={() => {
                      setCreateType('custom');
                      setSelectedTemplate(templates.find(t => t.id === 'template-blank'));
                    }}
                  />
                  <Label htmlFor="custom-table">Start with blank table</Label>
                </div>
              </div>
            </div>

            {createType === 'template' && (
              <div className="mt-4">
                <Label value="Select a template:" />
                <div className="grid grid-cols-2 gap-3 mt-3 max-h-96 overflow-y-auto">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-4 text-left border-2 rounded-lg transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="mb-2">
                        <ProjectIcon icon={template.icon} className="w-8 h-8" />
                      </div>
                      <h4 className="font-semibold text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {template.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {template.columns?.length || 0} columns
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {step === 1 ? (
          <>
            <Button onClick={handleNext} disabled={!tableName.trim()}>
              {table ? 'Save' : 'Next'}
            </Button>
            <Button color="gray" onClick={onClose}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setStep(1)} color="gray">
              Back
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={createType === 'template' && !selectedTemplate}
            >
              Create Table
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}
