import { Alert } from 'flowbite-react';
import { AlertCircle } from 'lucide-react';

/**
 * Error Alert Component
 */
export default function ErrorAlert({ message, onClose }) {
  if (!message) return null;

  return (
    <Alert
      color="failure"
      icon={AlertCircle}
      onDismiss={onClose}
      className="mb-4"
    >
      <span className="font-medium">Error!</span> {message}
    </Alert>
  );
}
