import { Button } from 'flowbite-react';
import { Check, X } from 'lucide-react';

/**
 * Inline Editable Text Input
 */
export default function EditableText({ 
  value, 
  onSave, 
  onCancel,
  placeholder = 'Enter text...',
  type = 'text',
  className = '' 
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && type === 'text') {
      onSave(e.target.value);
    } else if (e.key === 'Escape') {
      onCancel?.();
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        onBlur={(e) => onSave(e.target.value)}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        autoFocus
      />
    </div>
  );
}

/**
 * Inline Editable Textarea
 */
export function EditableTextarea({ 
  value, 
  onSave, 
  onCancel,
  placeholder = 'Enter text...',
  rows = 3,
  className = '' 
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <textarea
        defaultValue={value}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        autoFocus
      />
      <div className="flex gap-2">
        <Button
          size="xs"
          color="success"
          onClick={(e) => {
            const textarea = e.target.closest('div').previousSibling;
            onSave(textarea.value);
          }}
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          size="xs"
          color="gray"
          onClick={onCancel}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
