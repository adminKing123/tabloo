import { Sidebar as FlowbiteSidebar } from 'flowbite-react';
import { Home, FolderOpen, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../../store/store';
import ProjectIcon from '../common/ProjectIcon';

/**
 * Application Sidebar Component
 */
export default function Sidebar() {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar, projects } = useStore();

  if (!sidebarOpen) {
    return (
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
      >
        <Menu className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-gray-50 border-r border-gray-200 z-40">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Tabloo</h1>
          <button
            onClick={toggleSidebar}
            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-x-hidden overflow-y-auto">
          <FlowbiteSidebar aria-label="Navigation">
            <FlowbiteSidebar.Items>
              <FlowbiteSidebar.ItemGroup>
                <FlowbiteSidebar.Item
                  as={Link}
                  to="/"
                  icon={Home}
                  active={location.pathname === '/'}
                >
                  Workspace
                </FlowbiteSidebar.Item>
              </FlowbiteSidebar.ItemGroup>

              {projects.length > 0 && (
                <FlowbiteSidebar.ItemGroup>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Projects
                  </div>
                  {projects.slice(0, 10).map((project) => (
                    <FlowbiteSidebar.Item
                      key={project.id}
                      as={Link}
                      to={`/project/${project.id}`}
                      icon={FolderOpen}
                      active={location.pathname === `/project/${project.id}`}
                    >
                      <div className="flex items-center gap-2">
                        <ProjectIcon icon={project.icon || 'Folder'} className="w-4 h-4" />
                        <span className="break-words">{project.name}</span>
                      </div>
                    </FlowbiteSidebar.Item>
                  ))}
                </FlowbiteSidebar.ItemGroup>
              )}
            </FlowbiteSidebar.Items>
          </FlowbiteSidebar>
        </nav>
      </div>
    </div>
  );
}
