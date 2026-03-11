import ProjectIcon from './ProjectIcon';
import { PROJECT_ICONS } from '../../utils/constants';

/**
 * IconPicker Component
 * Displays a grid of selectable icons for projects
 */
export default function IconPicker({ selectedIcon, onSelect, className = '' }) {
  return (
    <div className={`grid grid-cols-6 gap-2 ${className}`}>
      {PROJECT_ICONS.map((iconName) => (
        <button
          key={iconName}
          type="button"
          className={`p-3 rounded-lg border-2 transition-all ${
            selectedIcon === iconName
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onSelect(iconName)}
        >
          <ProjectIcon icon={iconName} className="w-6 h-6 mx-auto" />
        </button>
      ))}
    </div>
  );
}
