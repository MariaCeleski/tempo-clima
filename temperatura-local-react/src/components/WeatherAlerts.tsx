import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { WeatherAlert } from '../types/weather';

interface WeatherAlertsProps {
  alerts: WeatherAlert[];
}

const severityConfig = {
  low: {
    icon: '⚠️',
    borderClass: 'border-amber-400 dark:border-amber-500',
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    textClass: 'text-amber-800 dark:text-amber-200',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
    labelKey: 'alerts.low',
  },
  moderate: {
    icon: '🔶',
    borderClass: 'border-orange-400 dark:border-orange-500',
    bgClass: 'bg-orange-50 dark:bg-orange-950/30',
    textClass: 'text-orange-800 dark:text-orange-200',
    badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
    labelKey: 'alerts.moderate',
  },
  severe: {
    icon: '🚨',
    borderClass: 'border-red-500 dark:border-red-400',
    bgClass: 'bg-red-50 dark:bg-red-950/30',
    textClass: 'text-red-800 dark:text-red-200',
    badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
    labelKey: 'alerts.severe',
  },
};

export function WeatherAlerts({ alerts }: WeatherAlertsProps) {
  const { t } = useTranslation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (alerts.length === 0) return null;

  return (
    <div className="mb-4 space-y-2">
      {alerts.map((alert, index) => {
        const config = severityConfig[alert.severity];
        const isExpanded = expandedIndex === index;
        const isSevere = alert.severity === 'severe';

        return (
          <div
            key={`${alert.event}-${index}`}
            role={isSevere ? 'alert' : 'status'}
            className={`rounded-xl border-l-4 p-3 transition-all duration-200 ${config.borderClass} ${config.bgClass} ${isSevere ? 'animate-pulse-subtle' : ''}`}
          >
            <button
              type="button"
              onClick={() => setExpandedIndex(isExpanded ? null : index)}
              className="flex w-full items-center gap-2 text-left"
              aria-expanded={isExpanded}
              aria-controls={`alert-desc-${index}`}
            >
              <span className="text-lg flex-shrink-0" aria-hidden="true">
                {config.icon}
              </span>
              <span className={`flex-1 font-semibold text-sm ${config.textClass}`}>
                {alert.event}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.badgeClass}`}>
                {t(config.labelKey)}
              </span>
              <span
                className={`text-xs transition-transform duration-200 ${config.textClass} ${isExpanded ? 'rotate-180' : ''}`}
                aria-hidden="true"
              >
                ▼
              </span>
            </button>

            {isExpanded && (
              <p
                id={`alert-desc-${index}`}
                className={`mt-2 text-sm leading-relaxed ${config.textClass} opacity-90`}
              >
                {alert.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
