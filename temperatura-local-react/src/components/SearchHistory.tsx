import { useTranslation } from 'react-i18next';

interface SearchHistoryProps {
  history: string[];
  onSelect: (city: string) => void;
  onClear: () => void;
}

export function SearchHistory({ history, onSelect, onClear }: SearchHistoryProps) {
  const { t } = useTranslation();

  if (history.length === 0) return null;

  return (
    <nav className="mt-3 rounded-lg border border-slate-200 dark:border-white/15 bg-white/70 dark:bg-white/5 p-3 shadow-sm dark:shadow-none backdrop-blur-sm" aria-label={t('history.title')}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-white/60" id="search-history-label">{t('history.title')}</span>
        <button
          onClick={onClear}
          className="text-xs text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/70 transition-colors"
          aria-label={t('history.clearAria')}
        >
          {t('history.clear')}
        </button>
      </div>
      <div className="flex flex-wrap gap-2" role="list" aria-labelledby="search-history-label">
        {history.map((city) => (
          <button
            key={city}
            role="listitem"
            onClick={() => onSelect(city)}
            aria-label={t('history.searchAria', { city })}
            className="rounded-full border border-slate-200 dark:border-white/20 bg-white/80 dark:bg-white/10 px-3 py-1 text-xs text-slate-700 dark:text-white/80 transition-all hover:bg-slate-100 dark:hover:bg-white/20 hover:text-slate-900 dark:hover:text-white"
          >
            {city}
          </button>
        ))}
      </div>
    </nav>
  );
}
