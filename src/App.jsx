import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Flowbite } from 'flowbite-react';
import { useStore } from './store/store';
import Sidebar from './components/layout/Sidebar';
import WorkspacePage from './pages/WorkspacePage';
import ProjectPage from './pages/ProjectPage';
import TablePage from './pages/TablePage';
import GlobalTablePage from './pages/GlobalTablePage';
import RecordPage from './pages/RecordPage';
import SettingsPage from './pages/SettingsPage';
import { initializeDefaultTemplates, DEFAULT_TEMPLATES } from './templates/defaultTemplates';
import './App.css';

/**
 * Main App Component
 */
function App() {
  const { initialize, templates, createTemplate, theme, setTheme } = useStore();
  const templatesInitialized = useRef(false);

  // Initialize theme on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, [setTheme]);

  useEffect(() => {
    const initApp = async () => {
      // Initialize the app (load data from IndexedDB)
      await initialize();
    };

    initApp();
  }, [initialize]);

  // Initialize templates after they're loaded (only once)
  useEffect(() => {
    const initTemplates = async () => {
      if (templates.length === 0 && !templatesInitialized.current) {
        templatesInitialized.current = true;
        await initializeDefaultTemplates(createTemplate);
      }
    };

    initTemplates();
  }, [templates.length, createTemplate]);

  return (
    <Flowbite theme={{ mode: theme }}>
      <BrowserRouter>
        <div className="app-container">
          <Sidebar />
          <Routes>
            <Route path="/" element={<WorkspacePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/global-table/:tableId" element={<GlobalTablePage />} />
            <Route path="/project/:projectId" element={<ProjectPage />} />
            <Route path="/project/:projectId/table/:tableId" element={<TablePage />} />
            <Route path="/project/:projectId/table/:tableId/record/:recordId" element={<RecordPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </Flowbite>
  );
}

export default App;

