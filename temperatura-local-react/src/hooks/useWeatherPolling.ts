import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchWeather, getApiLang } from '../services/weatherApi';
import type { WeatherData } from '../types/weather';

interface UseWeatherPollingResult {
  notification: string | null;
  dismiss: () => void;
}

/**
 * Custom hook that polls weather data at a given interval and triggers
 * an in-app notification when significant weather changes are detected.
 *
 * Changes are considered significant if:
 * - Temperature changed by more than 3°C
 * - Weather condition (description) changed
 *
 * Only polls when the tab is visible (Page Visibility API).
 */
export function useWeatherPolling(
  cityName: string | null,
  lang: string,
  intervalMs: number = 1800000 // 30 minutes
): UseWeatherPollingResult {
  const { t } = useTranslation();
  const [notification, setNotification] = useState<string | null>(null);
  const previousDataRef = useRef<Pick<WeatherData, 'temperature' | 'description'> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const dismiss = useCallback(() => {
    setNotification(null);
  }, []);

  useEffect(() => {
    if (!cityName) {
      previousDataRef.current = null;
      return;
    }

    const apiLang = getApiLang(lang);

    async function pollWeather() {
      if (!cityName) return;

      // Only poll when tab is visible
      if (document.hidden) return;

      try {
        const data = await fetchWeather(cityName, apiLang);
        const prev = previousDataRef.current;

        if (prev) {
          const tempDiff = Math.abs(data.temperature - prev.temperature);
          const conditionChanged = data.description !== prev.description;

          if (tempDiff > 3 || conditionChanged) {
            const message = t('notification.weatherChanged', {
              temp: `${data.temperature}°C`,
              description: data.description,
            });
            setNotification(message);
          }
        }

        // Update previous data reference
        previousDataRef.current = {
          temperature: data.temperature,
          description: data.description,
        };
      } catch {
        // Silently fail — polling should not interfere with the main app
      }
    }

    // Set initial previous data from the first poll (skip notification on first run)
    // We fetch once to establish baseline, then poll at intervals
    fetchWeather(cityName, apiLang)
      .then((data) => {
        previousDataRef.current = {
          temperature: data.temperature,
          description: data.description,
        };
      })
      .catch(() => {
        // Silently fail
      });

    // Start interval
    intervalRef.current = setInterval(pollWeather, intervalMs);

    // Handle visibility change — poll immediately when tab becomes visible
    function handleVisibilityChange() {
      if (!document.hidden) {
        pollWeather();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [cityName, lang, intervalMs, t]);

  // Reset when city changes
  useEffect(() => {
    setNotification(null);
    previousDataRef.current = null;
  }, [cityName]);

  return { notification, dismiss };
}
