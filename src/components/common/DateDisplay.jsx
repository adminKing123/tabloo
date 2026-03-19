import { Calendar, Clock } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

/**
 * Get relative time string with weekday names
 */
const getRelativeTime = (date) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Start of today
  
  const then = new Date(date);
  then.setHours(0, 0, 0, 0); // Start of that day
  
  const diffTime = now - then;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Today
  if (diffDays === 0) return 'Today';
  
  // Yesterday
  if (diffDays === 1) return 'Yesterday';
  
  // Tomorrow
  if (diffDays === -1) return 'Tomorrow';
  
  // Within this week (past)
  if (diffDays > 1 && diffDays <= 6) {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  }
  
  // Within next week (future)
  if (diffDays < -1 && diffDays >= -6) {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  }
  
  // More than a week - use absolute date
  return null;
};

/**
 * Check if date is upcoming/recent to apply special styling
 */
const getDateStyle = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diffTime = then - now;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Upcoming dates (future)
  if (diffDays >= 0 && diffDays <= 7) {
    return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
  }
  
  // Recent past (within 7 days)
  if (diffDays < 0 && diffDays >= -7) {
    return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
  }
  
  // Default
  return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };
};

/**
 * Date Display Component with improved UI
 * 
 * @param {string} date - ISO date string
 * @param {boolean} compact - Use compact mode (for table cells)
 * @param {boolean} showTime - Show time along with date
 */
export default function DateDisplay({ date, compact = false, showTime = false }) {
  if (!date) {
    return <span className="text-gray-400 text-sm">No date</span>;
  }

  const relativeTime = getRelativeTime(date);
  const absoluteDate = formatDate(date);
  const dateObj = new Date(date);
  const timeString = dateObj.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  const style = getDateStyle(date);

  if (compact) {
    // Compact mode for table cells
    return (
      <div 
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${style.bg} ${style.text} border ${style.border}`}
        title={showTime ? `${absoluteDate} at ${timeString}` : absoluteDate}
      >
        <Calendar className="w-3 h-3 flex-shrink-0" />
        <span className="text-xs font-medium whitespace-nowrap">
          {relativeTime || absoluteDate}
        </span>
        {showTime && (
          <>
            <span className="text-gray-400">•</span>
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span className="text-xs">{timeString}</span>
          </>
        )}
      </div>
    );
  }

  // Full display mode for detail views
  return (
    <div className="flex flex-col gap-1">
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${style.bg} ${style.text} border ${style.border} w-fit`}>
        <Calendar className="w-4 h-4 flex-shrink-0" />
        <div className="flex flex-col">
          {relativeTime && (
            <span className="text-sm font-semibold">
              {relativeTime}
            </span>
          )}
          <span className={relativeTime ? "text-xs" : "text-sm font-medium"}>
            {absoluteDate}
          </span>
        </div>
      </div>
      {showTime && (
        <div className="flex items-center gap-1.5 text-gray-500 text-xs ml-1">
          <Clock className="w-3 h-3" />
          <span>{timeString}</span>
        </div>
      )}
    </div>
  );
}
