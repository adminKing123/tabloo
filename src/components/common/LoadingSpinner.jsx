import { Spinner } from 'flowbite-react';

/**
 * Loading Spinner Component
 */
export default function LoadingSpinner({ size = 'lg', message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Spinner size={size} />
      {message && (
        <p className="mt-4 text-gray-600">{message}</p>
      )}
    </div>
  );
}
