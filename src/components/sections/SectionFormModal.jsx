import { useState, useEffect } from 'react';
import { Modal, Button, Label, TextInput } from 'flowbite-react';

/**
 * Section Form Modal for Create/Edit
 */
export default function SectionFormModal({ 
  isOpen, 
  onClose, 
  onSave, 
  section = null 
}) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (section) {
      setName(section.name || '');
    } else {
      setName('');
    }
  }, [section, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({ name: name.trim() });
      setName('');
    }
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="md">
      <Modal.Header>
        {section ? 'Edit Section' : 'Create New Section'}
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="section-name" value="Section Name *" />
            <TextInput
              id="section-name"
              type="text"
              placeholder="Enter section name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" onClick={handleSubmit}>
          {section ? 'Update' : 'Create'}
        </Button>
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
