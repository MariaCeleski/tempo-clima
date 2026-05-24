import { useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { ForecastDay } from '../types/weather';
import { celsiusToFahrenheit, roundToOneDecimal } from '../services/weatherApi';

interface TemperatureChartProps {
  forecast: ForecastDay[];
  unit: 'C' | 'F';
}

interface ChartDataPoint {
  label: string;
  max: number;
  min: number;
}

function formatDayLabel(dt: number): string {
  const date = new Date(dt * 1000);
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return `${days[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`;
}

function convertTemp(celsius: number, unit: 'C' | 'F'): number {
  return unit === 'F' ? celsiusToFahrenheit(celsius) : roundToOneDecimal(celsius);
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
  unit: 'C' | 'F';
}

function CustomTooltip({ active, payload, label, unit }: CustomTooltipProps) {
  const { t } = useTranslation();

  if (!active || !payload || payload.length === 0) return null;

  const symbol = unit === 'F' ? '°F' : '°C';
  const maxEntry = payload.find((p) => p.dataKey === 'max');
  const minEntry = payload.find((p) => p.dataKey === 'min');

  return (
    <div className="rounded-lg border border-slate-200 dark:border-white/20 bg-white dark:bg-slate-800 px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-slate-900 dark:text-white">{label}</p>
      {maxEntry && (
        <p className="text-xs text-pink-600 dark:text-pink-300">
          {t('chart.maxLabel', { value: `${maxEntry.value}${symbol}` })}
        </p>
      )}
      {minEntry && (
        <p className="text-xs text-blue-600 dark:text-blue-300">
          {t('chart.minLabel', { value: `${minEntry.value}${symbol}` })}
        </p>
      )}
    </div>
  );
}

export function TemperatureChart({ forecast, unit }: TemperatureChartProps) {
  const { t } = useTranslation();

  if (forecast.length === 0) return null;

  const data: ChartDataPoint[] = forecast.map((day) => ({
    label: formatDayLabel(day.dt),
    max: convertTemp(day.temp_max, unit),
    min: convertTemp(day.temp_min, unit),
  }));

  const symbol = unit === 'F' ? '°F' : '°C';

  // Build screen reader description
  const srDescription = data
    .map((d) => `${d.label}: ${t('chart.max').toLowerCase()} ${d.max}${symbol}, ${t('chart.min').toLowerCase()} ${d.min}${symbol}`)
    .join('. ');

  return (
    <section
      className="animate-fadeInUp mt-4 rounded-2xl border border-slate-200 dark:border-white/25 bg-white/80 dark:bg-white/10 p-4 shadow-lg dark:shadow-none backdrop-blur-md"
      aria-label={t('chart.sectionAria')}
    >
      {/* Visually hidden description for screen readers */}
      <p className="sr-only">
        {t('chart.srDescription', { data: srDescription })}
      </p>

      <h2 className="mb-3 text-center text-lg font-semibold text-slate-900 dark:text-white">
        {t('chart.title')}
      </h2>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-slate-200 dark:stroke-white/10"
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              className="fill-slate-600 dark:fill-white/70"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              className="fill-slate-600 dark:fill-white/70"
              tickLine={false}
              axisLine={false}
              unit={symbol}
              width={50}
            />
            <Tooltip content={<CustomTooltip unit={unit} />} />
            <Line
              type="monotone"
              dataKey="max"
              stroke="#f43f5e"
              strokeWidth={2}
              dot={{ r: 4, fill: '#f43f5e' }}
              activeDot={{ r: 6 }}
              name={t('chart.max')}
            />
            <Line
              type="monotone"
              dataKey="min"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4, fill: '#3b82f6' }}
              activeDot={{ r: 6 }}
              name={t('chart.min')}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex justify-center gap-4 text-xs">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-4 rounded-full bg-rose-500" aria-hidden="true" />
          <span className="text-slate-600 dark:text-white/70">{t('chart.max')}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-4 rounded-full bg-blue-500" aria-hidden="true" />
          <span className="text-slate-600 dark:text-white/70">{t('chart.min')}</span>
        </span>
      </div>
    </section>
  );
}
