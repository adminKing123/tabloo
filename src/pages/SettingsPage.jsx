import { Button, Card } from 'flowbite-react';
import { ChevronLeft, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import Layout from '../components/layout/Layout';

/**
 * Settings Page - Application settings and preferences
 */
export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useStore();
  const isDark = theme === 'dark';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            color="light"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your application preferences
            </p>
          </div>
        </div>

        {/* Appearance Settings */}
        <Card className="mb-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Appearance
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Customize how Tabloo looks to you
              </p>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                {isDark ? (
                  <div className="p-2 bg-gray-700 rounded-lg">
                    <Moon className="w-5 h-5 text-blue-400" />
                  </div>
                ) : (
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Sun className="w-5 h-5 text-yellow-600" />
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Theme
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Currently using {isDark ? 'dark' : 'light'} mode
                  </div>
                </div>
              </div>
              <Button
                onClick={toggleTheme}
                color={isDark ? 'light' : 'dark'}
              >
                Switch to {isDark ? 'Light' : 'Dark'} Mode
              </Button>
            </div>
          </div>
        </Card>

        {/* More settings sections can be added here in the future */}
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              More settings coming soon...
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
