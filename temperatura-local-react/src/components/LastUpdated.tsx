import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LastUpdatedProps {
  timestamp: Date;
}

export function LastUpdated({ timestamp }: LastUpdatedProps) {
  const { t } = useTranslation();
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  function getRelativeTime(): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) {
      return t('lastUpdated.now');
    }
    if (diffMin < 60) {
      return t('lastUpdated.minutes', { count: diffMin });
    }
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours === 1) {
      return t('lastUpdated.hour');
    }
    return t('lastUpdated.hours', { count: diffHours });
  }

  return (
    <p className="mt-3 text-center text-xs text-slate-500/70 dark:text-white/40">
      {getRelativeTime()}
    </p>
  );
}
