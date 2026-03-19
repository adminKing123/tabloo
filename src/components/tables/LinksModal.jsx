import { useState, useEffect } from 'react';
import { Modal, Button, TextInput, Label } from 'flowbite-react';
import { Plus, X, ExternalLink, Edit2, Check } from 'lucide-react';

/**
 * Links Management Modal - Add, edit, and remove links
 */
export default function LinksModal({ isOpen, onClose, links = [], onChange }) {
  const [linksList, setLinksList] = useState([]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editUrl, setEditUrl] = useState('');
  const [editLabel, setEditLabel] = useState('');

  useEffect(() => {
    // Ensure links is an array of objects with url and label
    const normalizedLinks = Array.isArray(links) 
      ? links.map(link => {
          if (typeof link === 'string') {
            return { url: link, label: '' };
          }
          return link;
        })
      : [];
    setLinksList(normalizedLinks);
  }, [links, isOpen]);

  const handleAddLink = () => {
    if (!newLinkUrl.trim()) return;

    // Try to extract hostname for default label
    let defaultLabel = newLinkUrl.trim();
    try {
      const url = new URL(newLinkUrl.trim());
      defaultLabel = url.hostname;
    } catch (e) {
      // If URL is invalid, use the full input as label
      defaultLabel = newLinkUrl.trim();
    }

    const newLink = {
      url: newLinkUrl.trim(),
      label: newLinkLabel.trim() || defaultLabel
    };

    const updatedLinks = [...linksList, newLink];
    setLinksList(updatedLinks);
    setNewLinkUrl('');
    setNewLinkLabel('');
  };

  const handleRemoveLink = (index) => {
    const updatedLinks = linksList.filter((_, i) => i !== index);
    setLinksList(updatedLinks);
  };

  const handleStartEdit = (index) => {
    setEditingIndex(index);
    setEditUrl(linksList[index].url);
    setEditLabel(linksList[index].label);
  };

  const handleSaveEdit = (index) => {
    if (!editUrl.trim()) return;

    // Try to extract hostname for default label
    let defaultLabel = editUrl.trim();
    try {
      const url = new URL(editUrl.trim());
      defaultLabel = url.hostname;
    } catch (e) {
      // If URL is invalid, use the full input as label
      defaultLabel = editUrl.trim();
    }

    const updatedLinks = [...linksList];
    updatedLinks[index] = {
      url: editUrl.trim(),
      label: editLabel.trim() || defaultLabel
    };
    setLinksList(updatedLinks);
    setEditingIndex(null);
    setEditUrl('');
    setEditLabel('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditUrl('');
    setEditLabel('');
  };

  const handleSave = () => {
    onChange(linksList);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal show={isOpen} onClose={handleCancel} size="lg">
      <Modal.Header>Manage Links</Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          {/* Existing Links List */}
          {linksList.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Saved Links ({linksList.length})</Label>
                <span className="text-xs text-gray-500">Click links to open, or edit/remove using the buttons</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {linksList.map((link, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    {editingIndex === index ? (
                      <div className="flex-1 space-y-2">
                        <TextInput
                          type="url"
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          placeholder="https://example.com"
                          sizing="sm"
                        />
                        <TextInput
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          placeholder="Link label (optional)"
                          sizing="sm"
                        />
                        <div className="flex gap-2">
                          <Button size="xs" color="success" onClick={() => handleSaveEdit(index)}>
                            <Check className="w-3 h-3 mr-1" />
                            Save
                          </Button>
                          <Button size="xs" color="gray" onClick={handleCancelEdit}>
                            <X className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-2 break-all"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-4 h-4 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              {link.label && (
                                <div className="font-medium text-gray-900">{link.label}</div>
                              )}
                              <div className={link.label ? 'text-sm text-gray-600' : ''}>
                                {link.url}
                              </div>
                            </div>
                          </a>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            size="xs"
                            color="light"
                            onClick={() => handleStartEdit(index)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="xs"
                            color="failure"
                            onClick={() => handleRemoveLink(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Link */}
          <div className="pt-4 border-t border-gray-200">
            <Label className="mb-3 text-base font-semibold">Add New Link</Label>
            <div className="space-y-3">
              <div>
                <Label htmlFor="url-input" className="mb-1 text-sm">URL *</Label>
                <TextInput
                  id="url-input"
                  type="url"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newLinkUrl.trim()) handleAddLink();
                  }}
                  placeholder="https://example.com"
                  sizing="md"
                />
              </div>
              <div>
                <Label htmlFor="label-input" className="mb-1 text-sm">Label (optional)</Label>
                <TextInput
                  id="label-input"
                  type="text"
                  value={newLinkLabel}
                  onChange={(e) => setNewLinkLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newLinkUrl.trim()) handleAddLink();
                  }}
                  placeholder="e.g., Documentation, GitHub Repo, etc."
                  sizing="md"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to use the website domain as label</p>
              </div>
              <Button
                onClick={handleAddLink}
                disabled={!newLinkUrl.trim()}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Link
              </Button>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleSave}>Save Changes</Button>
        <Button color="gray" onClick={handleCancel}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
