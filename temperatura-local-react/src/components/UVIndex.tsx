import { useTranslation } from 'react-i18next';

interface UVIndexProps {
  uvIndex: number;
}

interface UVCategory {
  labelKey: string;
  protectionKey: string;
  color: string;
  barColor: string;
  emoji: string;
}

function getUVCategory(uv: number): UVCategory {
  if (uv <= 2) {
    return {
      labelKey: 'uv.low',
      protectionKey: 'uv.protection.low',
      color: 'text-emerald-600 dark:text-emerald-300',
      barColor: '#22c55e',
      emoji: '😎',
    };
  }
  if (uv <= 5) {
    return {
      labelKey: 'uv.moderate',
      protectionKey: 'uv.protection.moderate',
      color: 'text-yellow-600 dark:text-yellow-300',
      barColor: '#eab308',
      emoji: '🧴',
    };
  }
  if (uv <= 7) {
    return {
      labelKey: 'uv.high',
      protectionKey: 'uv.protection.high',
      color: 'text-orange-600 dark:text-orange-300',
      barColor: '#f97316',
      emoji: '⚠️',
    };
  }
  if (uv <= 10) {
    return {
      labelKey: 'uv.veryHigh',
      protectionKey: 'uv.protection.high',
      color: 'text-red-600 dark:text-red-300',
      barColor: '#ef4444',
      emoji: '🛑',
    };
  }
  return {
    labelKey: 'uv.extreme',
    protectionKey: 'uv.protection.high',
    color: 'text-purple-600 dark:text-purple-300',
    barColor: '#a855f7',
    emoji: '☠️',
  };
}

export function UVIndex({ uvIndex }: UVIndexProps) {
  const { t } = useTranslation();
  const category = getUVCategory(uvIndex);
  const percentage = Math.min((uvIndex / 11) * 100, 100);

  return (
    <div className="flex flex-col items-center gap-1 text-sm" role="status" aria-label={`UV: ${uvIndex} - ${t(category.labelKey)}`}>
      <div className="flex items-center gap-2">
        <span className="text-slate-500 dark:text-white/60">UV:</span>
        <span className={`font-medium ${category.color}`}>
          <span aria-hidden="true">{category.emoji}</span> {uvIndex} — {t(category.labelKey)}
        </span>
      </div>

      <div className="w-full max-w-[180px] h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-white/20" aria-hidden="true">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            background: 'linear-gradient(to right, #22c55e, #eab308, #f97316, #ef4444, #a855f7)',
          }}
        />
      </div>

      <p className="text-xs text-slate-500 dark:text-white/50 text-center">
        {t(category.protectionKey)}
      </p>
    </div>
  );
}
