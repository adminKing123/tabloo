import { Card, Button, Dropdown } from 'flowbite-react';
import { MoreVertical, Edit, Trash2, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDateTime } from '../../utils/helpers';
import ProjectIcon from '../common/ProjectIcon';

/**
 * Project Card Component
 */
export default function ProjectCard({ project, onEdit, onDelete }) {
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate(`/project/${project.id}`);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0">
            <ProjectIcon icon={project.icon || 'Folder'} className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {project.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-wrap">
              {project.description || 'No description'}
            </p>
          </div>
        </div>
        
        <Dropdown
          label=""
          dismissOnClick={true}
          renderTrigger={() => (
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        >
          <Dropdown.Item icon={Edit} onClick={() => onEdit(project)}>
            Edit
          </Dropdown.Item>
          <Dropdown.Item icon={Trash2} onClick={() => onDelete(project)}>
            Delete
          </Dropdown.Item>
        </Dropdown>
      </div>

      {project.color && (
        <div
          className="h-2 rounded-full mt-3"
          style={{ backgroundColor: project.color }}
        />
      )}

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Updated {formatDateTime(project.updatedAt)}
        </span>
        <Button size="sm" color="blue" onClick={handleOpen}>
          <FolderOpen className="w-4 h-4 mr-2" />
          Open
        </Button>
      </div>
    </Card>
  );
}
