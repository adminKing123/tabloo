import { Sidebar as FlowbiteSidebar } from 'flowbite-react';
import { Home, FolderOpen, Menu, X, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../../store/store';
import ProjectIcon from '../common/ProjectIcon';

/**
 * Application Sidebar Component
 */
export default function Sidebar() {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar, projects } = useStore();

  return (
    <div 
      className={`fixed top-0 left-0 h-screen bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-40 transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={() => !sidebarOpen && toggleSidebar()}
      onMouseLeave={() => sidebarOpen && toggleSidebar()}
    >
      <div className="flex flex-col h-full">
        {/* Header - Fixed height for consistent alignment */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 px-4">
          {sidebarOpen ? (
            <>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white flex-1">Tabloo</h1>
              <button
                onClick={toggleSidebar}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </>
          ) : (
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Open sidebar"
            >
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="py-2">
            {/* Workspace Link */}
            <Link
              to="/"
              className={`h-10 flex items-center gap-3 px-3 mx-2 my-1 rounded-lg transition-colors ${
                location.pathname === '/'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
              } ${!sidebarOpen ? 'justify-center' : ''}`}
              title={!sidebarOpen ? 'Workspace' : ''}
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium whitespace-nowrap overflow-hidden">Workspace</span>}
            </Link>

            {/* Projects Section */}
            {projects.length > 0 && (
              <>
                {/* Fixed height header to prevent icon shifting */}
                <div className="h-10 flex items-center justify-center px-3 mt-2 mb-1">
                  {sidebarOpen ? (
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase w-full">
                      Projects
                    </span>
                  ) : (
                    <div className="w-8 h-px bg-gray-300 dark:bg-gray-700"></div>
                  )}
                </div>
                
                {projects.slice(0, 10).map((project) => (
                  <Link
                    key={project.id}
                    to={`/project/${project.id}`}
                    className={`h-10 flex items-center gap-3 px-3 mx-2 my-1 rounded-lg transition-colors ${
                      location.pathname === `/project/${project.id}`
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                    } ${!sidebarOpen ? 'justify-center' : ''}`}
                    title={!sidebarOpen ? project.name : ''}
                  >
                    <ProjectIcon 
                      icon={project.icon || 'Folder'} 
                      className="w-5 h-5 flex-shrink-0" 
                    />
                    {sidebarOpen && (
                      <span className="font-medium truncate overflow-hidden">{project.name}</span>
                    )}
                  </Link>
                ))}
              </>
            )}
          </div>
        </nav>

        {/* Settings at Bottom */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-2">
          <Link
            to="/settings"
            className={`h-10 flex items-center gap-3 px-3 mx-0 rounded-lg transition-colors ${
              location.pathname === '/settings'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
            } ${!sidebarOpen ? 'justify-center' : ''}`}
            title={!sidebarOpen ? 'Settings' : ''}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium whitespace-nowrap overflow-hidden">Settings</span>}
          </Link>
        </div>
      </div>
    </div>
  );
}
