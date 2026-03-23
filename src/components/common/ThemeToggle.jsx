import { Moon, Sun } from 'lucide-react';
import { useStore } from '../../store/store';

/**
 * Theme Toggle Component
 * Switches between light and dark modes
 */
export default function ThemeToggle({ compact = false }) {
  const { theme, toggleTheme } = useStore();
  const isDark = theme === 'dark';

  if (compact) {
    // Compact mode - Icon button only
    return (
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        ) : (
          <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        )}
      </button>
    );
  }

  // Full mode - Icon with label
  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <>
          <Sun className="w-5 h-5" />
          <span className="text-sm font-medium">Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="w-5 h-5" />
          <span className="text-sm font-medium">Dark Mode</span>
        </>
      )}
    </button>
  );
}
