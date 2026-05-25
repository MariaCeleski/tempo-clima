import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface WeatherNotificationProps {
  message: string;
  onDismiss: () => void;
}

/**
 * In-app toast notification that appears at the top of the screen
 * when a weather change is detected. Auto-dismisses after 10 seconds.
 */
export function WeatherNotification({ message, onDismiss }: WeatherNotificationProps) {
  const { t } = useTranslation();

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, 10000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed top-4 left-1/2 z-50 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md animate-slide-down"
    >
      <div className="flex items-center gap-3 rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-950/80 px-4 py-3 shadow-lg backdrop-blur-sm">
        {/* Info icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 flex-shrink-0 text-blue-500 dark:text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        {/* Message */}
        <p className="flex-1 text-sm font-medium text-blue-800 dark:text-blue-200">
          {message}
        </p>

        {/* Close button */}
        <button
          onClick={onDismiss}
          aria-label={t('notification.dismiss')}
          className="flex-shrink-0 rounded-lg p-1 text-blue-400 dark:text-blue-300 transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
