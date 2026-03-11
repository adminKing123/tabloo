import { useStore } from '../../store/store';

/**
 * Main Layout Component
 */
export default function Layout({ children }) {
  const { sidebarOpen } = useStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
