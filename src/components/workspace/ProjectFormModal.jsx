import { useState, useEffect } from 'react';
import { Modal, Button, Label, TextInput, Textarea } from 'flowbite-react';
import { PROJECT_COLORS } from '../../utils/constants';
import IconPicker from '../common/IconPicker';

/**
 * Project Form Modal for Create/Edit
 */
export default function ProjectFormModal({ isOpen, onClose, onSave, project = null }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Folder',
    color: PROJECT_COLORS[0]
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        icon: project.icon || 'Folder',
        color: project.color || PROJECT_COLORS[0]
      });
    } else {
      setFormData({
        name: '',
        description: '',
        icon: 'Folder',
        color: PROJECT_COLORS[0]
      });
    }
  }, [project, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="md">
      <Modal.Header>
        {project ? 'Edit Project' : 'Create New Project'}
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" value="Project Name *" />
            <TextInput
              id="name"
              type="text"
              placeholder="Enter project name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description" value="Description" />
            <Textarea
              id="description"
              placeholder="Enter project description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <Label value="Icon" />
            <IconPicker 
              selectedIcon={formData.icon}
              onSelect={(icon) => setFormData({ ...formData, icon })}
              className="mt-2"
            />
          </div>

          <div>
            <Label value="Color" />
            <div className="grid grid-cols-8 gap-2 mt-2">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    formData.color === color
                      ? 'border-gray-800 scale-110'
                      : 'border-gray-200 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" onClick={handleSubmit}>
          {project ? 'Update' : 'Create'}
        </Button>
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
