import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ForecastDay, ForecastItem } from '../types/weather';
import { formatTemperature } from '../services/weatherApi';

interface ForecastCardProps {
  forecast: ForecastDay[];
  unit?: 'C' | 'F';
}

const DAYS_PER_PAGE = 3;

function formatDay(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return days[date.getDay()];
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

function formatHour(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return `${date.getHours().toString().padStart(2, '0')}:00`;
}

function PeriodDetail({ period, unit }: { period: ForecastItem; unit: 'C' | 'F' }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-white/5 px-3 py-2" role="listitem">
      <span className="text-xs text-slate-500 dark:text-white/70">{formatHour(period.dt)}</span>
      <img src={period.icon_url} alt={t('forecast.forecastAlt', { description: period.description })} className="h-8 w-8" />
      <span className="text-xs font-bold text-pink-600 dark:text-pink-300">{formatTemperature(period.temperature, unit)}</span>
      <span className="text-xs capitalize text-slate-500 dark:text-white/60">{period.description}</span>
      <span className="text-xs text-emerald-600 dark:text-emerald-300" aria-label={`${period.humidity}%`}>💧{period.humidity}%</span>
      <span className="text-xs text-blue-600 dark:text-blue-300" aria-label={`${period.wind_speed}`}>💨{period.wind_speed}</span>
    </div>
  );
}

function DayCard({ day, unit }: { day: ForecastDay; unit: 'C' | 'F' }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const dayLabel = `${formatDay(day.dt)} ${formatDate(day.dt)}`;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/15 bg-white/60 dark:bg-white/5 p-3 shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={day.icon_url} alt={t('forecast.forecastAlt', { description: day.description })} className="h-10 w-10" />
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {formatDay(day.dt)} <span className="text-slate-500 dark:text-white/60">{formatDate(day.dt)}</span>
            </p>
            <p className="text-xs capitalize text-purple-600 dark:text-purple-300">{day.description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-pink-600 dark:text-pink-300">{formatTemperature(day.temp_max, unit)}</p>
          <p className="text-xs text-blue-600 dark:text-blue-300">{formatTemperature(day.temp_min, unit)}</p>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-label={t('forecast.detailsAria', { action: expanded ? t('forecast.hideDetails') : t('forecast.showDetails'), day: dayLabel })}
        className="mt-2 w-full rounded-lg bg-slate-100 dark:bg-white/10 px-3 py-1.5 text-xs text-slate-600 dark:text-white/70 transition-all hover:bg-slate-200 dark:hover:bg-white/15 hover:text-slate-900 dark:hover:text-white"
      >
        {expanded ? t('forecast.hideDetails') : t('forecast.showDetails')}
      </button>

      {expanded && (
        <div className="mt-2 flex flex-col gap-1.5 animate-fadeInUp" role="list" aria-label={t('forecast.periodAria', { day: dayLabel })}>
          {day.periods.map((period) => (
            <PeriodDetail key={period.dt} period={period} unit={unit} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ForecastCard({ forecast, unit = 'C' }: ForecastCardProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);

  if (forecast.length === 0) return null;

  const totalPages = Math.ceil(forecast.length / DAYS_PER_PAGE);
  const start = page * DAYS_PER_PAGE;
  const visibleDays = forecast.slice(start, start + DAYS_PER_PAGE);

  const canGoBack = page > 0;
  const canGoForward = page < totalPages - 1;

  return (
    <section className="animate-fadeInUp mt-4 rounded-2xl border border-slate-200 dark:border-white/25 bg-white/80 dark:bg-white/10 p-4 shadow-lg dark:shadow-none backdrop-blur-md" aria-label={t('forecast.sectionAria')}>
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setPage((p) => p - 1)}
          disabled={!canGoBack}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white transition-all hover:bg-slate-200 dark:hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label={t('forecast.previousDays')}
        >
          ←
        </button>
        <h2 className="text-center text-lg font-semibold text-slate-900 dark:text-white">
          {t('forecast.title')}
        </h2>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!canGoForward}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white transition-all hover:bg-slate-200 dark:hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label={t('forecast.nextDays')}
        >
          →
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {visibleDays.map((day) => (
          <DayCard key={day.date} day={day} unit={unit} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-3 flex justify-center gap-1.5" role="navigation" aria-label={t('forecast.paginationAria')}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`h-2 w-2 rounded-full transition-all ${
                i === page ? 'bg-pink-500 dark:bg-pink-400 w-4' : 'bg-slate-300 dark:bg-white/30'
              }`}
              aria-label={t('forecast.pageAria', { current: i + 1, total: totalPages })}
              aria-current={i === page ? 'page' : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
