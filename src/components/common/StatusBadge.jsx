import { Badge } from 'flowbite-react';

/**
 * Status Badge Component with color coding
 */
export default function StatusBadge({ label, color = '#6B7280' }) {
  const getContrastColor = (hexColor) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
      style={{
        backgroundColor: color,
        color: getContrastColor(color)
      }}
    >
      {label}
    </span>
  );
}
